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
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConversationService {
    
    private final ConversationRepository conversationRepository;
    private final MessagingAccountRepository messagingAccountRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final FacebookApiService facebookApiService;
    
    /**
     * Get conversations for a specific messaging account
     */
    public Page<Map<String, Object>> getAccountConversations(Long userId, Long accountId, 
                                                            Boolean hasUnread, String search, Pageable pageable) {
        
        User user = getUserById(userId);
        MessagingAccount account = messagingAccountRepository.findByUserAndId(user, accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Messaging account not found with id: " + accountId));
        
        Page<Conversation> conversations = conversationRepository.searchConversations(
                List.of(account), hasUnread, search, pageable);
        
        return conversations.map(this::convertToMap);
    }
    
    /**
     * Get all conversations across all user's accounts
     */
    public Page<Map<String, Object>> getAllConversations(Long userId, Boolean hasUnread, 
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
        
        Page<Conversation> conversations = conversationRepository.searchConversations(
                userAccounts, hasUnread, search, pageable);
        
        return conversations.map(this::convertToMap);
    }
    
    /**
     * Get conversation by ID
     */
    public Map<String, Object> getConversationById(Long userId, Long conversationId) {
        User user = getUserById(userId);
        Conversation conversation = getConversationByUserAndId(user, conversationId);
        
        Map<String, Object> result = convertToMap(conversation);
        
        // Add recent messages
        List<Message> recentMessages = messageRepository.findTop10ByConversationOrderByTimestampDesc(conversation);
        result.put("recentMessages", recentMessages.stream()
                .map(this::convertMessageToMap)
                .collect(Collectors.toList()));
        
        return result;
    }
    
    /**
     * Update conversation details
     */
    @Transactional
    public Map<String, Object> updateConversation(Long userId, Long conversationId, Map<String, Object> updates) {
        User user = getUserById(userId);
        Conversation conversation = getConversationByUserAndId(user, conversationId);
        
        // Update allowed fields
        if (updates.containsKey("conversationName")) {
            conversation.setConversationName((String) updates.get("conversationName"));
        }
        
        if (updates.containsKey("isActive")) {
            conversation.setIsActive((Boolean) updates.get("isActive"));
        }
        
        conversation = conversationRepository.save(conversation);
        log.info("Updated conversation: {}", conversationId);
        
        return convertToMap(conversation);
    }
    
    /**
     * Mark conversation as read
     */
    @Transactional
    public void markConversationAsRead(Long userId, Long conversationId) {
        User user = getUserById(userId);
        Conversation conversation = getConversationByUserAndId(user, conversationId);
        
        // Reset unread count
        conversation.setUnreadCount(0);
        conversationRepository.save(conversation);
        
        // Mark messages as read via platform API
        try {
            if (conversation.getMessagingAccount().getPlatform() == MessagingAccount.MessagingPlatform.FACEBOOK) {
                facebookApiService.markMessageAsRead(conversation.getMessagingAccount(), 
                        conversation.getPlatformCustomerId());
            }
            // WhatsApp doesn't have a mark as read API for business accounts
            
        } catch (Exception e) {
            log.warn("Failed to mark conversation as read via platform API: {}", e.getMessage());
        }
        
        log.info("Marked conversation as read: {}", conversationId);
    }
    
    /**
     * Archive/unarchive conversation
     */
    @Transactional
    public void toggleConversationArchive(Long userId, Long conversationId, boolean archive) {
        User user = getUserById(userId);
        Conversation conversation = getConversationByUserAndId(user, conversationId);
        
        conversation.setIsActive(!archive);
        conversationRepository.save(conversation);
        
        log.info("Conversation {} {}: {}", archive ? "archived" : "unarchived", conversationId);
    }
    
    /**
     * Get conversation statistics
     */
    public Map<String, Object> getConversationStats(Long userId, Long conversationId) {
        User user = getUserById(userId);
        Conversation conversation = getConversationByUserAndId(user, conversationId);
        
        Map<String, Object> stats = new HashMap<>();
        
        // Message counts
        long totalMessages = messageRepository.countByConversation(conversation);
        long unreadMessages = conversation.getUnreadCount();
        
        // Recent activity (last 24 hours)
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
        long messagesLast24h = messageRepository.countByConversationAndTimestampAfter(conversation, yesterday);
        
        stats.put("totalMessages", totalMessages);
        stats.put("unreadMessages", unreadMessages);
        stats.put("messagesLast24h", messagesLast24h);
        stats.put("lastMessageAt", conversation.getLastMessageAt());
        stats.put("platform", conversation.getMessagingAccount().getPlatform().name());
        
        return stats;
    }
    
    /**
     * Convert Conversation entity to Map
     */
    private Map<String, Object> convertToMap(Conversation conversation) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", conversation.getId());
        map.put("conversationName", conversation.getConversationName());
        map.put("platformCustomerId", conversation.getPlatformCustomerId());
        map.put("unreadCount", conversation.getUnreadCount());
        map.put("isActive", conversation.getIsActive());
        map.put("lastMessageAt", conversation.getLastMessageAt());
        map.put("createdAt", conversation.getCreatedAt());
        
        // Account info
        MessagingAccount account = conversation.getMessagingAccount();
        Map<String, Object> accountInfo = new HashMap<>();
        accountInfo.put("id", account.getId());
        accountInfo.put("platform", account.getPlatform().name());
        accountInfo.put("accountName", account.getAccountName());
        accountInfo.put("pageId", account.getPageId());
        accountInfo.put("phoneNumberId", account.getPhoneNumberId());
        map.put("account", accountInfo);
        
        // Customer info
        if (conversation.getCustomer() != null) {
            Customer customer = conversation.getCustomer();
            Map<String, Object> customerInfo = new HashMap<>();
            customerInfo.put("id", customer.getId());
            customerInfo.put("name", customer.getName());
            customerInfo.put("phone", customer.getPhone());
            customerInfo.put("facebookId", customer.getFacebookId());
            map.put("customer", customerInfo);
        }
        
        return map;
    }
    
    /**
     * Convert Message entity to Map
     */
    private Map<String, Object> convertMessageToMap(Message message) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", message.getId());
        map.put("content", message.getContent());
        map.put("messageType", message.getMessageType().name());
        map.put("isInbound", message.getIsInbound());
        map.put("status", message.getStatus().name());
        map.put("timestamp", message.getTimestamp());
        map.put("senderId", message.getSenderId());
        map.put("recipientId", message.getRecipientId());
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
        return conversationRepository.findById(conversationId)
                .filter(conv -> conv.getMessagingAccount().getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));
    }
}
