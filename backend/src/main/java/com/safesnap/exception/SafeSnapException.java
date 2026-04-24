package com.safesnap.exception;

import org.springframework.http.HttpStatus;

/**
 * Base application exception. Carries an HTTP status so the global handler
 * can map it directly without a chain of if-instanceof checks.
 */
public class SafeSnapException extends RuntimeException {

    private final HttpStatus status;

    public SafeSnapException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public SafeSnapException(String message, HttpStatus status, Throwable cause) {
        super(message, cause);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
