package com.iips.deams.controller;

import com.iips.deams.dto.ApiResponse;
import com.iips.deams.dto.AuthResponse;
import com.iips.deams.dto.LoginRequest;
import com.iips.deams.dto.RegisterRequest;
import com.iips.deams.model.User;
import com.iips.deams.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Login successful", authService.login(loginRequest, request.getRemoteAddr())));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody RegisterRequest registerRequest, HttpServletRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Registration successful", authService.register(registerRequest, request.getRemoteAddr())));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        return ResponseEntity.ok(ApiResponse.ok("Current user details", authService.getUserByUsername(authentication.getName())));
    }
}
