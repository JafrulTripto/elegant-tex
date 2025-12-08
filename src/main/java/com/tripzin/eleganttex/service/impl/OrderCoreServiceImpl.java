package com.tripzin.eleganttex.service.impl;

import com.tripzin.eleganttex.dto.request.OrderProductRequest;
import com.tripzin.eleganttex.dto.request.OrderRequest;
import com.tripzin.eleganttex.dto.response.CustomerResponse;
import com.tripzin.eleganttex.dto.response.OrderResponse;
import com.tripzin.eleganttex.entity.Customer;
import com.tripzin.eleganttex.entity.Marketplace;
import com.tripzin.eleganttex.entity.Order;
import com.tripzin.eleganttex.entity.OrderProduct;
import com.tripzin.eleganttex.entity.OrderStatus;
import com.tripzin.eleganttex.entity.OrderStatusHistory;
import com.tripzin.eleganttex.entity.OrderType;
import com.tripzin.eleganttex.entity.User;
import com.tripzin.eleganttex.exception.ResourceNotFoundException;
import com.tripzin.eleganttex.repository.MarketplaceRepository;
import com.tripzin.eleganttex.repository.OrderProductRepository;
import com.tripzin.eleganttex.repository.OrderRepository;
import com.tripzin.eleganttex.repository.OrderStatusHistoryRepository;
import com.tripzin.eleganttex.repository.UserRepository;
import com.tripzin.eleganttex.service.CustomerService;
import com.tripzin.eleganttex.service.OrderCalculationService;
import com.tripzin.eleganttex.service.OrderCoreService;
import com.tripzin.eleganttex.service.OrderProductHandler;
import com.tripzin.eleganttex.service.mapper.OrderMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Implementation of OrderCoreService for handling core order operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderCoreServiceImpl implements OrderCoreService {

    private final OrderRepository orderRepository;
    private final OrderProductRepository orderProductRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final MarketplaceRepository marketplaceRepository;
    private final UserRepository userRepository;
    private final CustomerService customerService;
    
    private final OrderMapper orderMapper;
    private final OrderCalculationService calculationService;
    private final OrderProductHandler productHandler;

    /**
     * Create a new order
     */
    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest orderRequest, Long userId, List<MultipartFile> files, HttpServletRequest request) {
        log.info("Creating new order - Type: {}, MarketplaceId: {}, CustomerId: {}", 
                orderRequest.getOrderType(), 
                orderRequest.getMarketplaceId(), 
                orderRequest.getCustomerId());
        
        // Get current user
        User currentUser = getUserById(userId);
        
        // Handle marketplace based on order type
        Marketplace marketplace = null;
        if (orderRequest.getOrderType() == OrderType.MARKETPLACE) {
            // For marketplace orders, marketplace is required
            if (orderRequest.getMarketplaceId() == null) {
                throw new IllegalArgumentException("Marketplace ID is required for marketplace orders");
            }
            marketplace = getMarketplaceById(orderRequest.getMarketplaceId());
        } else if (orderRequest.getMarketplaceId() != null) {
            // For merchant orders, marketplace is optional but use it if provided
            marketplace = getMarketplaceById(orderRequest.getMarketplaceId());
        }
        
        // Find or create customer
        Customer customer = getOrCreateCustomer(orderRequest);
        
        // Calculate total amount
        BigDecimal totalAmount = calculationService.calculateTotalFromRequests(orderRequest.getProducts())
                .add(orderRequest.getDeliveryCharge());
        
        // Create order with a temporary order number
        Order order = createInitialOrder(marketplace, customer, orderRequest, totalAmount, currentUser);
        
        // Create initial status history
        createInitialStatusHistory(order, currentUser);
        
        // Create products with product-specific files
        createOrderProducts(order, orderRequest.getProducts(), files, request);

        // Set final order number using first product's fabric code and style code
        List<OrderProduct> createdProducts = orderProductRepository.findByOrderId(order.getId());
        if (createdProducts != null && !createdProducts.isEmpty()) {
            OrderProduct first = createdProducts.get(0);
            String fabricCode = first.getFabric() != null ? first.getFabric().getFabricCode() : "NA";
            String styleCode = first.getStyleCode() != null ? first.getStyleCode() : "NA";
            String finalOrderNumber = String.format("ET-%s-%s-%04d", fabricCode, styleCode, order.getId());
            order.setOrderNumber(finalOrderNumber);
            orderRepository.save(order);
        }

        return orderMapper.mapOrderToResponse(order);
    }

    /**
     * Get order by ID with permission check
     */
    @Override
    public OrderResponse getOrderById(Long id, Long currentUserId, boolean hasReadAllPermission) {
        log.info("Getting order by ID: {} for user ID: {}, hasReadAllPermission: {}", id, currentUserId, hasReadAllPermission);
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));
        
        // Check if the user has permission to view this order
        if (!hasReadAllPermission && currentUserId != null && 
            !order.getCreatedBy().getId().equals(currentUserId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                "You do not have permission to view this order");
        }
        
        return orderMapper.mapOrderToResponse(order);
    }

    /**
     * Update an existing order with permission check
     */
    @Override
    @Transactional
    public OrderResponse updateOrder(Long id, OrderRequest orderRequest, Long userId, List<MultipartFile> files,
                                    Long currentUserId, boolean hasReadAllPermission, HttpServletRequest request) {
        log.info("Updating order with ID: {} - Type: {}, MarketplaceId: {}, CustomerId: {}", 
                id, orderRequest.getOrderType(), orderRequest.getMarketplaceId(), orderRequest.getCustomerId());
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));
        
        // Check if the user has permission to update this order
        if (!hasReadAllPermission && currentUserId != null && 
            !order.getCreatedBy().getId().equals(currentUserId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                "You do not have permission to update this order");
        }
        
        // Handle marketplace based on order type
        Marketplace marketplace = null;
        if (orderRequest.getOrderType() == OrderType.MARKETPLACE) {
            // For marketplace orders, marketplace is required
            if (orderRequest.getMarketplaceId() == null) {
                throw new IllegalArgumentException("Marketplace ID is required for marketplace orders");
            }
            marketplace = getMarketplaceById(orderRequest.getMarketplaceId());
        } else if (orderRequest.getMarketplaceId() != null) {
            // For merchant orders, marketplace is optional but use it if provided
            marketplace = getMarketplaceById(orderRequest.getMarketplaceId());
        }
        
        Customer customer = getOrCreateCustomer(orderRequest);
        BigDecimal totalAmount = calculationService.calculateTotalFromRequests(orderRequest.getProducts())
                .add(orderRequest.getDeliveryCharge());
        updateOrderFields(order, marketplace, customer, orderRequest, totalAmount);
        updateOrderProducts(order, orderRequest.getProducts(), files, request);
        return orderMapper.mapOrderToResponse(order);
    }

    /**
     * Delete an order with permission check
     */
    @Override
    @Transactional
    public void deleteOrder(Long id, Long currentUserId, boolean hasReadAllPermission) {
        log.info("Deleting order with ID: {} for user ID: {}, hasReadAllPermission: {}", id, currentUserId, hasReadAllPermission);
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));
        
        // Check if the user has permission to delete this order
        if (!hasReadAllPermission && currentUserId != null && 
            !order.getCreatedBy().getId().equals(currentUserId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                "You do not have permission to delete this order");
        }
        
        // Delete order (cascade will delete products, images, and status history)
        orderRepository.deleteById(id);
    }
    
    /**
     * Reuse a cancelled or returned order to create a new order
     */
    @Override
    @Transactional
    public OrderResponse reuseOrder(Long orderId, Long userId) {
        log.info("Reusing order with ID: {} for user ID: {}", orderId, userId);
        
        // Get the source order with products
        Order sourceOrder = orderRepository.findByIdWithProductsAndFabrics(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        
        // Verify that the order is cancelled or returned
        if (sourceOrder.getStatus() != OrderStatus.CANCELLED && sourceOrder.getStatus() != OrderStatus.RETURNED) {
            throw new IllegalStateException("Only cancelled or returned orders can be reused");
        }
        
        // Get current user
        User currentUser = getUserById(userId);
        
        // Create a new order based on the source order
        Order newOrder = Order.builder()
                .marketplace(sourceOrder.getMarketplace())
                .customer(sourceOrder.getCustomer())
                .orderType(sourceOrder.getOrderType())
                .deliveryChannel(sourceOrder.getDeliveryChannel())
                .deliveryCharge(sourceOrder.getDeliveryCharge())
                .deliveryDate(sourceOrder.getDeliveryDate())
                .status(OrderStatus.ORDER_CREATED)
                .totalAmount(sourceOrder.getTotalAmount())
                .createdBy(currentUser)
                .orderNumber("TEMP-" + System.currentTimeMillis()) // Temporary order number
                .build();
        
        // Save the order first to get the ID
        Order savedOrder = orderRepository.save(newOrder);
        
        // Set final order number using first product of source order
        String fabricCode = "NA";
        String styleCode = "NA";
        if (sourceOrder.getProducts() != null && !sourceOrder.getProducts().isEmpty()) {
            OrderProduct first = sourceOrder.getProducts().get(0);
            if (first.getFabric() != null && first.getFabric().getFabricCode() != null) {
                fabricCode = first.getFabric().getFabricCode();
            }
            if (first.getStyleCode() != null) {
                styleCode = first.getStyleCode();
            }
        }
        String orderNumber = String.format("ET-%s-%s-%04d", fabricCode, styleCode, savedOrder.getId());
        savedOrder.setOrderNumber(orderNumber);
        savedOrder = orderRepository.save(savedOrder);
        
        // Create initial status history with note about reusing the original order
        OrderStatusHistory statusHistory = OrderStatusHistory.builder()
                .order(savedOrder)
                .status(OrderStatus.ORDER_CREATED)
                .notes("Order created by reusing order #" + sourceOrder.getOrderNumber())
                .updatedBy(currentUser)
                .build();
        
        orderStatusHistoryRepository.save(statusHistory);
        
        // Copy products from source order to new order
        for (OrderProduct sourceProduct : sourceOrder.getProducts()) {
            OrderProduct newProduct = OrderProduct.builder()
                    .order(savedOrder)
                    .productType(sourceProduct.getProductType())
                    .fabric(sourceProduct.getFabric())
                    .quantity(sourceProduct.getQuantity())
                    .price(sourceProduct.getPrice())
                    .description(sourceProduct.getDescription())
                    .build();
            
            OrderProduct savedProduct = orderProductRepository.save(newProduct);
            
            // Copy images if needed
            if (sourceProduct.getImages() != null && !sourceProduct.getImages().isEmpty()) {
                productHandler.copyProductImages(sourceProduct, savedProduct);
            }
        }
        
        return orderMapper.mapOrderToResponse(savedOrder);
    }
    
    // Helper methods
    
    /**
     * Get user by ID
     */
    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
    }
    
    /**
     * Get marketplace by ID
     * @param marketplaceId the marketplace ID, can be null for merchant orders
     * @return the marketplace, or null if marketplaceId is null
     */
    private Marketplace getMarketplaceById(Long marketplaceId) {
        if (marketplaceId == null) {
            return null;
        }
        return marketplaceRepository.findById(marketplaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Marketplace not found with ID: " + marketplaceId));
    }
    
    /**
     * Get or create customer from order request
     */
    private Customer getOrCreateCustomer(OrderRequest orderRequest) {
        if (orderRequest.getCustomerId() != null) {
            // Use existing customer
            Customer customer = customerService.getCustomerEntityById(orderRequest.getCustomerId());
            log.info("Using existing customer with ID: {}", customer.getId());
            return customer;
        } else if (orderRequest.getCustomerData() != null) {
            // Create new customer or find by phone - pass order type for customer type assignment
            CustomerResponse customerResponse = customerService.findOrCreateCustomer(
                    orderRequest.getCustomerData(), 
                    orderRequest.getOrderType()
            );
            Customer customer = customerService.getCustomerEntityById(customerResponse.getId());
            log.info("Found or created customer with ID: {} and type based on order type: {}", 
                    customer.getId(), orderRequest.getOrderType());
            return customer;
        } else {
            throw new IllegalArgumentException("Either customerId or customerData must be provided");
        }
    }
    
    /**
     * Create initial order
     */
    private Order createInitialOrder(Marketplace marketplace, Customer customer, OrderRequest orderRequest, BigDecimal totalAmount, User currentUser) {
        // Create order with a temporary order number to avoid constraint violation
        String tempOrderNumber = "TEMP-" + System.currentTimeMillis();
        
        Order order = Order.builder()
                .marketplace(marketplace)
                .customer(customer)
                .orderType(orderRequest.getOrderType())
                .deliveryChannel(orderRequest.getDeliveryChannel())
                .deliveryCharge(orderRequest.getDeliveryCharge())
                .deliveryDate(orderRequest.getDeliveryDate())
                .status(OrderStatus.ORDER_CREATED)
                .totalAmount(totalAmount)
                .createdBy(currentUser)
                .orderNumber(tempOrderNumber)
                .build();
        
        // Save the order first to get the ID
        Order savedOrder = orderRepository.save(order);
        
        // Generate and set the custom order number
        String orderNumber = String.format("ET-ORD-%04d", savedOrder.getId());
        savedOrder.setOrderNumber(orderNumber);
        
        // Save again with the proper order number
        return orderRepository.save(savedOrder);
    }
    
    /**
     * Create initial status history
     */
    private void createInitialStatusHistory(Order order, User currentUser) {
        OrderStatusHistory statusHistory = OrderStatusHistory.builder()
                .order(order)
                .status(OrderStatus.ORDER_CREATED)
                .notes("Order created")
                .updatedBy(currentUser)
                .build();
        
        orderStatusHistoryRepository.save(statusHistory);
    }
    
    /**
     * Create order products with product-specific files
     */
    private void createOrderProducts(Order order, List<OrderProductRequest> productRequests, List<MultipartFile> files, HttpServletRequest request) {
        for (int i = 0; i < productRequests.size(); i++) {
            OrderProductRequest productRequest = productRequests.get(i);
            
            // Extract files for this specific product
            List<MultipartFile> productFiles = getFilesForProduct(request, i);
            
            // Create the product with its specific files
            productHandler.createOrderProduct(productRequest, order, productFiles);
        }
    }
    
    /**
     * Extract files for a specific product index from the request
     */
    private List<MultipartFile> getFilesForProduct(HttpServletRequest request, int productIndex) {
        List<MultipartFile> productFiles = new ArrayList<>();
        
        if (request instanceof org.springframework.web.multipart.MultipartHttpServletRequest) {
            org.springframework.web.multipart.MultipartHttpServletRequest multipartRequest = 
                (org.springframework.web.multipart.MultipartHttpServletRequest) request;
            
            // Get files with the product-specific key
            String fileKey = "files_" + productIndex;
            List<MultipartFile> files = multipartRequest.getFiles(fileKey);
            
            if (files != null && !files.isEmpty()) {
                productFiles.addAll(files);
                log.info("Found {} files for product index {}", files.size(), productIndex);
            }
        }
        
        return productFiles;
    }
    
    /**
     * Update order fields
     */
    private void updateOrderFields(Order order, Marketplace marketplace, Customer customer, OrderRequest orderRequest, BigDecimal totalAmount) {
        order.setMarketplace(marketplace);
        order.setCustomer(customer);
        order.setOrderType(orderRequest.getOrderType());
        order.setDeliveryChannel(orderRequest.getDeliveryChannel());
        order.setDeliveryCharge(orderRequest.getDeliveryCharge());
        order.setDeliveryDate(orderRequest.getDeliveryDate());
        order.setTotalAmount(totalAmount);
        
        orderRepository.save(order);
    }
    
    /**
     * Update order products with product-specific files
     */
    private void updateOrderProducts(Order order, List<OrderProductRequest> productRequests, List<MultipartFile> files, HttpServletRequest request) {
        // Get existing products
        List<OrderProduct> existingProducts = orderProductRepository.findByOrderId(order.getId());
        Map<Long, OrderProduct> existingProductMap = new HashMap<>();
        for (OrderProduct existingProduct : existingProducts) {
            if (existingProduct.getId() != null) {
                existingProductMap.put(existingProduct.getId(), existingProduct);
            }
        }
        
        // Track products to keep
        Set<Long> productsToKeep = new HashSet<>();
        
        // Update or create products
        for (int i = 0; i < productRequests.size(); i++) {
            OrderProductRequest productRequest = productRequests.get(i);
            
            // Extract files for this specific product
            List<MultipartFile> productFiles = getFilesForProduct(request, i);
            
            if (productRequest.getId() != null && existingProductMap.containsKey(productRequest.getId())) {
                // Update existing product
                OrderProduct existingProduct = existingProductMap.get(productRequest.getId());
                productsToKeep.add(existingProduct.getId());
                
                productHandler.updateOrderProduct(existingProduct, productRequest, productFiles);
            } else {
                // Create new product
                productHandler.createOrderProduct(productRequest, order, productFiles);
            }
        }
        
        // Delete products that are no longer needed
        for (OrderProduct existingProduct : existingProducts) {
            if (existingProduct.getId() != null && !productsToKeep.contains(existingProduct.getId())) {
                productHandler.deleteOrderProduct(existingProduct);
            }
        }
    }
}
