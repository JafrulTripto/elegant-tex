package com.tripzin.eleganttex.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when Facebook or WhatsApp API calls fail
 */
public class MessagingApiException extends AppException {
    
    public MessagingApiException(String message) {
        super(message, HttpStatus.BAD_GATEWAY);
    }
    
    public MessagingApiException(String message, HttpStatus status) {
        super(message, status);
    }
}
