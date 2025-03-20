package com.tripzin.eleganttex.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JwtResponse {
    
    private String accessToken;
    private String refreshToken;
    @Builder.Default
    private String type = "Bearer";
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private boolean emailVerified;
    private boolean accountVerified;
    private List<String> roles;
    private List<String> permissions;
}
