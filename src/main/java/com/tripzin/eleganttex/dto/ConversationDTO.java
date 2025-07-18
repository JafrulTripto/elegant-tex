package com.tripzin.eleganttex.dto;

import com.tripzin.eleganttex.entity.Conversation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDTO {
    
    private Long id;
    private Long messagingAccountId;
    private String accountName;
    private String platform;
    private Long messagingCustomerId;
    private String customerName;
    private String customerFirstName;
    private String customerLastName;
    private String customerProfilePicture;
    private Boolean customerProfileFetched;
    private String conversationName;
    private LocalDateTime lastMessageAt;
    private String lastMessageContent;
    private Boolean lastMessageInbound;
    private Integer unreadCount;
    private Boolean isActive;
    private Integer totalMessages;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static ConversationDTO fromEntity(Conversation conversation) {
        return ConversationDTO.builder()
                .id(conversation.getId())
                .messagingAccountId(conversation.getMessagingAccount().getId())
                .accountName(conversation.getMessagingAccount().getAccountName())
                .platform(conversation.getMessagingAccount().getPlatform().name())
                .messagingCustomerId(conversation.getMessagingCustomer() != null ? conversation.getMessagingCustomer().getId() : null)
                .customerName(conversation.getMessagingCustomer() != null ? conversation.getMessagingCustomer().getBestDisplayName() : null)
                .customerFirstName(conversation.getMessagingCustomer() != null ? conversation.getMessagingCustomer().getFirstName() : null)
                .customerLastName(conversation.getMessagingCustomer() != null ? conversation.getMessagingCustomer().getLastName() : null)
                .customerProfilePicture(conversation.getMessagingCustomer() != null ? conversation.getMessagingCustomer().getProfilePictureUrl() : null)
                .customerProfileFetched(conversation.getMessagingCustomer() != null ? conversation.getMessagingCustomer().getProfileFetched() : false)
                .conversationName(conversation.getConversationName())
                .lastMessageAt(conversation.getLastMessageAt())
                .unreadCount(conversation.getUnreadCount())
                .isActive(conversation.getIsActive())
                .totalMessages(conversation.getMessages() != null ? conversation.getMessages().size() : 0)
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .build();
    }
    
    public static ConversationDTO fromEntityWithLastMessage(Conversation conversation) {
        ConversationDTO dto = fromEntity(conversation);
        
        if (conversation.getMessages() != null && !conversation.getMessages().isEmpty()) {
            var lastMessage = conversation.getMessages().get(0); // Assuming messages are ordered by timestamp desc
            dto.setLastMessageContent(lastMessage.getContent());
            dto.setLastMessageInbound(lastMessage.getIsInbound());
        }
        
        return dto;
    }
}
