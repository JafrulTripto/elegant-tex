package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.dto.ConversationDTO;
import com.tripzin.eleganttex.dto.MessageDTO;
import com.tripzin.eleganttex.dto.MessagingAccountDTO;
import com.tripzin.eleganttex.dto.sse.MessagingEventDTO;
import com.tripzin.eleganttex.entity.Conversation;
import com.tripzin.eleganttex.entity.Message;
import com.tripzin.eleganttex.entity.MessagingAccount;
import com.tripzin.eleganttex.repository.MessagingAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessagingEventService {
    
    private final MessagingSSEService messagingSSEService;
    private final MessagingAccountRepository messagingAccountRepository;
    
    /**
     * Broadcast new message event to relevant users
     */
    @Async
    public void broadcastNewMessage(Message message, MessageDTO messageDTO) {
        try {
            // Get users who have access to this messaging account
            Set<Long> userIds = getUsersForAccount(message.getMessagingAccount().getId());
            
            if (userIds.isEmpty()) {
                log.debug("No users found for messaging account: {}", message.getMessagingAccount().getId());
                return;
            }
            
            MessagingEventDTO event = MessagingEventDTO.newMessage(
                    null, // Will be set per user
                    message.getMessagingAccount().getId(),
                    message.getConversation().getId(),
                    messageDTO
            );
            
            // Send to each user
            for (Long userId : userIds) {
                event.setUserId(userId);
                messagingSSEService.sendEventToUser(userId, event);
            }
            
            log.debug("Broadcasted new message event to {} users for account: {}", 
                    userIds.size(), message.getMessagingAccount().getId());
            
        } catch (Exception e) {
            log.error("Failed to broadcast new message event", e);
        }
    }
    
    /**
     * Broadcast conversation update event
     */
    @Async
    public void broadcastConversationUpdate(Conversation conversation, ConversationDTO conversationDTO) {
        try {
            Set<Long> userIds = getUsersForAccount(conversation.getMessagingAccount().getId());
            
            if (userIds.isEmpty()) {
                return;
            }
            
            MessagingEventDTO event = MessagingEventDTO.conversationUpdate(
                    null,
                    conversation.getMessagingAccount().getId(),
                    conversation.getId(),
                    conversationDTO
            );
            
            for (Long userId : userIds) {
                event.setUserId(userId);
                messagingSSEService.sendEventToUser(userId, event);
            }
            
            log.debug("Broadcasted conversation update event to {} users", userIds.size());
            
        } catch (Exception e) {
            log.error("Failed to broadcast conversation update event", e);
        }
    }
    
    /**
     * Broadcast unread count update
     */
    @Async
    public void broadcastUnreadCountUpdate(Long accountId, Long conversationId, int unreadCount) {
        try {
            Set<Long> userIds = getUsersForAccount(accountId);
            
            if (userIds.isEmpty()) {
                return;
            }
            
            MessagingEventDTO event = MessagingEventDTO.unreadCountUpdate(
                    null,
                    accountId,
                    conversationId,
                    unreadCount
            );
            
            for (Long userId : userIds) {
                event.setUserId(userId);
                messagingSSEService.sendEventToUser(userId, event);
            }
            
            log.debug("Broadcasted unread count update to {} users", userIds.size());
            
        } catch (Exception e) {
            log.error("Failed to broadcast unread count update", e);
        }
    }
    
    /**
     * Broadcast message status update
     */
    @Async
    public void broadcastMessageStatusUpdate(Message message, String newStatus) {
        try {
            Set<Long> userIds = getUsersForAccount(message.getMessagingAccount().getId());
            
            if (userIds.isEmpty()) {
                return;
            }
            
            MessagingEventDTO event = MessagingEventDTO.messageStatusUpdate(
                    null,
                    message.getMessagingAccount().getId(),
                    message.getConversation().getId(),
                    message.getId(),
                    newStatus
            );
            
            for (Long userId : userIds) {
                event.setUserId(userId);
                messagingSSEService.sendEventToUser(userId, event);
            }
            
            log.debug("Broadcasted message status update to {} users", userIds.size());
            
        } catch (Exception e) {
            log.error("Failed to broadcast message status update", e);
        }
    }
    
    /**
     * Broadcast account status update
     */
    @Async
    public void broadcastAccountStatusUpdate(MessagingAccount account, MessagingAccountDTO accountDTO) {
        try {
            Set<Long> userIds = getUsersForAccount(account.getId());
            
            if (userIds.isEmpty()) {
                return;
            }
            
            MessagingEventDTO event = MessagingEventDTO.accountStatusUpdate(
                    null,
                    account.getId(),
                    accountDTO
            );
            
            for (Long userId : userIds) {
                event.setUserId(userId);
                messagingSSEService.sendEventToUser(userId, event);
            }
            
            log.debug("Broadcasted account status update to {} users", userIds.size());
            
        } catch (Exception e) {
            log.error("Failed to broadcast account status update", e);
        }
    }
    
    /**
     * Send connection status to specific user
     */
    public void sendConnectionStatus(Long userId, String message) {
        try {
            MessagingEventDTO event = MessagingEventDTO.connectionStatus(userId, message);
            messagingSSEService.sendEventToUser(userId, event);
        } catch (Exception e) {
            log.error("Failed to send connection status to user: {}", userId, e);
        }
    }
    
    /**
     * Get all users who have access to a messaging account
     * For now, this returns all users, but you can implement proper access control
     */
    private Set<Long> getUsersForAccount(Long accountId) {
        try {
            // For now, get the user who owns the account
            // In a multi-tenant system, you might want to get all users in the organization
            MessagingAccount account = messagingAccountRepository.findById(accountId).orElse(null);
            if (account != null && account.getUser() != null) {
                return Set.of(account.getUser().getId());
            }
            
            // Fallback: return empty set if no user found
            return Set.of();
            
        } catch (Exception e) {
            log.error("Failed to get users for account: {}", accountId, e);
            return Set.of();
        }
    }
    
    /**
     * Get connection statistics
     */
    public MessagingEventDTO getConnectionStats() {
        return MessagingEventDTO.builder()
                .type(com.tripzin.eleganttex.dto.sse.MessagingEventType.CONNECTION_STATUS)
                .data(java.util.Map.of(
                        "totalConnections", messagingSSEService.getTotalConnectionCount(),
                        "activeUsers", messagingSSEService.getActiveUsersCount()
                ))
                .timestamp(java.time.LocalDateTime.now())
                .build();
    }
}
