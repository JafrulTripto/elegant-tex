package com.tripzin.eleganttex.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends AppException {
    
    public ResourceNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }
}
