package com.tripzin.eleganttex.service.email;

/**
 * Enum representing the available email provider types
 */
public enum EmailProviderType {
    SMTP,
    RESEND;
    
    /**
     * Convert a string to an EmailProviderType
     * 
     * @param value the string value to convert
     * @return the corresponding EmailProviderType, defaults to SMTP if not found
     */
    public static EmailProviderType fromString(String value) {
        if (value == null) {
            return SMTP;
        }
        
        try {
            return valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return SMTP;
        }
    }
}
