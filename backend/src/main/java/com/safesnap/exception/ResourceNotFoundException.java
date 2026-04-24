package com.safesnap.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends SafeSnapException {

    public ResourceNotFoundException(String resourceName, Object id) {
        super("%s not found with id: %s".formatted(resourceName, id), HttpStatus.NOT_FOUND);
    }

    public ResourceNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }
}
