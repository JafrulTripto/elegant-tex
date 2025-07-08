package com.tripzin.eleganttex.exception;

/**
 * Exception thrown when webhook verification fails
 */
public class WebhookVerificationException extends BadRequestException {
    
    public WebhookVerificationException(String message) {
        super(message);
    }
}
