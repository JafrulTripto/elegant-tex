package com.tripzin.eleganttex.service.impl;

import com.tripzin.eleganttex.dto.response.OrderResponse;
import com.tripzin.eleganttex.entity.Order;
import com.tripzin.eleganttex.entity.OrderProduct;
import com.tripzin.eleganttex.entity.OrderStatus;
import com.tripzin.eleganttex.entity.OrderType;
import com.tripzin.eleganttex.exception.ResourceNotFoundException;
import com.tripzin.eleganttex.repository.OrderRepository;
import com.tripzin.eleganttex.service.OrderSearchService;
import com.tripzin.eleganttex.service.mapper.OrderMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Implementation of OrderSearchService for handling order search and filtering operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderSearchServiceImpl implements OrderSearchService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

    /**
     * Get all orders with pagination
     */
    @Override
    public Page<OrderResponse> getAllOrders(Long currentUserId, boolean hasReadAllPermission, Pageable pageable) {
        log.info("Getting all orders with pagination for user ID: {}, hasReadAllPermission: {}", currentUserId, hasReadAllPermission);
        
        if (hasReadAllPermission) {
            return orderRepository.findAll(pageable)
                    .map(orderMapper::mapOrderToResponse);
        } else {
            return orderRepository.findByCreatedById(currentUserId, pageable)
                    .map(orderMapper::mapOrderToResponse);
        }
    }

    /**
     * Get orders by marketplace ID
     */
    @Override
    public Page<OrderResponse> getOrdersByMarketplaceId(Long marketplaceId, Long currentUserId, boolean hasReadAllPermission, Pageable pageable) {
        log.info("Getting orders by marketplace ID: {} for user ID: {}, hasReadAllPermission: {}", marketplaceId, currentUserId, hasReadAllPermission);
        
        if (hasReadAllPermission) {
            return orderRepository.findByMarketplaceId(marketplaceId, pageable)
                    .map(orderMapper::mapOrderToResponse);
        } else {
            // Use the repository method that filters by both marketplace ID and created by user ID
            OrderStatus status = null;
            LocalDate startDate = null;
            LocalDate endDate = null;
            return orderRepository.findByFiltersWithCreatedBy(status, startDate, endDate, marketplaceId, currentUserId, null, null, null, pageable)
                    .map(orderMapper::mapOrderToResponse);
        }
    }

    /**
     * Get orders by status
     */
    @Override
    public Page<OrderResponse> getOrdersByStatus(String statusStr, Long currentUserId, boolean hasReadAllPermission, Pageable pageable) {
        log.info("Getting orders by status: {} for user ID: {}, hasReadAllPermission: {}", statusStr, currentUserId, hasReadAllPermission);
        
        OrderStatus status = OrderStatus.fromString(statusStr);
        
        if (hasReadAllPermission) {
            return orderRepository.findByStatus(status, pageable)
                    .map(orderMapper::mapOrderToResponse);
        } else {
            // Use the repository method that filters by both status and created by user ID
            LocalDate startDate = null;
            LocalDate endDate = null;
            Long marketplaceId = null;
            return orderRepository.findByFiltersWithCreatedBy(status, startDate, endDate, marketplaceId, currentUserId, null, null, null, pageable)
                    .map(orderMapper::mapOrderToResponse);
        }
    }

    /**
     * Get orders by delivery date range
     */
    @Override
    public Page<OrderResponse> getOrdersByDeliveryDateBetween(LocalDate startDate, LocalDate endDate, Long currentUserId, boolean hasReadAllPermission, Pageable pageable) {
        log.info("Getting orders by delivery date between: {} and {} for user ID: {}, hasReadAllPermission: {}", 
                startDate, endDate, currentUserId, hasReadAllPermission);
        
        if (hasReadAllPermission) {
            return orderRepository.findByDeliveryDateBetween(startDate, endDate, pageable)
                    .map(orderMapper::mapOrderToResponse);
        } else {
            // Use the repository method that filters by both delivery date range and created by user ID
            OrderStatus status = null;
            Long marketplaceId = null;
            return orderRepository.findByFiltersWithCreatedBy(status, startDate, endDate, marketplaceId, currentUserId, null, null, null, pageable)
                    .map(orderMapper::mapOrderToResponse);
        }
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
     * Get orders by multiple filters
     */
    @Override
    public Page<OrderResponse> getOrdersByFilters(
            String orderTypeStr,
            String statusStr,
            LocalDate startDate,
            LocalDate endDate,
            LocalDate createdStartDate,
            LocalDate createdEndDate,
            Long marketplaceId,
            Boolean isDirectMerchant,
            String customerName,
            String orderNumber,
            String deliveryChannel,
            Double minAmount,
            Double maxAmount,
            Long currentUserId,
            boolean hasReadAllPermission,
            Pageable pageable) {
        log.info("Getting orders by filters: orderType={}, status={}, startDate={}, endDate={}, createdStartDate={}, createdEndDate={}, marketplaceId={}, isDirectMerchant={}, customerName={}, orderNumber={}, deliveryChannel={}, minAmount={}, maxAmount={}, userId={}, hasReadAllPermission={}",
                orderTypeStr, statusStr, startDate, endDate, createdStartDate, createdEndDate, marketplaceId, isDirectMerchant, customerName, orderNumber, deliveryChannel, minAmount, maxAmount, currentUserId, hasReadAllPermission);
        
        OrderStatus status = statusStr != null ? OrderStatus.fromString(statusStr) : null;
        OrderType orderType = orderTypeStr != null ? OrderType.valueOf(orderTypeStr) : null;
        
        // Handle direct merchant filtering
        if (isDirectMerchant != null && isDirectMerchant) {
            marketplaceId = null; // Ensure we're looking for orders without marketplace
        }
        
        if (hasReadAllPermission) {
            if (orderType != null) {
                // If order type is provided, use the repository method that filters by order type
                return orderRepository.findByOrderTypeAndFilters(orderType, status, startDate, endDate, marketplaceId, customerName, orderNumber, deliveryChannel, minAmount, maxAmount, pageable)
                        .map(orderMapper::mapOrderToResponse);
            } else {
                // Use delivery date filtering if provided, otherwise use created date filtering
                LocalDate filterStartDate = startDate != null ? startDate : createdStartDate;
                LocalDate filterEndDate = endDate != null ? endDate : createdEndDate;
                
                return orderRepository.findByFilters(status, filterStartDate, filterEndDate, marketplaceId, customerName, orderNumber, deliveryChannel, minAmount, maxAmount, pageable)
                        .map(orderMapper::mapOrderToResponse);
            }
        } else {
            // For users without read all permission, always filter by their created orders
            LocalDate filterStartDate = startDate != null ? startDate : createdStartDate;
            LocalDate filterEndDate = endDate != null ? endDate : createdEndDate;
            
            return orderRepository.findByFiltersWithCreatedBy(status, filterStartDate, filterEndDate, marketplaceId, currentUserId, orderNumber, minAmount, maxAmount, pageable)
                    .map(orderMapper::mapOrderToResponse);
        }
    }

    /**
     * Find orders with similar products based on product type, fabric, and description
     * Limited to returned or cancelled orders
     */
    @Override
    public List<OrderResponse> findSimilarOrders(Long orderId, int limit, Long currentUserId, boolean hasReadAllPermission) {
        log.info("Finding similar orders for order ID: {} with limit: {} for user ID: {}, hasReadAllPermission: {}", 
                orderId, limit, currentUserId, hasReadAllPermission);
        
        // Get the original order with products
        Order order = orderRepository.findByIdWithProductsAndFabrics(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        
        // Extract product types and fabric IDs from the order
        List<String> productTypes = order.getProducts().stream()
                .map(OrderProduct::getProductType)
                .collect(Collectors.toList());
        
        List<Long> fabricIds = order.getProducts().stream()
                .map(product -> product.getFabric().getId())
                .collect(Collectors.toList());
        
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
        
        // Filter orders based on description similarity and user permissions
        List<Order> filteredOrders = new ArrayList<>();
        for (Order similarOrder : potentialSimilarOrders) {
            // If user doesn't have permission to view all orders, only show their own orders
            if (!hasReadAllPermission && currentUserId != null && 
                !similarOrder.getCreatedBy().getId().equals(currentUserId)) {
                continue; // Skip orders not created by the current user
            }
            
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
                .collect(Collectors.toList());
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
     * Tokenize text into a set of words
     * @param text input text
     * @return set of words
     */
    private Set<String> tokenizeText(String text) {
        if (text == null || text.isEmpty()) {
            return new HashSet<>();
        }
        
        // Convert to lowercase, remove punctuation, and split by whitespace
        String normalized = text.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
        
        return new HashSet<>(List.of(normalized.split("\\s+")));
    }
}
