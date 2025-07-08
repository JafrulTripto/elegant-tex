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
public class WhatsAppWebhookService {
    
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
                MessagingAccount.MessagingPlatform.WHATSAPP, verifyToken);
    }
    
    /**
     * Process incoming webhook event from WhatsApp
     */
    @Transactional
    public void processWebhookEvent(Map<String, Object> payload) {
        try {
            // Log the webhook event
            WebhookEvent webhookEvent = WebhookEvent.builder()
                    .platform(MessagingAccount.MessagingPlatform.WHATSAPP)
                    .eventType("whatsapp_webhook")
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
            log.error("Error processing WhatsApp webhook event", e);
            throw new RuntimeException("Failed to process webhook event", e);
        }
    }
    
    private void processEntry(JsonNode entry, WebhookEvent webhookEvent) {
        String phoneNumberId = entry.get("id").asText();
        
        // Find the messaging account
        Optional<MessagingAccount> accountOpt = messagingAccountRepository
                .findByPlatformAndPhoneNumberId(MessagingAccount.MessagingPlatform.WHATSAPP, phoneNumberId);
        
        if (accountOpt.isEmpty()) {
            log.warn("No messaging account found for WhatsApp phone number ID: {}", phoneNumberId);
            return;
        }
        
        MessagingAccount account = accountOpt.get();
        webhookEvent.setMessagingAccount(account);
        
        if (entry.has("changes")) {
            JsonNode changes = entry.get("changes");
            for (JsonNode change : changes) {
                if (change.has("value")) {
                    processValue(change.get("value"), account);
                }
            }
        }
    }
    
    private void processValue(JsonNode valueNode, MessagingAccount account) {
        if (valueNode.has("messages")) {
            JsonNode messages = valueNode.get("messages");
            for (JsonNode message : messages) {
                processMessage(message, account, true); // WhatsApp messages are always inbound in webhook
            }
        }
        
        if (valueNode.has("statuses")) {
            JsonNode statuses = valueNode.get("statuses");
            for (JsonNode status : statuses) {
                processMessageStatus(status, account);
            }
        }
    }
    
    private void processMessage(JsonNode messageNode, MessagingAccount account, boolean isInbound) {
        try {
            String messageId = messageNode.get("id").asText();
            String fromNumber = messageNode.get("from").asText();
            long timestamp = messageNode.get("timestamp").asLong();
            
            // Check if message already exists
            if (messageRepository.findByPlatformMessageId(messageId).isPresent()) {
                log.debug("WhatsApp message already exists: {}", messageId);
                return;
            }
            
            // Find or create conversation
            Conversation conversation = findOrCreateConversation(account, fromNumber);
            
            // Process different message types
            String messageType = messageNode.get("type").asText();
            String content = extractMessageContent(messageNode, messageType);
            
            // Create message
            Message message = Message.builder()
                    .conversation(conversation)
                    .messagingAccount(account)
                    .customer(conversation.getCustomer())
                    .platformMessageId(messageId)
                    .senderId(fromNumber)
                    .recipientId(account.getPhoneNumberId())
                    .messageType(mapWhatsAppMessageType(messageType))
                    .content(content)
                    .isInbound(isInbound)
                    .status(Message.MessageStatus.DELIVERED)
                    .timestamp(LocalDateTime.ofInstant(Instant.ofEpochSecond(timestamp), ZoneId.systemDefault()))
                    .build();
            
            messageRepository.save(message);
            
            // Update conversation
            conversation.setLastMessageAt(message.getTimestamp());
            if (isInbound) {
                conversation.setUnreadCount(conversation.getUnreadCount() + 1);
            }
            conversationRepository.save(conversation);
            
            log.info("Processed WhatsApp message: {} from conversation: {}", messageId, conversation.getId());
            
        } catch (Exception e) {
            log.error("Error processing WhatsApp message", e);
        }
    }
    
    private void processMessageStatus(JsonNode statusNode, MessagingAccount account) {
        try {
            String messageId = statusNode.get("id").asText();
            String status = statusNode.get("status").asText();
            
            messageRepository.findByPlatformMessageId(messageId)
                    .ifPresent(message -> {
                        Message.MessageStatus newStatus = mapWhatsAppStatus(status);
                        message.setStatus(newStatus);
                        messageRepository.save(message);
                        
                        // If message is read, update conversation unread count
                        if (newStatus == Message.MessageStatus.READ) {
                            Conversation conversation = message.getConversation();
                            conversation.setUnreadCount(0);
                            conversationRepository.save(conversation);
                        }
                    });
            
        } catch (Exception e) {
            log.error("Error processing WhatsApp message status", e);
        }
    }
    
    private String extractMessageContent(JsonNode messageNode, String messageType) {
        switch (messageType) {
            case "text":
                return messageNode.get("text").get("body").asText();
            case "image":
                return "📷 Image: " + messageNode.get("image").get("caption").asText("");
            case "document":
                return "📄 Document: " + messageNode.get("document").get("filename").asText("");
            case "audio":
                return "🎵 Audio message";
            case "video":
                return "🎥 Video: " + messageNode.get("video").get("caption").asText("");
            case "location":
                return "📍 Location shared";
            case "contacts":
                return "👤 Contact shared";
            default:
                return "Unsupported message type: " + messageType;
        }
    }
    
    private Message.MessageType mapWhatsAppMessageType(String whatsAppType) {
        switch (whatsAppType) {
            case "text":
                return Message.MessageType.TEXT;
            case "image":
                return Message.MessageType.IMAGE;
            case "document":
                return Message.MessageType.DOCUMENT;
            case "audio":
                return Message.MessageType.AUDIO;
            case "video":
                return Message.MessageType.VIDEO;
            case "location":
                return Message.MessageType.LOCATION;
            default:
                return Message.MessageType.TEXT;
        }
    }
    
    private Message.MessageStatus mapWhatsAppStatus(String whatsAppStatus) {
        switch (whatsAppStatus) {
            case "sent":
                return Message.MessageStatus.SENT;
            case "delivered":
                return Message.MessageStatus.DELIVERED;
            case "read":
                return Message.MessageStatus.READ;
            case "failed":
                return Message.MessageStatus.FAILED;
            default:
                return Message.MessageStatus.SENT;
        }
    }
    
    private Conversation findOrCreateConversation(MessagingAccount account, String phoneNumber) {
        Optional<Conversation> existingConversation = conversationRepository
                .findByMessagingAccountAndPlatformCustomerId(account, phoneNumber);
        
        if (existingConversation.isPresent()) {
            return existingConversation.get();
        }
        
        // Try to find existing customer or create new one
        Customer customer = findOrCreateCustomer(phoneNumber);
        
        // Create new conversation
        Conversation conversation = Conversation.builder()
                .messagingAccount(account)
                .customer(customer)
                .platformCustomerId(phoneNumber)
                .conversationName(customer.getName())
                .unreadCount(0)
                .isActive(true)
                .build();
        
        return conversationRepository.save(conversation);
    }
    
    private Customer findOrCreateCustomer(String phoneNumber) {
        // Try to find existing customer by phone
        Optional<Customer> existingCustomer = customerRepository.findByPhone(phoneNumber);
        
        if (existingCustomer.isPresent()) {
            return existingCustomer.get();
        }
        
        // Create new customer
        Customer customer = Customer.builder()
                .name("WhatsApp User " + phoneNumber.substring(Math.max(0, phoneNumber.length() - 4)))
                .phone(phoneNumber)
                .address("N/A") // Required field, using placeholder
                .build();
        
        return customerRepository.save(customer);
    }
}
