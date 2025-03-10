package com.tripzin.eleganttex.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
public class SignupRequest {
    
    @NotBlank
    @Size(min = 2, max = 50)
    private String firstName;
    
    @NotBlank
    @Size(min = 2, max = 50)
    private String lastName;
    
    @NotBlank
    @Size(max = 100)
    @Email
    private String email;
    
    @NotBlank
    @Size(min = 10, max = 20)
    @Pattern(regexp = "^[0-9+\\-\\s]+$", message = "Phone number can only contain digits, +, -, and spaces")
    private String phone;
    
    @NotBlank
    @Size(min = 6, max = 40)
    private String password;
    
    private Set<String> roles;
}
