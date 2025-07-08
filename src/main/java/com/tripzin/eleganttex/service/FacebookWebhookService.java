package com.tripzin.eleganttex.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripzin.eleganttex.entity.*;
import com.tripzin.eleganttex.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    private final CustomerRepository customerRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * Verify webhook token against stored accounts
     */
    public boolean verifyWebhookToken(String verifyToken) {
        return messagingAccountRepository.existsByPlatformAndWebhookVerifyToken(
                MessagingAccount.MessagingPlatform.FACEBOOK, verifyToken);
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
                .customer(conversation.getCustomer())
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
        Optional<Conversation> existingConversation = conversationRepository
                .findByMessagingAccountAndPlatformCustomerId(account, platformCustomerId);
        
        if (existingConversation.isPresent()) {
            return existingConversation.get();
        }
        
        // Try to find existing customer or create new one
        Customer customer = findOrCreateCustomer(platformCustomerId, account);
        
        // Create new conversation
        Conversation conversation = Conversation.builder()
                .messagingAccount(account)
                .customer(customer)
                .platformCustomerId(platformCustomerId)
                .conversationName(customer.getName())
                .unreadCount(0)
                .isActive(true)
                .build();
        
        return conversationRepository.save(conversation);
    }
    
    private Customer findOrCreateCustomer(String platformCustomerId, MessagingAccount account) {
        // For now, create a simple customer record
        // In a real implementation, you might want to fetch user profile from Facebook API
        
        Optional<Customer> existingCustomer = customerRepository
                .findByFacebookId(platformCustomerId);
        
        if (existingCustomer.isPresent()) {
            return existingCustomer.get();
        }
        
        // Create new customer
        Customer customer = Customer.builder()
                .name("Facebook User " + platformCustomerId.substring(0, Math.min(8, platformCustomerId.length())))
                .phone("N/A") // Required field, using placeholder
                .address("N/A") // Required field, using placeholder
                .facebookId(platformCustomerId)
                .build();
        
        return customerRepository.save(customer);
    }
}
