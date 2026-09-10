package com.bluegen.deepsyncapp.controller;

import com.bluegen.deepsyncapp.model.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiError> handleBindException(BindException exception,
                                                        HttpServletRequest request) {
        String message = exception.getBindingResult().getAllErrors().stream()
                .map(this::describe)
                .collect(Collectors.joining("; "));
        return build(HttpStatus.BAD_REQUEST, message, request);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException exception,
                                                       HttpServletRequest request) {
        String message = "Parameter '%s' has an unusable value: %s"
                .formatted(exception.getName(), exception.getValue());
        return build(HttpStatus.BAD_REQUEST, message, request);
    }

    private String describe(ObjectError error) {
        if (error instanceof FieldError fieldError) {
            return "%s %s".formatted(fieldError.getField(), fieldError.getDefaultMessage());
        }
        return error.getDefaultMessage();
    }

    private ResponseEntity<ApiError> build(HttpStatus status, String message,
                                           HttpServletRequest request) {
        ApiError body = new ApiError(Instant.now(), status.value(),
                status.getReasonPhrase(), message, request.getRequestURI());
        return ResponseEntity.status(status).body(body);
    }
}
