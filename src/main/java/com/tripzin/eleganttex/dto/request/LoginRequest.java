package com.tripzin.eleganttex.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    
    @NotBlank
    private String username; // Can be email or phone
    
    @NotBlank
    private String password;
}
