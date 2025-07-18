package com.tripzin.eleganttex.dto;

import com.tripzin.eleganttex.entity.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    
    private Long id;
    private Long conversationId;
    private Long messagingAccountId;
    private String accountName;
    private String platform;
    private Long customerId;
    private String customerName;
    private String platformMessageId;
    private String senderId;
    private String recipientId;
    private Message.MessageType messageType;
    private String content;
    private Boolean isInbound;
    private Message.MessageStatus status;
    private LocalDateTime timestamp;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static MessageDTO fromEntity(Message message) {
        return MessageDTO.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .messagingAccountId(message.getMessagingAccount().getId())
                .accountName(message.getMessagingAccount().getAccountName())
                .platform(message.getMessagingAccount().getPlatform().name())
        .customerId(message.getMessagingCustomer() != null ? message.getMessagingCustomer().getId() : null)
        .customerName(message.getMessagingCustomer() != null ? message.getMessagingCustomer().getBestDisplayName() : null)
                .platformMessageId(message.getPlatformMessageId())
                .senderId(message.getSenderId())
                .recipientId(message.getRecipientId())
                .messageType(message.getMessageType())
                .content(message.getContent())
                .isInbound(message.getIsInbound())
                .status(message.getStatus())
                .timestamp(message.getTimestamp())
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .build();
    }
    
}
