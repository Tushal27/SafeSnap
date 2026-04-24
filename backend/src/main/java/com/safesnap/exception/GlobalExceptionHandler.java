package com.safesnap.exception;

import com.safesnap.dto.response.ApiErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(SafeSnapException.class)
    public ResponseEntity<ApiErrorResponse> handleSafeSnapException(
        SafeSnapException ex, WebRequest request
    ) {
        log.warn("Application error [{}]: {}", ex.getStatus(), ex.getMessage());
        return ResponseEntity
            .status(ex.getStatus())
            .body(ApiErrorResponse.of(ex.getStatus().value(), ex.getMessage(), extractPath(request)));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationException(
        MethodArgumentNotValidException ex, WebRequest request
    ) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining("; "));
        log.debug("Validation failed: {}", message);
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiErrorResponse.of(HttpStatus.BAD_REQUEST.value(), message, extractPath(request)));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGenericException(
        Exception ex, WebRequest request
    ) {
        log.error("Unhandled exception", ex);
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiErrorResponse.of(500, "An unexpected error occurred", extractPath(request)));
    }

    private String extractPath(WebRequest request) {
        String description = request.getDescription(false);
        // description format: "uri=/api/v1/..."
        return description.startsWith("uri=") ? description.substring(4) : description;
    }
}
