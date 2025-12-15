package com.tripzin.eleganttex.entity;

/**
 * Enum representing the status of a store adjustment request
 */
public enum StoreAdjustmentStatus {
    PENDING("Pending"),
    APPROVED("Approved"),
    REJECTED("Rejected");
    
    private final String displayName;
    
    StoreAdjustmentStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public static StoreAdjustmentStatus fromString(String name) {
        if (name == null) {
            return null;
        }
        
        try {
            return valueOf(name.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Try to match by display name
            for (StoreAdjustmentStatus status : values()) {
                if (status.getDisplayName().equalsIgnoreCase(name)) {
                    return status;
                }
            }
            return null;
        }
    }
}
