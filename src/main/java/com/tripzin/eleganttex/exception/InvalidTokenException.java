package com.tripzin.eleganttex.exception;

/**
 * Exception thrown when access tokens are invalid or expired
 */
public class InvalidTokenException extends UnauthorizedException {
    
    public InvalidTokenException(String message) {
        super(message);
    }
}
