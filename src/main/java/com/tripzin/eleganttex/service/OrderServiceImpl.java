package com.tripzin.eleganttex.service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.AreaBreak;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import com.tripzin.eleganttex.config.FileStorageConfig;
import com.tripzin.eleganttex.dto.request.OrderProductRequest;
import com.tripzin.eleganttex.dto.request.OrderRequest;
import com.tripzin.eleganttex.dto.response.*;
import com.tripzin.eleganttex.entity.*;
import com.tripzin.eleganttex.exception.ResourceNotFoundException;
import com.tripzin.eleganttex.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderProductRepository orderProductRepository;
    private final OrderProductImageRepository orderProductImageRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final MarketplaceRepository marketplaceRepository;
    private final FabricRepository fabricRepository;
    private final FileStorageRepository fileStorageRepository;
    private final FileStorageService fileStorageService;
    private final FileStorageConfig fileStorageConfig;
    private final S3Service s3Service;
    private final UserRepository userRepository;
    private final CustomerService customerService;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest orderRequest, Long userId, List<MultipartFile> files) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        log.info("Creating new order for marketplace ID: {}", orderRequest.getMarketplaceId());
        
        // Find marketplace
        Marketplace marketplace = marketplaceRepository.findById(orderRequest.getMarketplaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Marketplace not found with ID: " + orderRequest.getMarketplaceId()));
        
        // Find or create customer
        Customer customer;
        if (orderRequest.getCustomerId() != null) {
            // Use existing customer
            customer = customerService.getCustomerEntityById(orderRequest.getCustomerId());
            log.info("Using existing customer with ID: {}", customer.getId());
        } else if (orderRequest.getCustomerData() != null) {
            // Create new customer or find by phone
            CustomerResponse customerResponse = customerService.findOrCreateCustomer(orderRequest.getCustomerData());
            customer = customerService.getCustomerEntityById(customerResponse.getId());
            log.info("Found or created customer with ID: {}", customer.getId());
        } else {
            throw new IllegalArgumentException("Either customerId or customerData must be provided");
        }
        
        // Calculate total amount from products
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OrderProductRequest productRequest : orderRequest.getProducts()) {
            BigDecimal productTotal = productRequest.getPrice().multiply(new BigDecimal(productRequest.getQuantity()));
            totalAmount = totalAmount.add(productTotal);
        }
        // Add delivery charge to total
        totalAmount = totalAmount.add(orderRequest.getDeliveryCharge());
        
        // Create order with a temporary order number to avoid constraint violation
        String tempOrderNumber = "TEMP-" + System.currentTimeMillis();
        
        Order order = Order.builder()
                .marketplace(marketplace)
                .customer(customer)
                .deliveryChannel(orderRequest.getDeliveryChannel())
                .deliveryCharge(orderRequest.getDeliveryCharge())
                .deliveryDate(orderRequest.getDeliveryDate())
                .status("Created")
                .totalAmount(totalAmount) // Set the calculated total amount
                .createdBy(currentUser)
                .orderNumber(tempOrderNumber) // Set temporary order number
                .build();
        
        // Save the order first to get the ID
        Order savedOrder = orderRepository.save(order);
        
        // Generate and set the custom order number
        String orderNumber = String.format("ET-ORD-%04d", savedOrder.getId());
        savedOrder.setOrderNumber(orderNumber);
        
        // Save again with the proper order number
        savedOrder = orderRepository.save(savedOrder);
        
        // Create initial status history
        OrderStatusHistory statusHistory = OrderStatusHistory.builder()
                .order(savedOrder)
                .status("Created")
                .notes("Order created")
                .updatedBy(currentUser)
                .build();
        
        orderStatusHistoryRepository.save(statusHistory);
        
        // Create products
        for (OrderProductRequest productRequest : orderRequest.getProducts()) {
            Fabric fabric = fabricRepository.findById(productRequest.getFabricId())
                    .orElseThrow(() -> new ResourceNotFoundException("Fabric not found with ID: " + productRequest.getFabricId()));
            
            OrderProduct product = OrderProduct.builder()
                    .order(savedOrder)
                    .productType(productRequest.getProductType())
                    .fabric(fabric)
                    .quantity(productRequest.getQuantity())
                    .price(productRequest.getPrice())
                    .description(productRequest.getDescription())
                    .build();
            
            OrderProduct savedProduct = orderProductRepository.save(product);
            
            // Handle existing images
            if (productRequest.getImageIds() != null && !productRequest.getImageIds().isEmpty()) {
                for (Long imageId : productRequest.getImageIds()) {
                    
                    OrderProductImage image = OrderProductImage.builder()
                            .orderProduct(savedProduct)
                            .imageId(imageId)
                            .imageUrl("/files/" + imageId)
                            .build();
                    
                    orderProductImageRepository.save(image);
                }
            }
            
            // Handle new images from files
            if (files != null && !files.isEmpty()) {
                for (MultipartFile file : files) {
                    try {
                        // Save image to file storage
                        FileStorage fileStorage = fileStorageService.storeFile(
                                file,
                                "ORDER_PRODUCT",
                                savedProduct.getId()
                        );
                        
                        // Create order product image
                        OrderProductImage image = OrderProductImage.builder()
                                .orderProduct(savedProduct)
                                .imageId(fileStorage.getId())
                                .imageUrl("/files/" + fileStorage.getId())
                                .build();
                        
                        orderProductImageRepository.save(image);
                    } catch (Exception e) {
                        log.error("Error saving product image", e);
                        // Continue with other images
                    }
                }
            }
            
            // Handle new images from base64
            if (productRequest.getTempImageBase64() != null && !productRequest.getTempImageBase64().isEmpty()) {
                for (String base64Image : productRequest.getTempImageBase64()) {
                    try {
                        // Process base64 image
                        // This would be implemented in a real application
                        log.info("Processing base64 image for product ID: {}", savedProduct.getId());
                        
                        // For now, we'll skip this since we're using MultipartFile
                    } catch (Exception e) {
                        log.error("Error saving product image from base64", e);
                    }
                }
            }
        }
        
        return mapOrderToResponse(savedOrder);
    }

    @Override
    public OrderResponse getOrderById(Long id) {
        log.info("Getting order by ID: {}", id);
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));
        
        return mapOrderToResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse updateOrder(Long id, OrderRequest orderRequest, Long userId, List<MultipartFile> files) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        log.info("Updating order with ID: {}", id);
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));
        
        // Find marketplace
        Marketplace marketplace = marketplaceRepository.findById(orderRequest.getMarketplaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Marketplace not found with ID: " + orderRequest.getMarketplaceId()));
        
        // Find or update customer
        Customer customer;
        if (orderRequest.getCustomerId() != null) {
            // Use existing customer
            customer = customerService.getCustomerEntityById(orderRequest.getCustomerId());
            log.info("Using existing customer with ID: {}", customer.getId());
        } else if (orderRequest.getCustomerData() != null) {
            // Create new customer or find by phone
            CustomerResponse customerResponse = customerService.findOrCreateCustomer(orderRequest.getCustomerData());
            customer = customerService.getCustomerEntityById(customerResponse.getId());
            log.info("Found or created customer with ID: {}", customer.getId());
        } else {
            throw new IllegalArgumentException("Either customerId or customerData must be provided");
        }
        
        // Calculate total amount from products
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OrderProductRequest productRequest : orderRequest.getProducts()) {
            BigDecimal productTotal = productRequest.getPrice().multiply(new BigDecimal(productRequest.getQuantity()));
            totalAmount = totalAmount.add(productTotal);
        }
        // Add delivery charge to total
        totalAmount = totalAmount.add(orderRequest.getDeliveryCharge());
        
        // Update order fields
        order.setMarketplace(marketplace);
        order.setCustomer(customer);
        order.setDeliveryChannel(orderRequest.getDeliveryChannel());
        order.setDeliveryCharge(orderRequest.getDeliveryCharge());
        order.setDeliveryDate(orderRequest.getDeliveryDate());
        order.setTotalAmount(totalAmount); // Set the calculated total amount
        
        Order savedOrder = orderRepository.save(order);
        
        // Get existing products
        List<OrderProduct> existingProducts = orderProductRepository.findByOrderId(id);
        Map<Long, OrderProduct> existingProductMap = new HashMap<>();
        for (OrderProduct existingProduct : existingProducts) {
            if (existingProduct.getId() != null) {
                existingProductMap.put(existingProduct.getId(), existingProduct);
            }
        }
        
        // Track products to keep
        Set<Long> productsToKeep = new HashSet<>();
        
        // Update or create products
        for (OrderProductRequest productRequest : orderRequest.getProducts()) {
            OrderProduct product;
            
            // Check if this is an existing product or a new one
            if (productRequest.getId() != null && existingProductMap.containsKey(productRequest.getId())) {
                // Update existing product
                product = existingProductMap.get(productRequest.getId());
                productsToKeep.add(product.getId());
                
                // Update product fields
                Fabric fabric = fabricRepository.findById(productRequest.getFabricId())
                        .orElseThrow(() -> new ResourceNotFoundException("Fabric not found with ID: " + productRequest.getFabricId()));
                
                product.setProductType(productRequest.getProductType());
                product.setFabric(fabric);
                product.setQuantity(productRequest.getQuantity());
                product.setPrice(productRequest.getPrice());
                product.setDescription(productRequest.getDescription());
                
                // Save updated product
                product = orderProductRepository.save(product);
                
                // Get existing images
                List<OrderProductImage> existingImages = orderProductImageRepository.findByOrderProductId(product.getId());
                Map<Long, OrderProductImage> existingImageMap = new HashMap<>();
                for (OrderProductImage existingImage : existingImages) {
                    existingImageMap.put(existingImage.getImageId(), existingImage);
                }
                
                // Track images to keep
                Set<Long> imagesToKeep = new HashSet<>();
                
                // Handle existing images
                if (productRequest.getImageIds() != null && !productRequest.getImageIds().isEmpty()) {
                    for (Long imageId : productRequest.getImageIds()) {
                        // Check if image already exists for this product
                        if (existingImageMap.containsKey(imageId)) {
                            // Keep existing image
                            imagesToKeep.add(imageId);
                        } else {
                            // Verify image exists
                            FileStorage fileStorage = fileStorageRepository.findById(imageId)
                                    .orElseThrow(() -> new ResourceNotFoundException("Image not found with ID: " + imageId));
                            
                            // Create new image reference
                            OrderProductImage image = OrderProductImage.builder()
                                    .orderProduct(product)
                                    .imageId(imageId)
                                    .imageUrl("/files/" + imageId)
                                    .build();
                            
                            orderProductImageRepository.save(image);
                            imagesToKeep.add(imageId);
                        }
                    }
                }
                
                // Remove images that are no longer needed
                for (OrderProductImage existingImage : existingImages) {
                    if (!imagesToKeep.contains(existingImage.getImageId())) {
                        orderProductImageRepository.delete(existingImage);
                    }
                }
            } else {
                // Create new product
                Fabric fabric = fabricRepository.findById(productRequest.getFabricId())
                        .orElseThrow(() -> new ResourceNotFoundException("Fabric not found with ID: " + productRequest.getFabricId()));
                
                product = OrderProduct.builder()
                        .order(savedOrder)
                        .productType(productRequest.getProductType())
                        .fabric(fabric)
                        .quantity(productRequest.getQuantity())
                        .price(productRequest.getPrice())
                        .description(productRequest.getDescription())
                        .build();
                
                product = orderProductRepository.save(product);
                
                // Handle existing images
                if (productRequest.getImageIds() != null && !productRequest.getImageIds().isEmpty()) {
                    for (Long imageId : productRequest.getImageIds()) {
                        // Verify image exists
                        FileStorage fileStorage = fileStorageRepository.findById(imageId)
                                .orElseThrow(() -> new ResourceNotFoundException("Image not found with ID: " + imageId));
                        
                        OrderProductImage image = OrderProductImage.builder()
                                .orderProduct(product)
                                .imageId(imageId)
                                .imageUrl("/files/" + imageId)
                                .build();
                        
                        orderProductImageRepository.save(image);
                    }
                }
            }
            
            // Handle new images from files
            if (files != null && !files.isEmpty()) {
                for (MultipartFile file : files) {
                    try {
                        // Save image to file storage
                        FileStorage fileStorage = fileStorageService.storeFile(
                                file,
                                "ORDER_PRODUCT",
                                product.getId()
                        );
                        
                        // Create order product image
                        OrderProductImage image = OrderProductImage.builder()
                                .orderProduct(product)
                                .imageId(fileStorage.getId())
                                .imageUrl("/files/" + fileStorage.getId())
                                .build();
                        
                        orderProductImageRepository.save(image);
                    } catch (Exception e) {
                        log.error("Error saving product image", e);
                        // Continue with other images
                    }
                }
            }
            
            // Handle new images from base64
            if (productRequest.getTempImageBase64() != null && !productRequest.getTempImageBase64().isEmpty()) {
                for (String base64Image : productRequest.getTempImageBase64()) {
                    try {
                        // Process base64 image
                        // This would be implemented in a real application
                        log.info("Processing base64 image for product ID: {}", product.getId());
                        
                        // For now, we'll skip this since we're using MultipartFile
                    } catch (Exception e) {
                        log.error("Error saving product image from base64", e);
                    }
                }
            }
        }
        
        // Delete products that are no longer needed
        for (OrderProduct existingProduct : existingProducts) {
            if (existingProduct.getId() != null && !productsToKeep.contains(existingProduct.getId())) {
                // First delete all images associated with this product
                List<OrderProductImage> images = orderProductImageRepository.findByOrderProductId(existingProduct.getId());
                for (OrderProductImage image : images) {
                    orderProductImageRepository.delete(image);
                }
                
                // Then delete the product
                orderProductRepository.delete(existingProduct);
                
                log.info("Deleted product with ID: {} from order: {}", existingProduct.getId(), id);
            }
        }
        
        return mapOrderToResponse(savedOrder);
    }

    @Override
    @Transactional
    public void deleteOrder(Long id) {
        log.info("Deleting order with ID: {}", id);
        
        if (!orderRepository.existsById(id)) {
            throw new ResourceNotFoundException("Order not found with ID: " + id);
        }
        
        // Delete order (cascade will delete products, images, and status history)
        orderRepository.deleteById(id);
    }

    @Override
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        log.info("Getting all orders with pagination");
        
        return orderRepository.findAll(pageable)
                .map(this::mapOrderToResponse);
    }

    @Override
    public Page<OrderResponse> getOrdersByMarketplaceId(Long marketplaceId, Pageable pageable) {
        log.info("Getting orders by marketplace ID: {}", marketplaceId);
        
        return orderRepository.findByMarketplaceId(marketplaceId, pageable)
                .map(this::mapOrderToResponse);
    }

    @Override
    public Page<OrderResponse> getOrdersByCreatedById(Long userId, Pageable pageable) {
        log.info("Getting orders by user ID: {}", userId);
        
        return orderRepository.findByCreatedById(userId, pageable)
                .map(this::mapOrderToResponse);
    }

    @Override
    public Page<OrderResponse> getOrdersByStatus(String status, Pageable pageable) {
        log.info("Getting orders by status: {}", status);
        
        return orderRepository.findByStatus(status, pageable)
                .map(this::mapOrderToResponse);
    }

    @Override
    public Page<OrderResponse> getOrdersByDeliveryDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        log.info("Getting orders by delivery date between: {} and {}", startDate, endDate);
        
        return orderRepository.findByDeliveryDateBetween(startDate, endDate, pageable)
                .map(this::mapOrderToResponse);
    }

    @Override
    public Page<OrderResponse> getOrdersByFilters(
            String status,
            LocalDate startDate,
            LocalDate endDate,
            Long marketplaceId,
            String customerName,
            Pageable pageable) {
        log.info("Getting orders by filters: status={}, startDate={}, endDate={}, marketplaceId={}, customerName={}",
                status, startDate, endDate, marketplaceId, customerName);
        
        return orderRepository.findByFilters(status, startDate, endDate, marketplaceId, customerName, pageable)
                .map(this::mapOrderToResponse);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long id, String status, String notes, Long userId) {
        User updatedBy = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        log.info("Updating order status: orderId={}, status={}, updatedBy={}", id, status, updatedBy.getId());
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));
        
        // Update order status
        order.setStatus(status);
        Order savedOrder = orderRepository.save(order);
        
        // Create status history
        OrderStatusHistory statusHistory = OrderStatusHistory.builder()
                .order(savedOrder)
                .status(status)
                .notes(notes)
                .updatedBy(updatedBy)
                .build();
        
        orderStatusHistoryRepository.save(statusHistory);
        
        return mapOrderToResponse(savedOrder);
    }

    @Override
    public ResponseEntity<Resource> generateOrderPdf(Long id) {
        log.info("Generating PDF for order with ID: {}", id);
        
        Order order = orderRepository.findByIdWithProductsAndFabrics(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));
        
        // Load status history
        List<OrderStatusHistory> statusHistory = orderStatusHistoryRepository.findByOrderIdWithUserOrderByTimestampDesc(id);
        order.setStatusHistory(statusHistory);
        
        // Load product images
        List<OrderProductImage> allImages = new ArrayList<>();
        for (OrderProduct product : order.getProducts()) {
            List<OrderProductImage> images = orderProductImageRepository.findByOrderProductId(product.getId());
            product.setImages(images);
            allImages.addAll(images);
        }
        
        try {
            // Create PDF document
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc, PageSize.A4);
            document.setMargins(36, 36, 36, 36); // 0.5 inch margins
            
            // Create fonts
            PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont regularFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            
            // First page - Invoice details
            createInvoicePage(document, order, boldFont, regularFont);
            
            // Second page - Product images
            if (!allImages.isEmpty()) {
                // Add a new page for images
                document.add(new Paragraph("\n"));
                document.add(new Paragraph("Product Images").setFont(boldFont).setFontSize(14)
                        .setTextAlignment(TextAlignment.CENTER));
                document.add(new Paragraph("\n"));
                
                createImagesPage(document, allImages);
            }
            
            // Close document
            document.close();
            
            // Return PDF as resource
            byte[] pdfBytes = baos.toByteArray();
            ByteArrayResource resource = new ByteArrayResource(pdfBytes);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=order-" + id + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .contentLength(pdfBytes.length)
                    .body(resource);
            
        } catch (IOException e) {
            log.error("Error generating PDF for order with ID: {}", id, e);
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }
    
    /**
     * Creates the first page of the PDF with invoice-like details
     */
    private void createInvoicePage(Document document, Order order, PdfFont boldFont, PdfFont regularFont) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        
        // Header
        Paragraph header = new Paragraph("INVOICE")
                .setFont(boldFont)
                .setFontSize(20)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(header);
        
        // Order details
        Table orderDetailsTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .setWidth(UnitValue.createPercentValue(100));
        
        // Left column - Company/Marketplace details
        Cell leftCell = new Cell()
                .setBorder(null)
                .add(new Paragraph("From:").setFont(boldFont))
                .add(new Paragraph(order.getMarketplace().getName()).setFont(regularFont))
                .add(new Paragraph(order.getMarketplace().getPageUrl()).setFont(regularFont));
        
        // Right column - Order details
        Cell rightCell = new Cell()
                .setBorder(null)
                .add(new Paragraph("Order Details:").setFont(boldFont))
                .add(new Paragraph("Order #: " + order.getOrderNumber()).setFont(regularFont))
                .add(new Paragraph("Date: " + order.getCreatedAt().format(dateFormatter)).setFont(regularFont))
                .add(new Paragraph("Status: " + order.getStatus()).setFont(regularFont))
                .add(new Paragraph("Delivery Date: " + order.getDeliveryDate().format(dateFormatter)).setFont(regularFont));
        
        orderDetailsTable.addCell(leftCell);
        orderDetailsTable.addCell(rightCell);
        document.add(orderDetailsTable);
        
        document.add(new Paragraph("\n"));
        
        // Customer details
        Table customerTable = new Table(UnitValue.createPercentArray(new float[]{1}))
                .setWidth(UnitValue.createPercentValue(100));
        
        Cell customerCell = new Cell()
                .setBorder(null)
                .add(new Paragraph("Customer Information:").setFont(boldFont))
                .add(new Paragraph("Name: " + order.getCustomer().getName()).setFont(regularFont))
                .add(new Paragraph("Phone: " + order.getCustomer().getPhone()).setFont(regularFont));
        
        if (order.getCustomer().getAlternativePhone() != null && !order.getCustomer().getAlternativePhone().isEmpty()) {
            customerCell.add(new Paragraph("Alternative Phone: " + order.getCustomer().getAlternativePhone()).setFont(regularFont));
        }
        
        customerCell.add(new Paragraph("Address: " + order.getCustomer().getAddress()).setFont(regularFont));
        
        if (order.getCustomer().getFacebookId() != null && !order.getCustomer().getFacebookId().isEmpty()) {
            customerCell.add(new Paragraph("Facebook: " + order.getCustomer().getFacebookId()).setFont(regularFont));
        }
        
        customerTable.addCell(customerCell);
        document.add(customerTable);
        
        document.add(new Paragraph("\n"));
        
        // Delivery details
        Table deliveryTable = new Table(UnitValue.createPercentArray(new float[]{1}))
                .setWidth(UnitValue.createPercentValue(100));
        
        Cell deliveryCell = new Cell()
                .setBorder(null)
                .add(new Paragraph("Delivery Information:").setFont(boldFont))
                .add(new Paragraph("Channel: " + order.getDeliveryChannel()).setFont(regularFont))
                .add(new Paragraph("Delivery Date: " + order.getDeliveryDate().format(dateFormatter)).setFont(regularFont));
        
        deliveryTable.addCell(deliveryCell);
        document.add(deliveryTable);
        
        document.add(new Paragraph("\n"));
        
        // Products table
        Table productsTable = new Table(UnitValue.createPercentArray(new float[]{3, 2, 1, 2, 2}))
                .setWidth(UnitValue.createPercentValue(100));
        
        // Table header
        productsTable.addHeaderCell(new Cell().add(new Paragraph("Product").setFont(boldFont)));
        productsTable.addHeaderCell(new Cell().add(new Paragraph("Fabric").setFont(boldFont)));
        productsTable.addHeaderCell(new Cell().add(new Paragraph("Qty").setFont(boldFont)));
        productsTable.addHeaderCell(new Cell().add(new Paragraph("Unit Price").setFont(boldFont)));
        productsTable.addHeaderCell(new Cell().add(new Paragraph("Subtotal").setFont(boldFont)));
        
        // Table rows
        for (OrderProduct product : order.getProducts()) {
            productsTable.addCell(new Cell().add(new Paragraph(product.getProductType()).setFont(regularFont)));
            productsTable.addCell(new Cell().add(new Paragraph(product.getFabric().getName()).setFont(regularFont)));
            productsTable.addCell(new Cell().add(new Paragraph(String.valueOf(product.getQuantity())).setFont(regularFont)));
            productsTable.addCell(new Cell().add(new Paragraph(product.getPrice().toString()).setFont(regularFont)));
            
            BigDecimal subtotal = product.getPrice().multiply(new BigDecimal(product.getQuantity()));
            productsTable.addCell(new Cell().add(new Paragraph(subtotal.toString()).setFont(regularFont)));
        }
        
        document.add(productsTable);
        
        document.add(new Paragraph("\n"));
        
        // Totals
        Table totalsTable = new Table(UnitValue.createPercentArray(new float[]{4, 1}))
                .setWidth(UnitValue.createPercentValue(100));
        
        // Calculate subtotal
        BigDecimal subtotal = order.getProducts().stream()
                .map(p -> p.getPrice().multiply(new BigDecimal(p.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph("Subtotal:").setFont(boldFont).setTextAlignment(TextAlignment.RIGHT)));
        totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph(subtotal.toString()).setFont(regularFont)));
        
        totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph("Delivery Charge:").setFont(boldFont).setTextAlignment(TextAlignment.RIGHT)));
        totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph(order.getDeliveryCharge().toString()).setFont(regularFont)));
        
        totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph("Total:").setFont(boldFont).setTextAlignment(TextAlignment.RIGHT)));
        totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph(order.getTotalAmount().toString()).setFont(boldFont)));
        
        document.add(totalsTable);
        
        // Add page break for images
        document.add(new AreaBreak());
    }
    
    /**
     * Creates the second page with product images in a grid layout
     */
    private void createImagesPage(Document document, List<OrderProductImage> images) throws IOException {
        // Create a table for the image grid
        // We'll use 2 columns for the grid
        Table imageTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .setWidth(UnitValue.createPercentValue(100));
        
        // Calculate how many images we can fit on the page
        // For simplicity, we'll limit to a maximum of 6 images (3 rows x 2 columns)
        int maxImages = Math.min(images.size(), 6);
        
        for (int i = 0; i < maxImages; i++) {
            OrderProductImage orderImage = images.get(i);
            
            try {
                // Get image data from storage
                FileStorage fileStorage = fileStorageRepository.findById(orderImage.getImageId())
                        .orElseThrow(() -> new ResourceNotFoundException("Image not found with ID: " + orderImage.getImageId()));
                
                byte[] imageData;
                if (fileStorageConfig.isUseS3Storage()) {
                    // Get from S3
                    imageData = s3Service.downloadFile(fileStorage.getFilePath());
                } else {
                    // Get from local storage
                    java.nio.file.Path imagePath = fileStorageConfig.getUploadPath()
                            .resolve(fileStorage.getFilePath());
                    imageData = java.nio.file.Files.readAllBytes(imagePath);
                }
                
                // Create image
                ImageData data = ImageDataFactory.create(imageData);
                Image img = new Image(data);
                
                // Scale image to fit in cell while maintaining aspect ratio
                float maxWidth = 250; // Max width for the image in the cell
                float maxHeight = 250; // Max height for the image in the cell
                
                // Calculate scaling factor to maintain aspect ratio
                float imgWidth = img.getImageWidth();
                float imgHeight = img.getImageHeight();
                float widthRatio = maxWidth / imgWidth;
                float heightRatio = maxHeight / imgHeight;
                float scaleFactor = Math.min(widthRatio, heightRatio);
                
                // Scale image
                img.scale(scaleFactor, scaleFactor);
                
                // Center image in cell
                Cell cell = new Cell()
                        .setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 1))
                        .setPadding(10)
                        .setHorizontalAlignment(HorizontalAlignment.CENTER)
                        .setVerticalAlignment(VerticalAlignment.MIDDLE)
                        .add(img);
                
                imageTable.addCell(cell);
            } catch (Exception e) {
                log.error("Error adding image to PDF: {}", e.getMessage());
                // Add empty cell if image can't be loaded
                Cell cell = new Cell()
                        .setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 1))
                        .setPadding(10)
                        .add(new Paragraph("Image not available").setFontColor(ColorConstants.GRAY));
                imageTable.addCell(cell);
            }
        }
        
        // If we have an odd number of images, add an empty cell to complete the grid
        if (maxImages % 2 != 0) {
            Cell cell = new Cell().setBorder(null);
            imageTable.addCell(cell);
        }
        
        document.add(imageTable);
    }

    @Override
    public ResponseEntity<Resource> generateOrdersExcel(String status, LocalDate startDate, LocalDate endDate) {
        log.info("Exporting orders to Excel: status={}, startDate={}, endDate={}", status, startDate, endDate);
        
        // Get orders based on filters
        List<Order> orders;
        if (status != null || startDate != null || endDate != null) {
            Page<Order> orderPage = orderRepository.findByFiltersWithCreatedBy(status, startDate, endDate, null, null, Pageable.unpaged());
            orders = orderPage.getContent();
        } else {
            orders = orderRepository.findAll();
        }
        
        // Create Excel workbook
        try {
            // This is a placeholder for the actual Excel generation logic
            // In a real implementation, you would use a library like Apache POI to create the Excel file
            
            // For now, return a simple CSV content
            StringBuilder csvContent = new StringBuilder();
            csvContent.append("ID,Order Number,Created Date,Created By,Status,Marketplace,Customer Name,Customer Phone,Customer Address,Alternative Phone,Facebook ID,Delivery Channel,Delivery Charge,Delivery Date,Products Count,Total Amount\n");
            
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            
            for (Order order : orders) {
                csvContent.append(order.getId()).append(",");
                csvContent.append(order.getOrderNumber()).append(",");
                csvContent.append(order.getCreatedAt().toString()).append(",");
                csvContent.append(order.getCreatedBy().getFirstName()).append(" ").append(order.getCreatedBy().getLastName()).append(",");
                csvContent.append(order.getStatus()).append(",");
                csvContent.append(order.getMarketplace().getName()).append(",");
                csvContent.append(order.getCustomer().getName()).append(",");
                csvContent.append(order.getCustomer().getPhone()).append(",");
                csvContent.append(order.getCustomer().getAddress()).append(",");
                csvContent.append(order.getCustomer().getAlternativePhone() != null ? order.getCustomer().getAlternativePhone() : "").append(",");
                csvContent.append(order.getCustomer().getFacebookId() != null ? order.getCustomer().getFacebookId() : "").append(",");
                csvContent.append(order.getDeliveryChannel()).append(",");
                csvContent.append(order.getDeliveryCharge().doubleValue()).append(",");
                csvContent.append(order.getDeliveryDate().format(dateFormatter)).append(",");
                csvContent.append(order.getProducts().size()).append(",");
                
                // Calculate total
                BigDecimal total = order.getProducts().stream()
                        .map(p -> p.getPrice().multiply(new BigDecimal(p.getQuantity())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .add(order.getDeliveryCharge());
                
                csvContent.append(total.doubleValue()).append("\n");
            }
            
            byte[] excelBytes = csvContent.toString().getBytes();
            
            ByteArrayResource resource = new ByteArrayResource(excelBytes);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=orders.csv")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .contentLength(excelBytes.length)
                    .body(resource);
        } catch (Exception e) {
            log.error("Error exporting orders to Excel", e);
            throw new RuntimeException("Failed to export orders to Excel", e);
        }
    }

    @Override
    public List<Map<String, Object>> getOrderStatusCounts() {
        log.info("Getting order status counts");
        
        return orderRepository.getOrderStatusCounts();
    }
    
    @Override
    public List<Map<String, Object>> getUserOrderStatistics(boolean currentMonth) {
        log.info("Getting user order statistics for {}", currentMonth ? "current month" : "current year");
        
        LocalDate now = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate = now;
        
        if (currentMonth) {
            // Current month: from first day of current month to today
            startDate = now.withDayOfMonth(1);
        } else {
            // Current year: from first day of current year to today
            startDate = now.withDayOfYear(1);
        }
        
        log.info("Date range: {} to {}", startDate, endDate);
        
        // Get all orders in the date range
        List<Order> orders = orderRepository.findByCreatedAtBetween(
                startDate.atStartOfDay(), 
                endDate.atTime(23, 59, 59)
        );
        
        // Group orders by user and calculate statistics
        Map<Long, Map<String, Object>> userStatsMap = new HashMap<>();
        
        for (Order order : orders) {
            Long userId = order.getCreatedBy().getId();
            
            // Initialize user stats if not exists
            if (!userStatsMap.containsKey(userId)) {
                Map<String, Object> userStats = new HashMap<>();
                userStats.put("userId", userId);
                userStats.put("firstName", order.getCreatedBy().getFirstName());
                userStats.put("lastName", order.getCreatedBy().getLastName());
                userStats.put("email", order.getCreatedBy().getEmail());
                userStats.put("orderCount", 0);
                userStats.put("totalAmount", BigDecimal.ZERO);
                
                userStatsMap.put(userId, userStats);
            }
            
            // Update user stats
            Map<String, Object> userStats = userStatsMap.get(userId);
            int orderCount = (int) userStats.get("orderCount");
            BigDecimal totalAmount = (BigDecimal) userStats.get("totalAmount");
            
            userStats.put("orderCount", orderCount + 1);
            userStats.put("totalAmount", totalAmount.add(order.getTotalAmount()));
        }
        
        // Convert map to list and sort by order count (descending)
        List<Map<String, Object>> result = new ArrayList<>(userStatsMap.values());
        result.sort((a, b) -> Integer.compare((int) b.get("orderCount"), (int) a.get("orderCount")));
        
        return result;
    }
    
    @Override
    public List<Map<String, Object>> getMarketplaceOrderStatistics(boolean currentMonth) {
        log.info("Getting marketplace order statistics for {}", currentMonth ? "current month" : "current year");
        
        LocalDate now = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate = now;
        
        if (currentMonth) {
            // Current month: from first day of current month to today
            startDate = now.withDayOfMonth(1);
        } else {
            // Current year: from first day of current year to today
            startDate = now.withDayOfYear(1);
        }
        
        log.info("Date range: {} to {}", startDate, endDate);
        
        // Get all orders in the date range
        List<Order> orders = orderRepository.findByCreatedAtBetween(
                startDate.atStartOfDay(), 
                endDate.atTime(23, 59, 59)
        );
        
        // Group orders by marketplace and calculate statistics
        Map<Long, Map<String, Object>> marketplaceStatsMap = new HashMap<>();
        
        for (Order order : orders) {
            Long marketplaceId = order.getMarketplace().getId();
            
            // Initialize marketplace stats if not exists
            if (!marketplaceStatsMap.containsKey(marketplaceId)) {
                Map<String, Object> marketplaceStats = new HashMap<>();
                marketplaceStats.put("marketplaceId", marketplaceId);
                marketplaceStats.put("name", order.getMarketplace().getName());
                marketplaceStats.put("totalAmount", BigDecimal.ZERO);
                
                marketplaceStatsMap.put(marketplaceId, marketplaceStats);
            }
            
            // Update marketplace stats
            Map<String, Object> marketplaceStats = marketplaceStatsMap.get(marketplaceId);
            BigDecimal totalAmount = (BigDecimal) marketplaceStats.get("totalAmount");
            
            marketplaceStats.put("totalAmount", totalAmount.add(order.getTotalAmount()));
        }
        
        // Convert map to list and sort by total amount (descending)
        List<Map<String, Object>> result = new ArrayList<>(marketplaceStatsMap.values());
        result.sort((a, b) -> ((BigDecimal) b.get("totalAmount")).compareTo((BigDecimal) a.get("totalAmount")));
        
        return result;
    }
    
    /**
     * Map an Order entity to an OrderResponse DTO
     */
    private OrderResponse mapOrderToResponse(Order order) {
        // Map marketplace
        OrderResponse.MarketplaceResponse marketplaceResponse = OrderResponse.MarketplaceResponse.builder()
                .id(order.getMarketplace().getId())
                .name(order.getMarketplace().getName())
                .description(order.getMarketplace().getPageUrl())
                .build();
        
        // Map customer
        CustomerResponse customerResponse = CustomerResponse.builder()
                .id(order.getCustomer().getId())
                .name(order.getCustomer().getName())
                .phone(order.getCustomer().getPhone())
                .address(order.getCustomer().getAddress())
                .alternativePhone(order.getCustomer().getAlternativePhone())
                .facebookId(order.getCustomer().getFacebookId())
                .createdAt(order.getCustomer().getCreatedAt())
                .updatedAt(order.getCustomer().getUpdatedAt())
                .build();
        
        // Map created by user
        OrderResponse.UserResponse createdByDto = OrderResponse.UserResponse.builder()
                .id(order.getCreatedBy().getId())
                .firstName(order.getCreatedBy().getFirstName())
                .lastName(order.getCreatedBy().getLastName())
                .email(order.getCreatedBy().getEmail())
                .build();
        
        // Map products
        List<OrderProductResponse> productResponses = order.getProducts().stream()
                .map(this::mapOrderProductToResponse)
                .collect(Collectors.toList());
        
        // Map status history
        List<OrderStatusHistoryResponse> statusHistoryResponses = orderStatusHistoryRepository
                .findByOrderIdWithUserOrderByTimestampDesc(order.getId())
                .stream()
                .map(this::mapOrderStatusHistoryToResponse)
                .collect(Collectors.toList());
        
        // Calculate total amount
        BigDecimal totalAmount = order.getProducts().stream()
                .map(p -> p.getPrice().multiply(new BigDecimal(p.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .add(order.getDeliveryCharge());
        
        // Build response
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .marketplace(marketplaceResponse)
                .customer(customerResponse)
                .deliveryChannel(order.getDeliveryChannel())
                .deliveryCharge(order.getDeliveryCharge())
                .deliveryDate(order.getDeliveryDate())
                .status(order.getStatus())
                .totalAmount(totalAmount)
                .createdBy(createdByDto)
                .products(productResponses)
                .statusHistory(statusHistoryResponses)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
    
    /**
     * Map an OrderProduct entity to an OrderProductResponse DTO
     */
    private OrderProductResponse mapOrderProductToResponse(OrderProduct product) {
        // Map fabric
        OrderProductResponse.FabricResponse fabricResponse = OrderProductResponse.FabricResponse.builder()
                .id(product.getFabric().getId())
                .name(product.getFabric().getName())
                .imageUrl("/files/" + product.getFabric().getImageId())
                .build();
        
        // Map images
        List<OrderProductImageResponse> imageResponses = orderProductImageRepository
                .findByOrderProductId(product.getId())
                .stream()
                .map(this::mapOrderProductImageToResponse)
                .collect(Collectors.toList());
        
        // Calculate subtotal
        BigDecimal subtotal = product.getPrice().multiply(new BigDecimal(product.getQuantity()));
        
        // Build response
        return OrderProductResponse.builder()
                .id(product.getId())
                .productType(product.getProductType())
                .fabric(fabricResponse)
                .quantity(product.getQuantity())
                .price(product.getPrice())
                .description(product.getDescription())
                .subtotal(subtotal)
                .images(imageResponses)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
    
    /**
     * Map an OrderProductImage entity to an OrderProductImageResponse DTO
     */
    private OrderProductImageResponse mapOrderProductImageToResponse(OrderProductImage image) {
        return OrderProductImageResponse.builder()
                .id(image.getId())
                .imageId(image.getImageId())
                .imageUrl(image.getImageUrl())
                .createdAt(image.getCreatedAt())
                .updatedAt(image.getUpdatedAt())
                .build();
    }
    
    /**
     * Map an OrderStatusHistory entity to an OrderStatusHistoryResponse DTO
     */
    private OrderStatusHistoryResponse mapOrderStatusHistoryToResponse(OrderStatusHistory history) {
        // Map updated by user
        OrderStatusHistoryResponse.UserResponse updatedByDto = OrderStatusHistoryResponse.UserResponse.builder()
                .id(history.getUpdatedBy().getId())
                .firstName(history.getUpdatedBy().getFirstName())
                .lastName(history.getUpdatedBy().getLastName())
                .email(history.getUpdatedBy().getEmail())
                .build();
        
        // Build response
        return OrderStatusHistoryResponse.builder()
                .id(history.getId())
                .status(history.getStatus())
                .notes(history.getNotes())
                .updatedBy(updatedByDto)
                .timestamp(history.getTimestamp())
                .createdAt(history.getCreatedAt())
                .updatedAt(history.getUpdatedAt())
                .build();
    }
}
