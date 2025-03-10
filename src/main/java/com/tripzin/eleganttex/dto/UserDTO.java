package com.tripzin.eleganttex.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tripzin.eleganttex.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    
    @JsonIgnore
    private String password;
    
    private Long profileImageId;
    
    private boolean emailVerified;
    private boolean accountVerified;
    private Set<String> roles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static UserDTO fromEntity(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profileImageId(user.getProfileImageId())
                .emailVerified(user.isEmailVerified())
                .accountVerified(user.isAccountVerified())
                .roles(user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .collect(Collectors.toSet()))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
