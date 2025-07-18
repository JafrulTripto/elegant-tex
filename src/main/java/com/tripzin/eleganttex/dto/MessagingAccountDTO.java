package com.tripzin.eleganttex.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tripzin.eleganttex.entity.MessagingAccount;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessagingAccountDTO {
    
    private Long id;
    private Long userId;
    private MessagingAccount.MessagingPlatform platform;
    private String accountName;
    private String pageId;
    private String phoneNumberId;
    private String businessAccountId;
    
    @JsonIgnore
    private String accessToken;
    
    @JsonIgnore
    private String webhookVerifyToken;
    
    private Boolean isActive;
    private Integer conversationCount;
    private Integer unreadMessageCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static MessagingAccountDTO fromEntity(MessagingAccount account) {
        return MessagingAccountDTO.builder()
                .id(account.getId())
                .userId(account.getUser().getId())
                .platform(account.getPlatform())
                .accountName(account.getAccountName())
                .pageId(account.getPageId())
                .phoneNumberId(account.getPhoneNumberId())
                .businessAccountId(account.getBusinessAccountId())
                .isActive(account.getIsActive())
                .conversationCount(account.getConversations() != null ? account.getConversations().size() : 0)
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }
    
    public static MessagingAccountDTO fromEntityWithToken(MessagingAccount account) {
        MessagingAccountDTO dto = fromEntity(account);
        dto.setAccessToken(account.getAccessToken());
        dto.setWebhookVerifyToken(account.getWebhookVerifyToken());
        return dto;
    }
}
