package com.tripzin.eleganttex.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

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

    @JsonValue
    public String toValue() {
        return displayName; // serializes using display name
    }

    /**
     * Convert a string to an OrderType enum value.
     * Tries to match by name or display name.
     *
     * @param name the string to convert
     * @return the corresponding OrderType or null if not found
     */
    @JsonCreator
    public static OrderType fromString(String name) {
        if (name == null) {
            return null;
        }

        // Try to match by enum name
        try {
            return OrderType.valueOf(name.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Try to match by display name
            for (OrderType type : OrderType.values()) {
                if (type.getDisplayName().equalsIgnoreCase(name)) {
                    return type;
                }
            }
            return null;
        }
    }
}
