package com.tripzin.eleganttex.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripzin.eleganttex.entity.*;
import com.tripzin.eleganttex.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FacebookWebhookService {
    
    private final MessagingAccountRepository messagingAccountRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final WebhookEventRepository webhookEventRepository;
    private final MessagingCustomerRepository messagingCustomerRepository;
    private final MessagingEventService messagingEventService;
    private final FacebookApiService facebookApiService;
    private final ObjectMapper objectMapper;
    @Value("${app.messaging.facebook.webhook-verify-token}")
    private String fallbackVerifyToken;
    
    /**
     * Verify webhook token against stored accounts
     */
    public boolean verifyWebhookToken(String verifyToken) {
        boolean existsInDb = messagingAccountRepository.existsByPlatformAndWebhookVerifyToken(
            MessagingAccount.MessagingPlatform.FACEBOOK, verifyToken
        );

        if (existsInDb) {
            return true;
        }

        return fallbackVerifyToken.equals(verifyToken);
    }
    
    /**
     * Process incoming webhook event from Facebook
     */
    @Transactional
    public void processWebhookEvent(Map<String, Object> payload) {
        try {
            // Log the webhook event
            WebhookEvent webhookEvent = WebhookEvent.builder()
                    .platform(MessagingAccount.MessagingPlatform.FACEBOOK)
                    .eventType("facebook_webhook")
                    .payload(objectMapper.writeValueAsString(payload))
                    .processed(false)
                    .build();
            webhookEventRepository.save(webhookEvent);
            
            // Process the event
            JsonNode rootNode = objectMapper.valueToTree(payload);
            
            if (rootNode.has("entry")) {
                JsonNode entries = rootNode.get("entry");
                for (JsonNode entry : entries) {
                    processEntry(entry, webhookEvent);
                }
            }
            
            // Mark as processed
            webhookEvent.setProcessed(true);
            webhookEventRepository.save(webhookEvent);
            
        } catch (Exception e) {
            log.error("Error processing Facebook webhook event", e);
            throw new RuntimeException("Failed to process webhook event", e);
        }
    }
    
    private void processEntry(JsonNode entry, WebhookEvent webhookEvent) {
        String pageId = entry.get("id").asText();
        
        // Find the messaging account
        Optional<MessagingAccount> accountOpt = messagingAccountRepository
                .findByPlatformAndPageId(MessagingAccount.MessagingPlatform.FACEBOOK, pageId);
        
        if (accountOpt.isEmpty()) {
            log.warn("No messaging account found for Facebook page ID: {}", pageId);
            return;
        }
        
        MessagingAccount account = accountOpt.get();
        webhookEvent.setMessagingAccount(account);
        
        if (entry.has("messaging")) {
            JsonNode messaging = entry.get("messaging");
            for (JsonNode message : messaging) {
                processMessage(message, account);
            }
        }
    }
    
    private void processMessage(JsonNode messageNode, MessagingAccount account) {
        try {
            String senderId = messageNode.get("sender").get("id").asText();
            String recipientId = messageNode.get("recipient").get("id").asText();
            long timestamp = messageNode.get("timestamp").asLong();
            
            // Determine if this is an inbound message (sender is not the page)
            boolean isInbound = !senderId.equals(account.getPageId());
            
            // Find or create conversation
            String customerId = isInbound ? senderId : recipientId;
            Conversation conversation = findOrCreateConversation(account, customerId);
            
            // Process different message types
            if (messageNode.has("message")) {
                processTextMessage(messageNode.get("message"), conversation, account, 
                                 senderId, recipientId, timestamp, isInbound);
            } else if (messageNode.has("delivery")) {
                processDeliveryReceipt(messageNode.get("delivery"), conversation);
            } else if (messageNode.has("read")) {
                processReadReceipt(messageNode.get("read"), conversation);
            }
            
        } catch (Exception e) {
            log.error("Error processing Facebook message", e);
        }
    }
    
    private void processTextMessage(JsonNode messageNode, Conversation conversation, 
                                   MessagingAccount account, String senderId, String recipientId, 
                                   long timestamp, boolean isInbound) {
        
        String messageId = messageNode.get("mid").asText();
        String text = messageNode.has("text") ? messageNode.get("text").asText() : "";
        
        // Check if message already exists
        if (messageRepository.findByPlatformMessageId(messageId).isPresent()) {
            log.debug("Message already exists: {}", messageId);
            return;
        }
        
        // Create message
        Message message = Message.builder()
                .conversation(conversation)
                .messagingAccount(account)
                .messagingCustomer(conversation.getMessagingCustomer())
                .platformMessageId(messageId)
                .senderId(senderId)
                .recipientId(recipientId)
                .messageType(Message.MessageType.TEXT)
                .content(text)
                .isInbound(isInbound)
                .status(Message.MessageStatus.DELIVERED)
                .timestamp(LocalDateTime.ofInstant(Instant.ofEpochMilli(timestamp), ZoneId.systemDefault()))
                .build();
        
        messageRepository.save(message);
        
        // Update conversation
        conversation.setLastMessageAt(message.getTimestamp());
        if (isInbound) {
            conversation.setUnreadCount(conversation.getUnreadCount() + 1);
        }
        conversationRepository.save(conversation);
        
        // Broadcast real-time events
        try {
            // Convert to DTO for broadcasting
            com.tripzin.eleganttex.dto.MessageDTO messageDTO = convertToMessageDTO(message);
            messagingEventService.broadcastNewMessage(message, messageDTO);
            
            // Broadcast conversation update
            com.tripzin.eleganttex.dto.ConversationDTO conversationDTO = convertToConversationDTO(conversation);
            messagingEventService.broadcastConversationUpdate(conversation, conversationDTO);
            
            // Broadcast unread count update if inbound
            if (isInbound) {
                messagingEventService.broadcastUnreadCountUpdate(
                    account.getId(), 
                    conversation.getId(), 
                    conversation.getUnreadCount()
                );
            }
        } catch (Exception e) {
            log.error("Failed to broadcast real-time events for message: {}", messageId, e);
        }
        
        log.info("Processed Facebook message: {} from conversation: {}", messageId, conversation.getId());
    }
    
    private void processDeliveryReceipt(JsonNode deliveryNode, Conversation conversation) {
        // Update message status to delivered
        if (deliveryNode.has("mids")) {
            JsonNode mids = deliveryNode.get("mids");
            for (JsonNode mid : mids) {
                String messageId = mid.asText();
                messageRepository.findByPlatformMessageId(messageId)
                        .ifPresent(message -> {
                            message.setStatus(Message.MessageStatus.DELIVERED);
                            messageRepository.save(message);
                        });
            }
        }
    }
    
    private void processReadReceipt(JsonNode readNode, Conversation conversation) {
        // Update message status to read
        long watermark = readNode.get("watermark").asLong();
        LocalDateTime readTime = LocalDateTime.ofInstant(Instant.ofEpochMilli(watermark), ZoneId.systemDefault());
        
        // Update all messages before watermark to read status
        List<Message> messages = messageRepository.findByConversationOrderByTimestampDesc(conversation);
        for (Message message : messages) {
            if (message.getTimestamp().isBefore(readTime) || message.getTimestamp().isEqual(readTime)) {
                if (!message.getIsInbound()) { // Only update outbound messages
                    message.setStatus(Message.MessageStatus.READ);
                    messageRepository.save(message);
                }
            }
        }
        
        // Reset unread count
        conversation.setUnreadCount(0);
        conversationRepository.save(conversation);
    }
    
    private Conversation findOrCreateConversation(MessagingAccount account, String platformCustomerId) {
        // Try to find existing messaging customer first
        MessagingCustomer messagingCustomer = findOrCreateMessagingCustomer(platformCustomerId, account);
        
        // Look for existing conversation by account and customer
        Optional<Conversation> existingConversation = conversationRepository
                .findByMessagingAccountAndMessagingCustomer(account, messagingCustomer);
        
        if (existingConversation.isPresent()) {
            return existingConversation.get();
        }
        
        // Create new conversation
        Conversation conversation = Conversation.builder()
                .messagingAccount(account)
                .messagingCustomer(messagingCustomer)
                .conversationName(messagingCustomer.getBestDisplayName())
                .unreadCount(0)
                .isActive(true)
                .build();
        
        return conversationRepository.save(conversation);
    }
    
    private MessagingCustomer findOrCreateMessagingCustomer(String platformCustomerId, MessagingAccount account) {
        Optional<MessagingCustomer> existingCustomer = messagingCustomerRepository
                .findByPlatformCustomerIdAndPlatform(platformCustomerId, MessagingCustomer.MessagingPlatform.FACEBOOK);
        
        if (existingCustomer.isPresent()) {
            MessagingCustomer customer = existingCustomer.get();
            // Try to fetch profile if not already fetched and should retry
            if (customer.shouldRetryProfileFetch()) {
                fetchAndUpdateProfileAsync(customer, account);
            }
            return customer;
        }
        
        // Create new messaging customer
        MessagingCustomer customer = MessagingCustomer.builder()
                .platformCustomerId(platformCustomerId)
                .platform(MessagingCustomer.MessagingPlatform.FACEBOOK)
                .displayName("Facebook User") // Temporary fallback
                .profileFetched(false)
                .build();
        
        customer = messagingCustomerRepository.save(customer);
        
        // Attempt to fetch profile asynchronously
        fetchAndUpdateProfileAsync(customer, account);
        
        return customer;
    }
    
    private void fetchAndUpdateProfileAsync(MessagingCustomer customer, MessagingAccount account) {
        // For now, we'll do this synchronously, but in production you might want to use @Async
        try {
            fetchAndUpdateProfile(customer, account);
        } catch (Exception e) {
            log.warn("Failed to fetch Facebook profile for customer: {}", customer.getPlatformCustomerId(), e);
        }
    }
    
    private void fetchAndUpdateProfile(MessagingCustomer customer, MessagingAccount account) {
        try {
            // Use the FacebookApiService to get user profile
            Map<String, Object> profile = facebookApiService.getUserProfile(account, customer.getPlatformCustomerId());
            
            String firstName = (String) profile.get("firstName");
            String lastName = (String) profile.get("lastName");
            String profilePictureUrl = (String) profile.get("profilePic");
            
            customer.updateProfileFromApi(firstName, lastName, profilePictureUrl);
            messagingCustomerRepository.save(customer);
            
            log.info("Successfully fetched Facebook profile for customer: {}", customer.getPlatformCustomerId());
            
        } catch (Exception e) {
            log.warn("Failed to fetch Facebook profile for customer: {}", customer.getPlatformCustomerId(), e);
            customer.markProfileFetchAttempted();
            messagingCustomerRepository.save(customer);
        }
    }
    
    /**
     * Convert Message entity to MessageDTO
     */
    private com.tripzin.eleganttex.dto.MessageDTO convertToMessageDTO(Message message) {
        return com.tripzin.eleganttex.dto.MessageDTO.fromEntity(message);
    }
    
    /**
     * Convert Conversation entity to ConversationDTO
     */
    private com.tripzin.eleganttex.dto.ConversationDTO convertToConversationDTO(Conversation conversation) {
        return com.tripzin.eleganttex.dto.ConversationDTO.fromEntity(conversation);
    }
}
