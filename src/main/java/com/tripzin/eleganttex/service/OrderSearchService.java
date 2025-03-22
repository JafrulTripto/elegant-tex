package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.dto.response.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;

import java.time.LocalDate;
import java.util.List;

/**
 * Service interface for order search and filtering operations
 */
public interface OrderSearchService {
    /**
     * Get all orders with pagination
     * @param currentUserId ID of the current user
     * @param hasReadAllPermission whether the user has permission to view all orders
     * @param pageable pagination information
     * @return page of order responses
     */
    Page<OrderResponse> getAllOrders(Long currentUserId, boolean hasReadAllPermission, Pageable pageable);
    
    /**
     * Get orders by marketplace ID
     * @param marketplaceId marketplace ID
     * @param currentUserId ID of the current user
     * @param hasReadAllPermission whether the user has permission to view all orders
     * @param pageable pagination information
     * @return page of order responses
     */
    Page<OrderResponse> getOrdersByMarketplaceId(Long marketplaceId, Long currentUserId, boolean hasReadAllPermission, Pageable pageable);
    
    /**
     * Get orders by status
     * @param status order status
     * @param currentUserId ID of the current user
     * @param hasReadAllPermission whether the user has permission to view all orders
     * @param pageable pagination information
     * @return page of order responses
     */
    Page<OrderResponse> getOrdersByStatus(String status, Long currentUserId, boolean hasReadAllPermission, Pageable pageable);
    
    /**
     * Get orders by delivery date range
     * @param startDate start date (inclusive)
     * @param endDate end date (inclusive)
     * @param currentUserId ID of the current user
     * @param hasReadAllPermission whether the user has permission to view all orders
     * @param pageable pagination information
     * @return page of order responses
     */
    Page<OrderResponse> getOrdersByDeliveryDateBetween(LocalDate startDate, LocalDate endDate, Long currentUserId, boolean hasReadAllPermission, Pageable pageable);
    
    /**
     * Get orders by created by user ID
     * @param userId user ID
     * @param pageable pagination information
     * @return page of order responses
     */
    Page<OrderResponse> getOrdersByCreatedById(Long userId, Pageable pageable);
    
    /**
     * Get orders by multiple filters
     * @param status order status
     * @param startDate start date (inclusive)
     * @param endDate end date (inclusive)
     * @param marketplaceId marketplace ID
     * @param customerName customer name
     * @param currentUserId ID of the current user
     * @param hasReadAllPermission whether the user has permission to view all orders
     * @param pageable pagination information
     * @return page of order responses
     */
    Page<OrderResponse> getOrdersByFilters(
            String status, 
            LocalDate startDate, 
            LocalDate endDate, 
            Long marketplaceId, 
            String customerName,
            Long currentUserId,
            boolean hasReadAllPermission,
            Pageable pageable);
    
    /**
     * Find orders with similar products based on product type, fabric, and description
     * Limited to returned or cancelled orders
     * @param orderId the order ID to find similar orders for
     * @param limit maximum number of similar orders to return
     * @param currentUserId ID of the current user
     * @param hasReadAllPermission whether the user has permission to view all orders
     * @return list of similar orders
     */
    List<OrderResponse> findSimilarOrders(Long orderId, int limit, Long currentUserId, boolean hasReadAllPermission);
}
