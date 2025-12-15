package com.tripzin.eleganttex.entity;

/**
 * Enum representing the source of a store item
 */
public enum StoreItemSource {
    RETURNED_ORDER("Returned Order"),
    CANCELLED_ORDER("Cancelled Order"),
    MANUAL_ENTRY("Manual Entry");
    
    private final String displayName;
    
    StoreItemSource(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public static StoreItemSource fromString(String name) {
        if (name == null) {
            return null;
        }
        
        try {
            return valueOf(name.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Try to match by display name
            for (StoreItemSource source : values()) {
                if (source.getDisplayName().equalsIgnoreCase(name)) {
                    return source;
                }
            }
            return null;
        }
    }
}
