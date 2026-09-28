package com.app.bloodbank.exception;

public class DonorNotEligibleException extends RuntimeException {

    public DonorNotEligibleException(String message) {
        super(message);
    }
}