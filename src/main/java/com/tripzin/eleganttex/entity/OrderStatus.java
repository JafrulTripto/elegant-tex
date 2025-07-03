package com.tripzin.eleganttex.entity;

/**
 * Enum representing the possible statuses of an order.
 */
public enum OrderStatus {
    ORDER_CREATED("Order Created"),
    APPROVED("Approved"),
    BOOKING("Booking"),
    PRODUCTION("Production"),
    QA("QA"),
    READY("Ready"),
    DELIVERED("Delivered"),
    RETURNED("Returned"),
    CANCELLED("Cancelled");
    
    private final String displayName;
    
    OrderStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    /**
     * Convert a display name to the corresponding enum value
     * @param displayName the display name to convert
     * @return the corresponding enum value, or null if not found
     */
    public static OrderStatus fromDisplayName(String displayName) {
        for (OrderStatus status : OrderStatus.values()) {
            if (status.getDisplayName().equals(displayName)) {
                return status;
            }
        }
        return null;
    }
    
    /**
     * Convert a string representation of the enum to the corresponding enum value
     * @param name the string representation to convert
     * @return the corresponding enum value, or ORDER_CREATED if not found
     */
    public static OrderStatus fromString(String name) {
        try {
            return valueOf(name);
        } catch (IllegalArgumentException | NullPointerException e) {
            // Try to match by display name
            OrderStatus status = fromDisplayName(name);
            if (status != null) {
                return status;
            }
            
            // Handle legacy status names
            if ("Created".equals(name)) {
                return ORDER_CREATED;
            } else if ("In Progress".equals(name)) {
                return PRODUCTION;
            } else if ("In QA".equals(name)) {
                return QA;
            }
            
            // Default to ORDER_CREATED if no match
            return null;
        }
    }
}
