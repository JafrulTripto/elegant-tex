package com.tripzin.eleganttex.exception;

import org.springframework.http.HttpStatus;

public class ForbiddenException extends AppException {
    
    public ForbiddenException(String message) {
        super(message, HttpStatus.FORBIDDEN);
    }
}
