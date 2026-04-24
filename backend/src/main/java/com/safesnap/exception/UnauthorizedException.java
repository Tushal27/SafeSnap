package com.safesnap.exception;

import org.springframework.http.HttpStatus;

public class UnauthorizedException extends SafeSnapException {

    public UnauthorizedException(String message) {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}
