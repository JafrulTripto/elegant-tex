package com.tripzin.eleganttex.service;

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
import com.tripzin.eleganttex.entity.User;
import com.tripzin.eleganttex.exception.InvalidStatusTransitionException;
import com.tripzin.eleganttex.exception.ResourceNotFoundException;
import com.tripzin.eleganttex.repository.MarketplaceRepository;
import com.tripzin.eleganttex.repository.OrderProductImageRepository;
import com.tripzin.eleganttex.repository.OrderProductRepository;
import com.tripzin.eleganttex.repository.OrderRepository;
import com.tripzin.eleganttex.repository.OrderStatusHistoryRepository;
import com.tripzin.eleganttex.repository.UserRepository;
import com.tripzin.eleganttex.service.excel.OrderExcelGenerator;
import com.tripzin.eleganttex.service.mapper.OrderMapper;
import com.tripzin.eleganttex.service.pdf.OrderPdfGenerator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Implementation of the OrderService interface
 * Optimized with design patterns and best practices
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderProductRepository orderProductRepository;
    private final OrderProductImageRepository orderProductImageRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final MarketplaceRepository marketplaceRepository;
    private final UserRepository userRepository;
    private final CustomerService customerService;
    private final OrderStatusValidationService statusValidationService;
    
    // Extracted components
    private final OrderMapper orderMapper;
    private final OrderCalculationService calculationService;
    private final OrderProductHandler productHandler;
    private final OrderPdfGenerator pdfGenerator;
    private final OrderExcelGenerator excelGenerator;

    /**
     * Create a new order
     */
    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest orderRequest, Long userId, List<MultipartFile> files) {
        log.info("Creating new order for marketplace ID: {}", orderRequest.getMarketplaceId());
        
        // Get current user
        User currentUser = getUserById(userId);
        
        // Find marketplace
        Marketplace marketplace = getMarketplaceById(orderRequest.getMarketplaceId());
        
        // Find or create customer
        Customer customer = getOrCreateCustomer(orderRequest);
        
        // Calculate total amount
        BigDecimal totalAmount = calculationService.calculateTotalFromRequests(orderRequest.getProducts())
                .add(orderRequest.getDeliveryCharge());
        
        // Create order with a temporary order number
        Order order = createInitialOrder(marketplace, customer, orderRequest, totalAmount, currentUser);
        
        // Create initial status history
        createInitialStatusHistory(order, currentUser);
        
        // Create products
        createOrderProducts(order, orderRequest.getProducts(), files);
        
        return orderMapper.mapOrderToResponse(order);
    }

    /**
     * Get order by ID
     */
    @Override
    public OrderResponse getOrderById(Long id) {
        log.info("Getting order by ID: {}", id);
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));
        
        return orderMapper.mapOrderToResponse(order);
    }

    /**
     * Update an existing order
     */
    @Override
    @Transactional
    public OrderResponse updateOrder(Long id, OrderRequest orderRequest, Long userId, List<MultipartFile> files) {
        log.info("Updating order with ID: {}", id);        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));
        Marketplace marketplace = getMarketplaceById(orderRequest.getMarketplaceId());
        Customer customer = getOrCreateCustomer(orderRequest);
        BigDecimal totalAmount = calculationService.calculateTotalFromRequests(orderRequest.getProducts())
                .add(orderRequest.getDeliveryCharge());
        updateOrderFields(order, marketplace, customer, orderRequest, totalAmount);
        updateOrderProducts(order, orderRequest.getProducts(), files);
        return orderMapper.mapOrderToResponse(order);
    }

    /**
     * Delete an order
     */
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

    /**
     * Get all orders with pagination
     */
    @Override
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        log.info("Getting all orders with pagination");
        
        return orderRepository.findAll(pageable)
                .map(orderMapper::mapOrderToResponse);
    }

    /**
     * Get orders by marketplace ID
     */
    @Override
    public Page<OrderResponse> getOrdersByMarketplaceId(Long marketplaceId, Pageable pageable) {
        log.info("Getting orders by marketplace ID: {}", marketplaceId);
        
        return orderRepository.findByMarketplaceId(marketplaceId, pageable)
                .map(orderMapper::mapOrderToResponse);
    }

    /**
     * Get orders by created by user ID
     */
    @Override
    public Page<OrderResponse> getOrdersByCreatedById(Long userId, Pageable pageable) {
        log.info("Getting orders by user ID: {}", userId);
        
        return orderRepository.findByCreatedById(userId, pageable)
                .map(orderMapper::mapOrderToResponse);
    }

    /**
     * Get orders by status
     */
    @Override
    public Page<OrderResponse> getOrdersByStatus(String statusStr, Pageable pageable) {
        log.info("Getting orders by status: {}", statusStr);
        
        OrderStatus status = OrderStatus.fromString(statusStr);
        return orderRepository.findByStatus(status, pageable)
                .map(orderMapper::mapOrderToResponse);
    }

    /**
     * Get orders by delivery date range
     */
    @Override
    public Page<OrderResponse> getOrdersByDeliveryDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        log.info("Getting orders by delivery date between: {} and {}", startDate, endDate);
        
        return orderRepository.findByDeliveryDateBetween(startDate, endDate, pageable)
                .map(orderMapper::mapOrderToResponse);
    }

    /**
     * Get orders by multiple filters
     */
    @Override
    public Page<OrderResponse> getOrdersByFilters(
            String statusStr,
            LocalDate startDate,
            LocalDate endDate,
            Long marketplaceId,
            String customerName,
            Pageable pageable) {
        log.info("Getting orders by filters: status={}, startDate={}, endDate={}, marketplaceId={}, customerName={}",
                statusStr, startDate, endDate, marketplaceId, customerName);
        
        OrderStatus status = statusStr != null ? OrderStatus.fromString(statusStr) : null;
        return orderRepository.findByFilters(status, startDate, endDate, marketplaceId, customerName, pageable)
                .map(orderMapper::mapOrderToResponse);
    }

    /**
     * Update order status
     */
    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long id, String statusStr, String notes, Long userId) {
        User updatedBy = getUserById(userId);
        log.info("Updating order status: orderId={}, status={}, updatedBy={}", id, statusStr, updatedBy.getId());
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));
        
        // Convert string status to enum
        OrderStatus newStatus = OrderStatus.fromString(statusStr);
        OrderStatus currentStatus = order.getStatus();
        
        // Validate status transition
        if (!statusValidationService.isValidTransition(currentStatus, newStatus)) {
            throw new InvalidStatusTransitionException(currentStatus, newStatus);
        }
        
        // Update order status
        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);
        
        // Create status history
        OrderStatusHistory statusHistory = OrderStatusHistory.builder()
                .order(savedOrder)
                .status(newStatus)
                .notes(notes)
                .updatedBy(updatedBy)
                .build();
        
        orderStatusHistoryRepository.save(statusHistory);
        
        return orderMapper.mapOrderToResponse(savedOrder);
    }

    /**
     * Generate PDF for an order
     */
    @Override
    public ResponseEntity<Resource> generateOrderPdf(Long id) {
        log.info("Generating PDF for order with ID: {}", id);
        
        Order order = orderRepository.findByIdWithProductsAndFabrics(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));
        
        // Load status history
        List<OrderStatusHistory> statusHistory = orderStatusHistoryRepository.findByOrderIdWithUserOrderByTimestampDesc(id);
        order.setStatusHistory(statusHistory);
        
        // Load product images for each product
        for (OrderProduct product : order.getProducts()) {
            product.setImages(orderProductImageRepository.findByOrderProductId(product.getId()));
        }
        
        // Generate PDF using the dedicated generator
        return pdfGenerator.generateOrderPdf(order);
    }

    /**
     * Generate Excel for orders
     */
    @Override
    public ResponseEntity<Resource> generateOrdersExcel(String statusStr, LocalDate startDate, LocalDate endDate) {
        log.info("Exporting orders to Excel: status={}, startDate={}, endDate={}", statusStr, startDate, endDate);
        
        // Get orders based on filters
        List<Order> orders;
        if (statusStr != null || startDate != null || endDate != null) {
            OrderStatus status = statusStr != null ? OrderStatus.fromString(statusStr) : null;
            Page<Order> orderPage = orderRepository.findByFiltersWithCreatedBy(status, startDate, endDate, null, null, Pageable.unpaged());
            orders = orderPage.getContent();
        } else {
            orders = orderRepository.findAll();
        }
        
        // Generate Excel using the dedicated generator
        return excelGenerator.generateOrdersExcel(orders, statusStr, startDate, endDate);
    }

    /**
     * Get order status counts for the current month or year
     * @param currentMonth true for current month, false for current year
     * @return List of maps containing status and count
     */
    @Override
    public List<Map<String, Object>> getOrderStatusCounts(boolean currentMonth) {
        log.info("Getting order status counts for {}", currentMonth ? "current month" : "current year");
        
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
        
        return orderRepository.getOrderStatusCountsByDateRange(
                startDate.atStartOfDay(), 
                endDate.atTime(23, 59, 59)
        );
    }
    
    /**
     * Get user order statistics
     */
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
    
    /**
     * Get marketplace order statistics
     */
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
     * Find orders with similar products based on product type AND fabric
     * Limited to returned or cancelled orders
     * Also filters by description similarity (at least 50% match)
     */
    @Override
    public List<OrderResponse> findSimilarOrders(Long orderId, int limit) {
        log.info("Finding similar orders for order ID: {} with limit: {}", orderId, limit);
        
        // Get the original order with products
        Order order = orderRepository.findByIdWithProductsAndFabrics(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        
        // Extract product types and fabric IDs from the order
        List<String> productTypes = order.getProducts().stream()
                .map(OrderProduct::getProductType)
                .collect(java.util.stream.Collectors.toList());
        
        List<Long> fabricIds = order.getProducts().stream()
                .map(product -> product.getFabric().getId())
                .collect(java.util.stream.Collectors.toList());
        
        // Create a map of product descriptions from the original order
        Map<String, String> originalProductDescriptions = new HashMap<>();
        for (OrderProduct product : order.getProducts()) {
            String key = product.getProductType() + "-" + product.getFabric().getId();
            originalProductDescriptions.put(key, product.getDescription());
        }
        
        // Find similar orders (returned or cancelled) with matching product types AND fabrics
        List<Order> potentialSimilarOrders = orderRepository.findSimilarOrders(
                orderId, 
                productTypes, 
                fabricIds,
                limit * 2); // Get more than needed to allow for filtering
        
        log.info("Found {} potential similar orders for order ID: {}", potentialSimilarOrders.size(), orderId);
        
        // Filter orders based on description similarity
        List<Order> filteredOrders = new ArrayList<>();
        for (Order similarOrder : potentialSimilarOrders) {
            boolean hasMatchingProduct = false;
            
            for (OrderProduct product : similarOrder.getProducts()) {
                String key = product.getProductType() + "-" + product.getFabric().getId();
                String originalDescription = originalProductDescriptions.get(key);
                
                if (originalDescription != null && product.getDescription() != null) {
                    double similarity = calculateTextSimilarity(originalDescription, product.getDescription());
                    if (similarity >= 0.5) { // At least 50% similarity
                        hasMatchingProduct = true;
                        break;
                    }
                }
            }
            
            if (hasMatchingProduct) {
                filteredOrders.add(similarOrder);
                if (filteredOrders.size() >= limit) {
                    break; // Stop once we have enough orders
                }
            }
        }
        
        log.info("Filtered to {} similar orders with matching descriptions for order ID: {}", 
                filteredOrders.size(), orderId);
        
        // Map to response DTOs
        return filteredOrders.stream()
                .map(orderMapper::mapOrderToResponse)
                .collect(java.util.stream.Collectors.toList());
    }
    
    /**
     * Calculate text similarity using Jaccard similarity
     * @param text1 first text
     * @param text2 second text
     * @return similarity score between 0 and 1
     */
    private double calculateTextSimilarity(String text1, String text2) {
        if (text1 == null || text2 == null) {
            return 0.0;
        }
        
        // Normalize texts and split into words
        Set<String> words1 = tokenizeText(text1);
        Set<String> words2 = tokenizeText(text2);
        
        // Calculate Jaccard similarity: intersection size / union size
        Set<String> intersection = new HashSet<>(words1);
        intersection.retainAll(words2);
        
        Set<String> union = new HashSet<>(words1);
        union.addAll(words2);
        
        if (union.isEmpty()) {
            return 0.0;
        }
        
        return (double) intersection.size() / union.size();
    }
    
    /**
     * Get daily order counts between two dates
     * @param startDate start date (inclusive)
     * @param endDate end date (inclusive)
     * @return List of maps containing date and count
     */
    @Override
    public List<Map<String, Object>> getMonthlyOrderData(LocalDate startDate, LocalDate endDate) {
        log.info("Getting monthly order data from {} to {}", startDate, endDate);
        
        // Get counts directly from the database
        List<Object[]> results = orderRepository.countOrdersByDateBetween(startDate, endDate);
        
        // Initialize all dates in the range with 0 orders
        Map<String, Integer> ordersByDate = new HashMap<>();
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            ordersByDate.put(current.toString(), 0);
            current = current.plusDays(1);
        }
        
        // Fill in actual counts from database results
        for (Object[] result : results) {
            String date = ((LocalDate) result[0]).toString();
            Integer count = ((Number) result[1]).intValue();
            ordersByDate.put(date, count);
        }
        
        // Convert to list of maps for the response
        List<Map<String, Object>> response = new ArrayList<>();
        ordersByDate.forEach((date, count) -> {
            Map<String, Object> entry = new HashMap<>();
            entry.put("date", date);
            entry.put("count", count);
            response.add(entry);
        });
        
        // Sort by date
        response.sort(Comparator.comparing(m -> (String) m.get("date")));
        
        return response;
    }
    
    /**
     * Tokenize text into a set of words
     * @param text input text
     * @return set of words
     */
    private Set<String> tokenizeText(String text) {
        if (text == null || text.isEmpty()) {
            return Collections.emptySet();
        }
        
        // Convert to lowercase, remove punctuation, and split by whitespace
        String normalized = text.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
        
        return new HashSet<>(Arrays.asList(normalized.split("\\s+")));
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
     */
    private Marketplace getMarketplaceById(Long marketplaceId) {
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
            // Create new customer or find by phone
            CustomerResponse customerResponse = customerService.findOrCreateCustomer(orderRequest.getCustomerData());
            Customer customer = customerService.getCustomerEntityById(customerResponse.getId());
            log.info("Found or created customer with ID: {}", customer.getId());
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
     * Create order products
     */
    private void createOrderProducts(Order order, List<OrderProductRequest> productRequests, List<MultipartFile> files) {
        for (OrderProductRequest productRequest : productRequests) {
            productHandler.createOrderProduct(productRequest, order, files);
        }
    }
    
    /**
     * Update order fields
     */
    private void updateOrderFields(Order order, Marketplace marketplace, Customer customer, OrderRequest orderRequest, BigDecimal totalAmount) {
        order.setMarketplace(marketplace);
        order.setCustomer(customer);
        order.setDeliveryChannel(orderRequest.getDeliveryChannel());
        order.setDeliveryCharge(orderRequest.getDeliveryCharge());
        order.setDeliveryDate(orderRequest.getDeliveryDate());
        order.setTotalAmount(totalAmount);
        
        orderRepository.save(order);
    }
    
    /**
     * Update order products
     */
    private void updateOrderProducts(Order order, List<OrderProductRequest> productRequests, List<MultipartFile> files) {
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
        for (OrderProductRequest productRequest : productRequests) {
            if (productRequest.getId() != null && existingProductMap.containsKey(productRequest.getId())) {
                // Update existing product
                OrderProduct existingProduct = existingProductMap.get(productRequest.getId());
                productsToKeep.add(existingProduct.getId());
                
                productHandler.updateOrderProduct(existingProduct, productRequest, files);
            } else {
                // Create new product
                productHandler.createOrderProduct(productRequest, order, files);
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
