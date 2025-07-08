package com.tripzin.eleganttex.dto;

import com.tripzin.eleganttex.entity.MessagingAccount;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessagingAccountRequestDTO {
    
    @NotNull(message = "Platform is required")
    private MessagingAccount.MessagingPlatform platform;
    
    @NotBlank(message = "Account name is required")
    @Size(max = 100, message = "Account name must not exceed 100 characters")
    private String accountName;
    
    @Size(max = 100, message = "Page ID must not exceed 100 characters")
    private String pageId;
    
    @Size(max = 100, message = "Phone number ID must not exceed 100 characters")
    private String phoneNumberId;
    
    @Size(max = 100, message = "Business account ID must not exceed 100 characters")
    private String businessAccountId;
    
    @NotBlank(message = "Access token is required")
    private String accessToken;
    
    @Size(max = 255, message = "Webhook verify token must not exceed 255 characters")
    private String webhookVerifyToken;
    
    private Long customerId;
    
    @Builder.Default
    private Boolean isActive = true;
}
