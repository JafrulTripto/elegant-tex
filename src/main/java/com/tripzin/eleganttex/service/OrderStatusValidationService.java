package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.entity.OrderStatus;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service for validating order status transitions.
 */
@Service
public class OrderStatusValidationService {
    
    // Define valid status transitions
    private static final Map<OrderStatus, Set<OrderStatus>> VALID_TRANSITIONS = new HashMap<>();
    
    static {
        // Initialize valid transitions
        VALID_TRANSITIONS.put(OrderStatus.ORDER_CREATED,
            Set.of(OrderStatus.APPROVED, OrderStatus.CANCELLED, OrderStatus.ON_HOLD));

        VALID_TRANSITIONS.put(OrderStatus.APPROVED,
            Set.of(OrderStatus.PRODUCTION, OrderStatus.CANCELLED, OrderStatus.ON_HOLD));

        VALID_TRANSITIONS.put(OrderStatus.PRODUCTION,
            Set.of(OrderStatus.QA, OrderStatus.CANCELLED, OrderStatus.ON_HOLD));

        VALID_TRANSITIONS.put(OrderStatus.QA,
            Set.of(OrderStatus.READY, OrderStatus.CANCELLED, OrderStatus.ON_HOLD));

        VALID_TRANSITIONS.put(OrderStatus.READY,
            Set.of(OrderStatus.BOOKING, OrderStatus.CANCELLED, OrderStatus.ON_HOLD));

        VALID_TRANSITIONS.put(OrderStatus.BOOKING,
                Set.of(OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.ON_HOLD, OrderStatus.RETURNED));

        VALID_TRANSITIONS.put(OrderStatus.DELIVERED,
            Set.of(OrderStatus.RETURNED));

        Set<OrderStatus> allExceptHold = EnumSet.allOf(OrderStatus.class);
        allExceptHold.remove(OrderStatus.ON_HOLD);
        VALID_TRANSITIONS.put(OrderStatus.ON_HOLD, allExceptHold);

        // Terminal states
        VALID_TRANSITIONS.put(OrderStatus.RETURNED, Collections.emptySet());
        VALID_TRANSITIONS.put(OrderStatus.CANCELLED, Collections.emptySet());
    }
    
    /**
     * Validates if a status transition is allowed
     * @param currentStatus the current status of the order
     * @param newStatus the new status to transition to
     * @return true if the transition is valid, false otherwise
     */
    public boolean isValidTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (currentStatus == newStatus) {
            return true; // Same status is always valid
        }
        
        Set<OrderStatus> validNextStatuses = VALID_TRANSITIONS.get(currentStatus);
        return validNextStatuses != null && validNextStatuses.contains(newStatus);
    }
    
    /**
     * Get valid next statuses for the current status
     * @param currentStatus the current status of the order
     * @return a set of valid next statuses
     */
    public Set<OrderStatus> getValidNextStatuses(OrderStatus currentStatus) {
        return VALID_TRANSITIONS.getOrDefault(currentStatus, Collections.emptySet());
    }
    
    /**
     * Validates if a status transition is allowed
     * @param currentStatus the current status of the order as a string
     * @param newStatus the new status to transition to as a string
     * @return true if the transition is valid, false otherwise
     */
    public boolean isValidTransition(String currentStatus, String newStatus) {
        OrderStatus current = OrderStatus.fromString(currentStatus);
        OrderStatus next = OrderStatus.fromString(newStatus);
        return isValidTransition(current, next);
    }
    
    /**
     * Get valid next statuses for the current status
     * @param currentStatus the current status of the order as a string
     * @return a set of valid next status display names
     */
    public Set<String> getValidNextStatusDisplayNames(String currentStatus) {
        OrderStatus current = OrderStatus.fromString(currentStatus);
        Set<OrderStatus> validStatuses = getValidNextStatuses(current);
        
        Set<String> displayNames = new HashSet<>();
        for (OrderStatus status : validStatuses) {
            displayNames.add(status.getDisplayName());
        }
        
        return displayNames;
    }
}
