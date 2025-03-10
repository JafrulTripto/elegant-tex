package com.tripzin.eleganttex.controller;

import com.tripzin.eleganttex.dto.request.EmailVerificationRequest;
import com.tripzin.eleganttex.dto.request.LoginRequest;
import com.tripzin.eleganttex.dto.request.ResendVerificationRequest;
import com.tripzin.eleganttex.dto.request.SignupRequest;
import com.tripzin.eleganttex.dto.request.TokenRefreshRequest;
import com.tripzin.eleganttex.dto.response.JwtResponse;
import com.tripzin.eleganttex.dto.response.MessageResponse;
import com.tripzin.eleganttex.dto.response.TokenRefreshResponse;
import com.tripzin.eleganttex.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.authenticateUser(loginRequest));
    }
    
    @PostMapping("/register")
    public ResponseEntity<MessageResponse> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        return ResponseEntity.ok(authService.registerUser(signUpRequest));
    }
    
    @PostMapping("/refresh-token")
    public ResponseEntity<TokenRefreshResponse> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }
    
    @PostMapping("/verify-email")
    public ResponseEntity<MessageResponse> verifyEmail(@Valid @RequestBody EmailVerificationRequest request) {
        return ResponseEntity.ok(authService.verifyEmail(request.getToken()));
    }
    
    @GetMapping("/verify-email")
    public ResponseEntity<MessageResponse> verifyEmailGet(@RequestParam String token) {
        return ResponseEntity.ok(authService.verifyEmail(token));
    }
    
    @PostMapping("/resend-verification")
    public ResponseEntity<MessageResponse> resendVerificationEmail(@Valid @RequestBody ResendVerificationRequest request) {
        return ResponseEntity.ok(authService.resendVerificationEmail(request.getEmail()));
    }
}
