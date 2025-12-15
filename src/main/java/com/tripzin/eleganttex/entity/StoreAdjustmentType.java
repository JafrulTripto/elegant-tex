package com.tripzin.eleganttex.entity;

/**
 * Enum representing the type of adjustment
 */
public enum StoreAdjustmentType {
    REMOVE("Remove"),
    MANUAL_ENTRY("Manual Entry"),
    AUTO_ADD("Auto Add");
    
    private final String displayName;
    
    StoreAdjustmentType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public static StoreAdjustmentType fromString(String name) {
        if (name == null) {
            return null;
        }
        
        try {
            return valueOf(name.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Try to match by display name
            for (StoreAdjustmentType type : values()) {
                if (type.getDisplayName().equalsIgnoreCase(name)) {
                    return type;
                }
            }
            return null;
        }
    }
}
