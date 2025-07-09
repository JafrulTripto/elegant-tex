package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.entity.*;
import com.tripzin.eleganttex.exception.ResourceNotFoundException;
import com.tripzin.eleganttex.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {
    
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final MessagingAccountRepository messagingAccountRepository;
    private final UserRepository userRepository;
    private final FacebookApiService facebookApiService;
    private final WhatsAppApiService whatsAppApiService;
    
    /**
     * Get messages for a specific conversation
     */
    public Page<Map<String, Object>> getConversationMessages(Long userId, Long conversationId, Pageable pageable) {
        User user = getUserById(userId);
        Conversation conversation = getConversationByUserAndId(user, conversationId);
        
        Page<Message> messages = messageRepository.findByConversationOrderByTimestampDesc(conversation, pageable);
        return messages.map(this::convertToMap);
    }
    
    /**
     * Get all messages across user's conversations with filtering
     */
    public Page<Map<String, Object>> getAllMessages(Long userId, String messageType, Boolean isInbound, 
                                                   String search, String platform, Pageable pageable) {
        
        User user = getUserById(userId);
        List<MessagingAccount> userAccounts = messagingAccountRepository.findByUserAndIsActiveTrue(user);
        
        // Filter by platform if specified
        if (platform != null && !platform.isEmpty()) {
            MessagingAccount.MessagingPlatform platformEnum = MessagingAccount.MessagingPlatform.valueOf(platform.toUpperCase());
            userAccounts = userAccounts.stream()
                    .filter(account -> account.getPlatform() == platformEnum)
                    .collect(Collectors.toList());
        }
        
        if (userAccounts.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }
        
        // Get conversations for these accounts
        List<Conversation> conversations = userAccounts.stream()
                .flatMap(account -> conversationRepository.findByMessagingAccountAndIsActiveTrueOrderByLastMessageAtDesc(account).stream())
                .collect(Collectors.toList());
        
        if (conversations.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }
        
        // Parse message type
        Message.MessageType messageTypeEnum = null;
        if (messageType != null && !messageType.isEmpty()) {
            messageTypeEnum = Message.MessageType.valueOf(messageType.toUpperCase());
        }
        
        Page<Message> messages = messageRepository.searchMessages(
                conversations, messageTypeEnum, isInbound, search, pageable);
        
        return messages.map(this::convertToMap);
    }
    
    /**
     * Send a message through the appropriate platform
     */
    @Transactional
    public Map<String, Object> sendMessage(Long userId, Long conversationId, String content, String messageType) {
        User user = getUserById(userId);
        Conversation conversation = getConversationByUserAndId(user, conversationId);
        MessagingAccount account = conversation.getMessagingAccount();
        
        try {
            // Send message via appropriate platform API
            if (account.getPlatform() == MessagingAccount.MessagingPlatform.FACEBOOK) {
                facebookApiService.sendTextMessage(account, conversation.getPlatformCustomerId(), content);
            } else if (account.getPlatform() == MessagingAccount.MessagingPlatform.WHATSAPP) {
                whatsAppApiService.sendTextMessage(account, conversation.getPlatformCustomerId(), content);
            } else {
                throw new IllegalArgumentException("Unsupported platform: " + account.getPlatform());
            }
            
            // Create message record
            Message message = Message.builder()
                    .conversation(conversation)
                    .messagingAccount(account)
                    .customer(conversation.getCustomer())
                    .platformMessageId(generateTempMessageId()) // Will be updated by webhook
                    .senderId(account.getPageId() != null ? account.getPageId() : account.getPhoneNumberId())
                    .recipientId(conversation.getPlatformCustomerId())
                    .messageType(Message.MessageType.valueOf(messageType.toUpperCase()))
                    .content(content)
                    .isInbound(false)
                    .status(Message.MessageStatus.SENT)
                    .timestamp(LocalDateTime.now())
                    .build();
            
            message = messageRepository.save(message);
            
            // Update conversation
            conversation.setLastMessageAt(message.getTimestamp());
            conversationRepository.save(conversation);
            
            log.info("Message sent successfully via {}: {}", account.getPlatform(), message.getId());
            
            return convertToMap(message);
            
        } catch (Exception e) {
            log.error("Failed to send message via {}: {}", account.getPlatform(), e.getMessage(), e);
            throw new RuntimeException("Failed to send message: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get message by ID
     */
    public Map<String, Object> getMessageById(Long userId, Long messageId) {
        User user = getUserById(userId);
        Message message = getMessageByUserAndId(user, messageId);
        return convertToMap(message);
    }
    
    /**
     * Mark message as read
     */
    @Transactional
    public void markMessageAsRead(Long userId, Long messageId) {
        User user = getUserById(userId);
        Message message = getMessageByUserAndId(user, messageId);
        
        if (message.getIsInbound() && message.getStatus() != Message.MessageStatus.READ) {
            message.setStatus(Message.MessageStatus.READ);
            messageRepository.save(message);
            
            // Update conversation unread count
            Conversation conversation = message.getConversation();
            if (conversation.getUnreadCount() > 0) {
                conversation.setUnreadCount(conversation.getUnreadCount() - 1);
                conversationRepository.save(conversation);
            }
            
            log.info("Message marked as read: {}", messageId);
        }
    }
    
    /**
     * Delete message (soft delete)
     */
    @Transactional
    public void deleteMessage(Long userId, Long messageId) {
        User user = getUserById(userId);
        Message message = getMessageByUserAndId(user, messageId);
        
        // For now, we'll just mark it as deleted in content
        // In a real implementation, you might add a 'deleted' field
        message.setContent("[Message deleted]");
        messageRepository.save(message);
        
        log.info("Message deleted: {}", messageId);
    }
    
    /**
     * Get message statistics
     */
    public Map<String, Object> getMessageStats(Long userId, String period) {
        User user = getUserById(userId);
        List<MessagingAccount> userAccounts = messagingAccountRepository.findByUserAndIsActiveTrue(user);
        
        Map<String, Object> stats = new HashMap<>();
        
        // Calculate date range based on period
        LocalDateTime startDate = calculateStartDate(period);
        LocalDateTime endDate = LocalDateTime.now();
        
        // Total messages
        long totalMessages = userAccounts.stream()
                .mapToLong(account -> messageRepository.countByMessagingAccountAndTimestampAfter(account, startDate))
                .sum();
        
        // Inbound vs outbound
        long inboundMessages = userAccounts.stream()
                .mapToLong(account -> messageRepository.countByMessagingAccountAndIsInboundTrueAndTimestampAfter(account, startDate))
                .sum();
        
        long outboundMessages = userAccounts.stream()
                .mapToLong(account -> messageRepository.countByMessagingAccountAndIsInboundFalseAndTimestampAfter(account, startDate))
                .sum();
        
        // Platform breakdown
        Map<String, Long> platformBreakdown = new HashMap<>();
        for (MessagingAccount account : userAccounts) {
            String platform = account.getPlatform().name();
            long count = messageRepository.countByMessagingAccountAndTimestampAfter(account, startDate);
            platformBreakdown.merge(platform, count, Long::sum);
        }
        
        stats.put("totalMessages", totalMessages);
        stats.put("inboundMessages", inboundMessages);
        stats.put("outboundMessages", outboundMessages);
        stats.put("platformBreakdown", platformBreakdown);
        stats.put("period", period != null ? period : "all");
        stats.put("startDate", startDate);
        stats.put("endDate", endDate);
        
        return stats;
    }
    
    /**
     * Bulk mark messages as read
     */
    @Transactional
    public int bulkMarkAsRead(Long userId, List<Long> messageIds) {
        User user = getUserById(userId);
        int markedCount = 0;
        
        for (Long messageId : messageIds) {
            try {
                Message message = getMessageByUserAndId(user, messageId);
                if (message.getIsInbound() && message.getStatus() != Message.MessageStatus.READ) {
                    message.setStatus(Message.MessageStatus.READ);
                    messageRepository.save(message);
                    markedCount++;
                }
            } catch (Exception e) {
                log.warn("Failed to mark message as read: {}", messageId, e);
            }
        }
        
        // Update conversation unread counts
        updateConversationUnreadCounts(userId);
        
        log.info("Bulk marked {} messages as read", markedCount);
        return markedCount;
    }
    
    /**
     * Convert Message entity to Map
     */
    private Map<String, Object> convertToMap(Message message) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", message.getId());
        map.put("content", message.getContent());
        map.put("messageType", message.getMessageType().name());
        map.put("isInbound", message.getIsInbound());
        map.put("status", message.getStatus().name());
        map.put("timestamp", message.getTimestamp());
        map.put("senderId", message.getSenderId());
        map.put("recipientId", message.getRecipientId());
        map.put("platformMessageId", message.getPlatformMessageId());
        
        // Conversation info
        Conversation conversation = message.getConversation();
        Map<String, Object> conversationInfo = new HashMap<>();
        conversationInfo.put("id", conversation.getId());
        conversationInfo.put("conversationName", conversation.getConversationName());
        conversationInfo.put("platformCustomerId", conversation.getPlatformCustomerId());
        map.put("conversation", conversationInfo);
        
        // Account info
        MessagingAccount account = message.getMessagingAccount();
        Map<String, Object> accountInfo = new HashMap<>();
        accountInfo.put("id", account.getId());
        accountInfo.put("platform", account.getPlatform().name());
        accountInfo.put("accountName", account.getAccountName());
        map.put("account", accountInfo);
        
        return map;
    }
    
    /**
     * Helper methods
     */
    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }
    
    private Conversation getConversationByUserAndId(User user, Long conversationId) {
        return  conversationRepository.findByIdWithMessagingAccount(conversationId)
                .filter(conv -> conv.getMessagingAccount().getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));
    }
    
    private Message getMessageByUserAndId(User user, Long messageId) {
        return messageRepository.findById(messageId)
                .filter(msg -> msg.getMessagingAccount().getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Message not found with id: " + messageId));
    }
    
    private String generateTempMessageId() {
        return "temp_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
    }
    
    private LocalDateTime calculateStartDate(String period) {
        if (period == null || period.isEmpty()) {
            return LocalDateTime.now().minus(30, ChronoUnit.DAYS); // Default to last 30 days
        }
        
        switch (period.toLowerCase()) {
            case "today":
                return LocalDateTime.now().truncatedTo(ChronoUnit.DAYS);
            case "week":
                return LocalDateTime.now().minus(7, ChronoUnit.DAYS);
            case "month":
                return LocalDateTime.now().minus(30, ChronoUnit.DAYS);
            case "quarter":
                return LocalDateTime.now().minus(90, ChronoUnit.DAYS);
            case "year":
                return LocalDateTime.now().minus(365, ChronoUnit.DAYS);
            default:
                return LocalDateTime.now().minus(30, ChronoUnit.DAYS);
        }
    }
    
    private void updateConversationUnreadCounts(Long userId) {
        User user = getUserById(userId);
        List<MessagingAccount> userAccounts = messagingAccountRepository.findByUserAndIsActiveTrue(user);
        
        for (MessagingAccount account : userAccounts) {
            List<Conversation> conversations = conversationRepository
                    .findByMessagingAccountAndIsActiveTrueOrderByLastMessageAtDesc(account);
            
            for (Conversation conversation : conversations) {
                long unreadCount = messageRepository.countUnreadInboundMessages(conversation);
                if (conversation.getUnreadCount() != unreadCount) {
                    conversation.setUnreadCount((int) unreadCount);
                    conversationRepository.save(conversation);
                }
            }
        }
    }
}
