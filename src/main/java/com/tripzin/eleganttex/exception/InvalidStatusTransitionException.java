package com.tripzin.eleganttex.exception;

import com.tripzin.eleganttex.entity.OrderStatus;

/**
 * Exception thrown when an invalid order status transition is attempted.
 */
public class InvalidStatusTransitionException extends BadRequestException {
    
    private final OrderStatus fromStatus;
    private final OrderStatus toStatus;
    
    public InvalidStatusTransitionException(OrderStatus fromStatus, OrderStatus toStatus) {
        super("Invalid status transition from " + fromStatus.getDisplayName() + " to " + toStatus.getDisplayName());
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
    }
    
    public OrderStatus getFromStatus() {
        return fromStatus;
    }
    
    public OrderStatus getToStatus() {
        return toStatus;
    }
}
