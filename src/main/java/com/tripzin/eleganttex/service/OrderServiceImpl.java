package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.dto.UserDTO;
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
    private final UserRepository userRepository;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest orderRequest, Long userId, List<MultipartFile> files) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        log.info("Creating new order for marketplace ID: {}", orderRequest.getMarketplaceId());
        
        // Find marketplace
        Marketplace marketplace = marketplaceRepository.findById(orderRequest.getMarketplaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Marketplace not found with ID: " + orderRequest.getMarketplaceId()));
        
        // Calculate total amount from products
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OrderProductRequest productRequest : orderRequest.getProducts()) {
            BigDecimal productTotal = productRequest.getPrice().multiply(new BigDecimal(productRequest.getQuantity()));
            totalAmount = totalAmount.add(productTotal);
        }
        // Add delivery charge to total
        totalAmount = totalAmount.add(orderRequest.getDeliveryCharge());
        
        // Create order
        Order order = Order.builder()
                .marketplace(marketplace)
                .customerName(orderRequest.getCustomerName())
                .customerPhone(orderRequest.getCustomerPhone())
                .customerAddress(orderRequest.getCustomerAddress())
                .customerAlternativePhone(orderRequest.getCustomerAlternativePhone())
                .customerFacebookId(orderRequest.getCustomerFacebookId())
                .deliveryChannel(orderRequest.getDeliveryChannel())
                .deliveryCharge(orderRequest.getDeliveryCharge())
                .deliveryDate(orderRequest.getDeliveryDate())
                .status("Created")
                .totalAmount(totalAmount) // Set the calculated total amount
                .createdBy(currentUser)
                .build();
        
        Order savedOrder = orderRepository.save(order);
        
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
                    // Verify image exists
                    FileStorage fileStorage = fileStorageRepository.findById(imageId)
                            .orElseThrow(() -> new ResourceNotFoundException("Image not found with ID: " + imageId));
                    
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
        order.setCustomerName(orderRequest.getCustomerName());
        order.setCustomerPhone(orderRequest.getCustomerPhone());
        order.setCustomerAddress(orderRequest.getCustomerAddress());
        order.setCustomerAlternativePhone(orderRequest.getCustomerAlternativePhone());
        order.setCustomerFacebookId(orderRequest.getCustomerFacebookId());
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
        for (OrderProduct product : order.getProducts()) {
            List<OrderProductImage> images = orderProductImageRepository.findByOrderProductId(product.getId());
            product.setImages(images);
        }
        
        // Generate PDF using a PDF library (e.g., iText, PDFBox)
        // This is a placeholder for the actual PDF generation logic
        // In a real implementation, you would use a PDF library to create the PDF
        
        // For now, return a simple byte array
        String pdfContent = "Order #" + order.getId() + "\n" +
                "Customer: " + order.getCustomerName() + "\n" +
                "Status: " + order.getStatus() + "\n";
        
        byte[] pdfBytes = pdfContent.getBytes();
        
        ByteArrayResource resource = new ByteArrayResource(pdfBytes);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=order-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(resource);
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
            csvContent.append("ID,Created Date,Created By,Status,Marketplace,Customer Name,Customer Phone,Customer Address,Alternative Phone,Facebook ID,Delivery Channel,Delivery Charge,Delivery Date,Products Count,Total Amount\n");
            
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            
            for (Order order : orders) {
                csvContent.append(order.getId()).append(",");
                csvContent.append(order.getCreatedAt().toString()).append(",");
                csvContent.append(order.getCreatedBy().getFirstName()).append(" ").append(order.getCreatedBy().getLastName()).append(",");
                csvContent.append(order.getStatus()).append(",");
                csvContent.append(order.getMarketplace().getName()).append(",");
                csvContent.append(order.getCustomerName()).append(",");
                csvContent.append(order.getCustomerPhone()).append(",");
                csvContent.append(order.getCustomerAddress()).append(",");
                csvContent.append(order.getCustomerAlternativePhone() != null ? order.getCustomerAlternativePhone() : "").append(",");
                csvContent.append(order.getCustomerFacebookId() != null ? order.getCustomerFacebookId() : "").append(",");
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
                .marketplace(marketplaceResponse)
                .customerName(order.getCustomerName())
                .customerPhone(order.getCustomerPhone())
                .customerAddress(order.getCustomerAddress())
                .customerAlternativePhone(order.getCustomerAlternativePhone())
                .customerFacebookId(order.getCustomerFacebookId())
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
