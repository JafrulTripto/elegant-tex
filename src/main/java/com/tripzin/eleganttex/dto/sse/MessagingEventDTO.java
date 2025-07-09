package com.tripzin.eleganttex.dto.sse;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MessagingEventDTO {
    private MessagingEventType type;
    private Long userId;
    private Long accountId;
    private Long conversationId;
    private Long messageId;
    private Object data;
    private String message;
    private LocalDateTime timestamp;
    
    public static MessagingEventDTO newMessage(Long userId, Long accountId, Long conversationId, Object messageData) {
        return MessagingEventDTO.builder()
                .type(MessagingEventType.NEW_MESSAGE)
                .userId(userId)
                .accountId(accountId)
                .conversationId(conversationId)
                .data(messageData)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static MessagingEventDTO conversationUpdate(Long userId, Long accountId, Long conversationId, Object conversationData) {
        return MessagingEventDTO.builder()
                .type(MessagingEventType.CONVERSATION_UPDATE)
                .userId(userId)
                .accountId(accountId)
                .conversationId(conversationId)
                .data(conversationData)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static MessagingEventDTO unreadCountUpdate(Long userId, Long accountId, Long conversationId, Object countData) {
        return MessagingEventDTO.builder()
                .type(MessagingEventType.UNREAD_COUNT_UPDATE)
                .userId(userId)
                .accountId(accountId)
                .conversationId(conversationId)
                .data(countData)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static MessagingEventDTO messageStatusUpdate(Long userId, Long accountId, Long conversationId, Long messageId, Object statusData) {
        return MessagingEventDTO.builder()
                .type(MessagingEventType.MESSAGE_STATUS_UPDATE)
                .userId(userId)
                .accountId(accountId)
                .conversationId(conversationId)
                .messageId(messageId)
                .data(statusData)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static MessagingEventDTO accountStatusUpdate(Long userId, Long accountId, Object statusData) {
        return MessagingEventDTO.builder()
                .type(MessagingEventType.ACCOUNT_STATUS_UPDATE)
                .userId(userId)
                .accountId(accountId)
                .data(statusData)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static MessagingEventDTO connectionStatus(Long userId, String message) {
        return MessagingEventDTO.builder()
                .type(MessagingEventType.CONNECTION_STATUS)
                .userId(userId)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
