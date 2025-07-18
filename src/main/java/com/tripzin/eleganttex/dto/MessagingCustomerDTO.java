package com.tripzin.eleganttex.dto;

import com.tripzin.eleganttex.entity.MessagingCustomer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessagingCustomerDTO {
    
    private Long id;
    private String platformCustomerId;
    private String platform;
    private String displayName;
    private String firstName;
    private String lastName;
    private String profilePictureUrl;
    private String phone;
    private String email;
    private String address;
    private Boolean profileFetched;
    private LocalDateTime profileFetchAttemptedAt;
    private Boolean hasCompleteProfile;
    private Boolean hasContactInfo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static MessagingCustomerDTO fromEntity(MessagingCustomer entity) {
        if (entity == null) {
            return null;
        }
        
        return MessagingCustomerDTO.builder()
                .id(entity.getId())
                .platformCustomerId(entity.getPlatformCustomerId())
                .platform(entity.getPlatform().name())
                .displayName(entity.getBestDisplayName())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .profilePictureUrl(entity.getProfilePictureUrl())
                .phone(entity.getPhone())
                .email(entity.getEmail())
                .address(entity.getAddress())
                .profileFetched(entity.getProfileFetched())
                .profileFetchAttemptedAt(entity.getProfileFetchAttemptedAt())
                .hasCompleteProfile(entity.hasCompleteProfile())
                .hasContactInfo(entity.hasContactInfo())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
    
    /**
     * Convert to entity for updates (excluding read-only fields)
     */
    public MessagingCustomer toEntity() {
        return MessagingCustomer.builder()
                .id(this.id)
                .platformCustomerId(this.platformCustomerId)
                .platform(this.platform != null ? MessagingCustomer.MessagingPlatform.valueOf(this.platform) : null)
                .displayName(this.displayName)
                .firstName(this.firstName)
                .lastName(this.lastName)
                .profilePictureUrl(this.profilePictureUrl)
                .phone(this.phone)
                .email(this.email)
                .address(this.address)
                .profileFetched(this.profileFetched)
                .profileFetchAttemptedAt(this.profileFetchAttemptedAt)
                .build();
    }
    
    /**
     * Create a minimal DTO with just essential information
     */
    public static MessagingCustomerDTO minimal(MessagingCustomer entity) {
        if (entity == null) {
            return null;
        }
        
        return MessagingCustomerDTO.builder()
                .id(entity.getId())
                .platformCustomerId(entity.getPlatformCustomerId())
                .platform(entity.getPlatform().name())
                .displayName(entity.getBestDisplayName())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .profilePictureUrl(entity.getProfilePictureUrl())
                .profileFetched(entity.getProfileFetched())
                .hasCompleteProfile(entity.hasCompleteProfile())
                .hasContactInfo(entity.hasContactInfo())
                .build();
    }
}
