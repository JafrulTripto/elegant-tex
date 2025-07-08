package com.tripzin.eleganttex.dto;

import com.tripzin.eleganttex.entity.Message;
import com.tripzin.eleganttex.entity.MessageAttachment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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
    private List<MessageAttachmentDTO> attachments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static MessageDTO fromEntity(Message message) {
        return MessageDTO.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .messagingAccountId(message.getMessagingAccount().getId())
                .accountName(message.getMessagingAccount().getAccountName())
                .platform(message.getMessagingAccount().getPlatform().name())
                .customerId(message.getCustomer() != null ? message.getCustomer().getId() : null)
                .customerName(message.getCustomer() != null ? message.getCustomer().getName() : null)
                .platformMessageId(message.getPlatformMessageId())
                .senderId(message.getSenderId())
                .recipientId(message.getRecipientId())
                .messageType(message.getMessageType())
                .content(message.getContent())
                .isInbound(message.getIsInbound())
                .status(message.getStatus())
                .timestamp(message.getTimestamp())
                .attachments(message.getAttachments() != null ? 
                    message.getAttachments().stream()
                        .map(MessageAttachmentDTO::fromEntity)
                        .collect(Collectors.toList()) : null)
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .build();
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageAttachmentDTO {
        private Long id;
        private MessageAttachment.AttachmentType attachmentType;
        private String fileUrl;
        private String filePath;
        private Long fileSize;
        private String mimeType;
        private String originalFilename;
        private LocalDateTime createdAt;
        
        public static MessageAttachmentDTO fromEntity(MessageAttachment attachment) {
            return MessageAttachmentDTO.builder()
                    .id(attachment.getId())
                    .attachmentType(attachment.getAttachmentType())
                    .fileUrl(attachment.getFileUrl())
                    .filePath(attachment.getFilePath())
                    .fileSize(attachment.getFileSize())
                    .mimeType(attachment.getMimeType())
                    .originalFilename(attachment.getOriginalFilename())
                    .createdAt(attachment.getCreatedAt())
                    .build();
        }
    }
}
