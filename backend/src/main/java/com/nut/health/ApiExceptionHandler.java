package com.nut.health;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler({HealthEntryNotFoundException.class, TimelineNotFoundException.class})
    @ResponseStatus(HttpStatus.NOT_FOUND)
    ErrorResponse handleNotFound(RuntimeException exception) {
        return new ErrorResponse(exception.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ErrorResponse handleBadRequest(RuntimeException exception) { return new ErrorResponse(exception.getMessage()); }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ErrorResponse handleValidation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream().findFirst()
                .map(error -> error.getDefaultMessage()).orElse("请求参数无效。");
        return new ErrorResponse(message);
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    ErrorResponse handleForbidden(RuntimeException exception) { return new ErrorResponse(exception.getMessage()); }

    record ErrorResponse(String message) {}
}
