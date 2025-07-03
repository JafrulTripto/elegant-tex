package com.tripzin.eleganttex.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when there is an error generating a report
 */
public class ReportGenerationException extends AppException {
    
    public ReportGenerationException(String message) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    public ReportGenerationException(String message, Throwable cause) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR);
        initCause(cause);
    }
}
