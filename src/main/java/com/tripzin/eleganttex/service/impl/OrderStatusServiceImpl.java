package com.tripzin.eleganttex.service.impl;

import com.tripzin.eleganttex.dto.response.OrderResponse;
import com.tripzin.eleganttex.entity.Order;
import com.tripzin.eleganttex.entity.OrderStatus;
import com.tripzin.eleganttex.entity.OrderStatusHistory;
import com.tripzin.eleganttex.entity.User;
import com.tripzin.eleganttex.exception.InvalidStatusTransitionException;
import com.tripzin.eleganttex.exception.ResourceNotFoundException;
import com.tripzin.eleganttex.repository.OrderRepository;
import com.tripzin.eleganttex.repository.OrderStatusHistoryRepository;
import com.tripzin.eleganttex.repository.UserRepository;
import com.tripzin.eleganttex.service.OrderStatusService;
import com.tripzin.eleganttex.service.OrderStatusValidationService;
import com.tripzin.eleganttex.service.mapper.OrderMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Set;

/**
 * Implementation of OrderStatusService for handling order status operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderStatusServiceImpl implements OrderStatusService {

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final UserRepository userRepository;
    private final OrderStatusValidationService statusValidationService;
    private final OrderMapper orderMapper;

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
        if (!isValidTransition(currentStatus, newStatus)) {
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
     * Validates if a status transition is allowed
     */
    @Override
    public boolean isValidTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        return statusValidationService.isValidTransition(currentStatus, newStatus);
    }

    /**
     * Get valid next statuses for the current status
     */
    @Override
    public Set<OrderStatus> getValidNextStatuses(OrderStatus currentStatus) {
        return statusValidationService.getValidNextStatuses(currentStatus);
    }

    /**
     * Get valid next statuses for the current status as display names
     */
    @Override
    public Set<String> getValidNextStatusDisplayNames(String currentStatus) {
        return statusValidationService.getValidNextStatusDisplayNames(currentStatus);
    }
    
    /**
     * Get user by ID
     */
    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
    }
}
