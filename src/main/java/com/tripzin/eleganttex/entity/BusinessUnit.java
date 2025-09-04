package com.tripzin.eleganttex.entity;

/**
 * Enum representing different business units in the organization
 */
public enum BusinessUnit {
    MIRPUR("Mirpur"),
    TONGI("Tongi");

    private final String displayName;

    BusinessUnit(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Convert string to BusinessUnit enum
     * @param value the string value
     * @return BusinessUnit enum or null if not found
     */
    public static BusinessUnit fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        
        for (BusinessUnit unit : BusinessUnit.values()) {
            if (unit.name().equalsIgnoreCase(value.trim()) || 
                unit.getDisplayName().equalsIgnoreCase(value.trim())) {
                return unit;
            }
        }
        return null;
    }

    @Override
    public String toString() {
        return displayName;
    }
}
