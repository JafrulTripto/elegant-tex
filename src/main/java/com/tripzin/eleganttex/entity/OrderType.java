package com.tripzin.eleganttex.entity;

/**
 * Enum representing the type of order.
 * MARKETPLACE: Orders placed through a marketplace (e.g., Facebook, WhatsApp)
 * MERCHANT: Orders placed directly by merchants (bulk orders)
 */
public enum OrderType {
    MARKETPLACE("Marketplace"),
    MERCHANT("Merchant");
    
    private final String displayName;
    
    OrderType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    /**
     * Convert a string to an OrderType enum value.
     * Tries to match by name or display name.
     * 
     * @param name the string to convert
     * @return the corresponding OrderType or null if not found
     */
    public static OrderType fromString(String name) {
        if (name == null) {
            return null;
        }
        
        // Try to match by enum name
        try {
            return OrderType.valueOf(name.toUpperCase());
        } catch (IllegalArgumentException e) {
            // If not a direct match, try to match by display name
            for (OrderType type : OrderType.values()) {
                if (type.getDisplayName().equalsIgnoreCase(name)) {
                    return type;
                }
            }
            return null;
        }
    }
}
