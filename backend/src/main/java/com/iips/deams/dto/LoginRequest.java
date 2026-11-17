package com.iips.deams.dto;

public record LoginRequest(String usernameOrEmail, String password) {
    public String getUsernameOrEmail() { return usernameOrEmail; }
    public String getPassword() { return password; }
}
