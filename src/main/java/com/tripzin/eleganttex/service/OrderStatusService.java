package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.dto.response.OrderResponse;
import com.tripzin.eleganttex.entity.OrderStatus;

import java.util.Set;

/**
 * Service interface for order status operations
 */
public interface OrderStatusService {
    /**
     * Update order status
     * @param id Order ID
     * @param status New status
     * @param notes Optional notes about the status change
     * @param userId User ID of the user making the change
     * @return Updated order response
     */
    OrderResponse updateOrderStatus(Long id, String status, String notes, Long userId);
    
    /**
     * Validates if a status transition is allowed
     * @param currentStatus the current status of the order
     * @param newStatus the new status to transition to
     * @return true if the transition is valid, false otherwise
     */
    boolean isValidTransition(OrderStatus currentStatus, OrderStatus newStatus);
    
    /**
     * Get valid next statuses for the current status
     * @param currentStatus the current status of the order
     * @return a set of valid next statuses
     */
    Set<OrderStatus> getValidNextStatuses(OrderStatus currentStatus);
    
    /**
     * Get valid next statuses for the current status as display names
     * @param currentStatus the current status of the order as a string
     * @return a set of valid next status display names
     */
    Set<String> getValidNextStatusDisplayNames(String currentStatus);
}
