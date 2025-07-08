package com.tripzin.eleganttex.exception;

/**
 * Exception thrown when messaging account configuration is invalid
 */
public class AccountConfigurationException extends BadRequestException {
    
    public AccountConfigurationException(String message) {
        super(message);
    }
}
