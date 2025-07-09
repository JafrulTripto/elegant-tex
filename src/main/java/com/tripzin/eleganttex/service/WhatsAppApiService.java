package com.tripzin.eleganttex.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripzin.eleganttex.entity.MessagingAccount;
import com.tripzin.eleganttex.exception.InvalidTokenException;
import com.tripzin.eleganttex.exception.MessagingApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class WhatsAppApiService {
    
    private static final String WHATSAPP_API_BASE_URL = "https://graph.facebook.com/v18.0";
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    /**
     * Send a text message via WhatsApp Business API
     */
    public void sendTextMessage(MessagingAccount account, String recipientPhoneNumber, String message) {
        String url = WHATSAPP_API_BASE_URL + "/" + account.getPhoneNumberId() + "/messages";
        
        Map<String, Object> payload = new HashMap<>();
        payload.put("messaging_product", "whatsapp");
        payload.put("to", recipientPhoneNumber);
        payload.put("type", "text");
        payload.put("text", Map.of("body", message));
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + account.getAccessToken());
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
        
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                log.info("WhatsApp message sent successfully to: {}", recipientPhoneNumber);
            } else {
                throw new MessagingApiException("Failed to send WhatsApp message. Status: " + response.getStatusCode());
            }
            
        } catch (HttpClientErrorException.Unauthorized e) {
            throw new InvalidTokenException("WhatsApp access token is invalid or expired");
        } catch (HttpClientErrorException e) {
            throw new MessagingApiException("WhatsApp API error: " + e.getResponseBodyAsString(), 
                HttpStatus.valueOf(e.getStatusCode().value()));
        } catch (Exception e) {
            throw new MessagingApiException("Failed to send WhatsApp message: " + e.getMessage());
        }
    }
    
    /**
     * Send a template message via WhatsApp Business API
     */
    public boolean sendTemplateMessage(MessagingAccount account, String recipientPhoneNumber, 
                                     String templateName, String languageCode, Map<String, String> parameters) {
        try {
            String url = WHATSAPP_API_BASE_URL + "/" + account.getPhoneNumberId() + "/messages";
            
            Map<String, Object> template = new HashMap<>();
            template.put("name", templateName);
            template.put("language", Map.of("code", languageCode));
            
            if (parameters != null && !parameters.isEmpty()) {
                template.put("components", parameters);
            }
            
            Map<String, Object> payload = new HashMap<>();
            payload.put("messaging_product", "whatsapp");
            payload.put("to", recipientPhoneNumber);
            payload.put("type", "template");
            payload.put("template", template);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + account.getAccessToken());
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                log.info("WhatsApp template message sent successfully to: {}", recipientPhoneNumber);
                return true;
            } else {
                log.error("Failed to send WhatsApp template message. Status: {}, Response: {}", 
                    response.getStatusCode(), response.getBody());
                return false;
            }
            
        } catch (Exception e) {
            log.error("Error sending WhatsApp template message to: {}", recipientPhoneNumber, e);
            return false;
        }
    }
    
    /**
     * Send media message (image, document, etc.)
     */
    public boolean sendMediaMessage(MessagingAccount account, String recipientPhoneNumber, 
                                  String mediaType, String mediaId, String caption) {
        try {
            String url = WHATSAPP_API_BASE_URL + "/" + account.getPhoneNumberId() + "/messages";
            
            Map<String, Object> media = new HashMap<>();
            media.put("id", mediaId);
            if (caption != null && !caption.isEmpty()) {
                media.put("caption", caption);
            }
            
            Map<String, Object> payload = new HashMap<>();
            payload.put("messaging_product", "whatsapp");
            payload.put("to", recipientPhoneNumber);
            payload.put("type", mediaType);
            payload.put(mediaType, media);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + account.getAccessToken());
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            return response.getStatusCode() == HttpStatus.OK;
            
        } catch (Exception e) {
            log.error("Error sending WhatsApp media message to: {}", recipientPhoneNumber, e);
            return false;
        }
    }
    
    /**
     * Mark message as read
     */
    public boolean markMessageAsRead(MessagingAccount account, String messageId) {
        try {
            String url = WHATSAPP_API_BASE_URL + "/" + account.getPhoneNumberId() + "/messages";
            
            Map<String, Object> payload = new HashMap<>();
            payload.put("messaging_product", "whatsapp");
            payload.put("status", "read");
            payload.put("message_id", messageId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + account.getAccessToken());
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            return response.getStatusCode() == HttpStatus.OK;
            
        } catch (Exception e) {
            log.error("Error marking WhatsApp message as read: {}", messageId, e);
            return false;
        }
    }
    
    /**
     * Get business profile
     */
    public Map<String, Object> getBusinessProfile(MessagingAccount account) {
        try {
            String url = UriComponentsBuilder.newInstance()
                    .scheme("https")
                    .host("graph.facebook.com")
                    .port(443)
                    .path("/v18.0/" + account.getPhoneNumberId() + "/business_profile")
                    .queryParam("access_token", account.getAccessToken())
                    .build()
                    .toUriString();

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                Map<String, Object> profile = new HashMap<>();
                profile.put("displayPhoneNumber", jsonNode.get("display_phone_number").asText());
                profile.put("verifiedName", jsonNode.get("verified_name").asText());
                profile.put("qualityRating", jsonNode.get("quality_rating").asText());
                return profile;
            }
            
        } catch (Exception e) {
            log.error("Error fetching WhatsApp business profile for phone number: {}", account.getPhoneNumberId(), e);
        }
        
        return new HashMap<>();
    }
    
    /**
     * Validate phone number ID and access token
     */
    public boolean validatePhoneNumberAccess(String phoneNumberId, String accessToken) {
        try {
            String url = UriComponentsBuilder.newInstance()
                    .scheme("https")
                    .host("graph.facebook.com")
                    .port(443)
                    .path("/v18.0/" + phoneNumberId)
                    .build()
                    .toUriString();
            
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode() == HttpStatus.OK;
            
        } catch (Exception e) {
            log.error("Error validating WhatsApp phone number access: {}", phoneNumberId, e);
            return false;
        }
    }
    
    /**
     * Get message templates
     */
    public JsonNode getMessageTemplates(MessagingAccount account) {
        try {
            String url = UriComponentsBuilder.newInstance()
                    .scheme("https")
                    .host("graph.facebook.com")
                    .port(443)
                    .path("/v18.0/" + account.getPhoneNumberId() + "/message_templates")
                    .queryParam("access_token", account.getAccessToken())
                    .build()
                    .toUriString();
            
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                return objectMapper.readTree(response.getBody());
            }
            
        } catch (Exception e) {
            log.error("Error fetching WhatsApp message templates for business account: {}", account.getBusinessAccountId(), e);
        }
        
        return objectMapper.createObjectNode();
    }
    
    /**
     * Upload media file
     */
    public String uploadMedia(MessagingAccount account, byte[] mediaData, String mimeType, String filename) {
        try {
            String url = WHATSAPP_API_BASE_URL + "/" + account.getPhoneNumberId() + "/media";
            
            // This would typically use MultipartFile upload
            // For now, returning a placeholder implementation
            log.info("Media upload requested for file: {} with type: {}", filename, mimeType);
            
            // TODO: Implement actual media upload with multipart form data
            return "media_id_placeholder";
            
        } catch (Exception e) {
            log.error("Error uploading media file: {}", filename, e);
            return null;
        }
    }
}
