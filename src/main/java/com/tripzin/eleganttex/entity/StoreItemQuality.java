package com.tripzin.eleganttex.entity;

/**
 * Enum representing the quality condition of a store item
 */
public enum StoreItemQuality {
    NEW("New"),
    GOOD("Good"),
    FAIR("Fair"),
    DAMAGED("Damaged"),
    WRITE_OFF("Write-off");
    
    private final String displayName;
    
    StoreItemQuality(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public static StoreItemQuality fromString(String name) {
        if (name == null) {
            return null;
        }
        
        try {
            return valueOf(name.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Try to match by display name
            for (StoreItemQuality quality : values()) {
                if (quality.getDisplayName().equalsIgnoreCase(name)) {
                    return quality;
                }
            }
            return null;
        }
    }
}
