package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.entity.MessagingAccount;
import com.tripzin.eleganttex.entity.User;
import com.tripzin.eleganttex.exception.ResourceNotFoundException;
import com.tripzin.eleganttex.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessagingStatsService {
    
    private final MessagingAccountRepository messagingAccountRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    
    /**
     * Get overall messaging statistics for a user
     */
    public Map<String, Object> getOverallStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        List<MessagingAccount> userAccounts = messagingAccountRepository.findByUserAndIsActiveTrue(user);
        
        Map<String, Object> stats = new HashMap<>();
        
        // Basic counts
        long totalAccounts = userAccounts.size();
        long activeAccounts = userAccounts.stream()
                .filter(MessagingAccount::getIsActive)
                .count();
        
        // Conversation stats
        long totalConversations = userAccounts.stream()
                .mapToLong(account -> conversationRepository.countByMessagingAccount(account))
                .sum();
        
        long unreadMessages = userAccounts.stream()
                .mapToLong(account -> messageRepository.countByMessagingAccountAndIsInboundTrueAndStatus(
                        account, com.tripzin.eleganttex.entity.Message.MessageStatus.DELIVERED))
                .sum();
        
        // Platform breakdown
        Map<String, Long> platformBreakdown = userAccounts.stream()
                .collect(Collectors.groupingBy(
                        account -> account.getPlatform().name(),
                        Collectors.counting()
                ));
        
        stats.put("totalAccounts", totalAccounts);
        stats.put("activeAccounts", activeAccounts);
        stats.put("totalConversations", totalConversations);
        stats.put("unreadMessages", unreadMessages);
        stats.put("platformBreakdown", platformBreakdown);
        
        return stats;
    }
    
    /**
     * Get statistics for a specific messaging account
     */
    public Map<String, Object> getAccountStats(Long userId, Long accountId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        MessagingAccount account = messagingAccountRepository.findByUserAndId(user, accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Messaging account not found with id: " + accountId));
        
        Map<String, Object> stats = new HashMap<>();
        
        // Conversation stats
        long totalConversations = conversationRepository.countByMessagingAccount(account);
        long unreadConversations = conversationRepository.countByMessagingAccountAndUnreadCountGreaterThan(account, 0);
        
        // Message stats
        long totalMessages = messageRepository.countByMessagingAccount(account);
        long unreadMessages = messageRepository.countByMessagingAccountAndIsInboundTrueAndStatus(
                account, com.tripzin.eleganttex.entity.Message.MessageStatus.DELIVERED);
        
        // Response time calculation (average time between inbound and outbound messages)
        double responseTime = calculateAverageResponseTime(account);
        
        // Recent activity (last 24 hours)
        LocalDateTime yesterday = LocalDateTime.now().minus(1, ChronoUnit.DAYS);
        long messagesLast24h = messageRepository.countByMessagingAccountAndTimestampAfter(account, yesterday);
        
        stats.put("totalConversations", totalConversations);
        stats.put("unreadConversations", unreadConversations);
        stats.put("totalMessages", totalMessages);
        stats.put("unreadMessages", unreadMessages);
        stats.put("responseTime", responseTime);
        stats.put("messagesLast24h", messagesLast24h);
        
        return stats;
    }
    
    /**
     * Calculate average response time in minutes
     */
    private double calculateAverageResponseTime(MessagingAccount account) {
        try {
            // This is a simplified calculation
            // In a real implementation, you'd want to track response times more precisely
            LocalDateTime lastWeek = LocalDateTime.now().minus(7, ChronoUnit.DAYS);
            
            long inboundMessages = messageRepository.countByMessagingAccountAndIsInboundTrueAndTimestampAfter(
                    account, lastWeek);
            long outboundMessages = messageRepository.countByMessagingAccountAndIsInboundFalseAndTimestampAfter(
                    account, lastWeek);
            
            if (inboundMessages == 0) {
                return 0.0;
            }
            
            // Simplified calculation - in reality you'd track actual response pairs
            return Math.min(60.0, (double) outboundMessages / inboundMessages * 30.0);
            
        } catch (Exception e) {
            log.error("Error calculating response time for account: {}", account.getId(), e);
            return 0.0;
        }
    }
}
