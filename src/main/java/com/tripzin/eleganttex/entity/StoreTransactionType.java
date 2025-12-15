package com.tripzin.eleganttex.entity;

/**
 * Enum representing the type of store transaction
 */
public enum StoreTransactionType {
    RECEIVE("Receive"),
    ADJUST("Adjust"),
    QUALITY_CHANGE("Quality Change"),
    USE("Use"),
    WRITE_OFF("Write-off"),
    TRANSFER("Transfer");
    
    private final String displayName;
    
    StoreTransactionType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public static StoreTransactionType fromString(String name) {
        if (name == null) {
            return null;
        }
        
        try {
            return valueOf(name.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Try to match by display name
            for (StoreTransactionType type : values()) {
                if (type.getDisplayName().equalsIgnoreCase(name)) {
                    return type;
                }
            }
            return null;
        }
    }
}
