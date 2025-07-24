package com.tripzin.eleganttex.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripzin.eleganttex.config.MessagingProperties.Facebook;
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

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FacebookApiService {
    
    private static final String GRAPH_API_BASE_URL = "https://graph.facebook.com/v23.0";
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    /**
     * Send a text message via Facebook Messenger
     */
    public void sendTextMessage(MessagingAccount account, String recipientId, String message) {
        String url = GRAPH_API_BASE_URL + "/" + account.getPageId() + "/messages";
        
        Map<String, Object> payload = new HashMap<>();
        payload.put("recipient", Map.of("id", recipientId));
        payload.put("message", Map.of("text", message));
        payload.put("messaging_type", "RESPONSE");
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + account.getAccessToken());
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
        
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                log.info("Message sent successfully to Facebook user: {}", recipientId);
            } else {
                throw new MessagingApiException("Failed to send Facebook message. Status: " + response.getStatusCode());
            }
            
        } catch (HttpClientErrorException.Unauthorized e) {
            throw new InvalidTokenException("Facebook access token is invalid or expired");
        } catch (HttpClientErrorException e) {
            throw new MessagingApiException("Facebook API error: " + e.getResponseBodyAsString(), 
                HttpStatus.valueOf(e.getStatusCode().value()));
        } catch (Exception e) {
            throw new MessagingApiException("Failed to send Facebook message: " + e.getMessage());
        }
    }
    
    /**
     * Get user profile information
     */
    public Map<String, Object> getUserProfile(MessagingAccount account, String userId) {
        String url = UriComponentsBuilder.newInstance()
                .scheme("https")
                .host("graph.facebook.com")
                .port(443)
                .path("/v23.0/" + userId)
                .queryParam("access_token", account.getAccessToken())
                .queryParam("fields", "first_name,last_name,profile_pic")
                .build()
                .toUriString();
        
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                Map<String, Object> profile = new HashMap<>();
                profile.put("firstName", jsonNode.get("first_name").asText());
                profile.put("lastName", jsonNode.get("last_name").asText());
                profile.put("profilePic", jsonNode.get("profile_pic").asText());
                return profile;
            } else {
                throw new MessagingApiException("Failed to fetch Facebook user profile. Status: " + response.getStatusCode());
            }
            
        } catch (HttpClientErrorException.Unauthorized e) {
            throw new InvalidTokenException("Facebook access token is invalid or expired");
        } catch (HttpClientErrorException e) {
            throw new MessagingApiException("Facebook API error: " + e.getResponseBodyAsString(), 
                HttpStatus.valueOf(e.getStatusCode().value()));
        } catch (Exception e) {
            throw new MessagingApiException("Failed to fetch Facebook user profile: " + e.getMessage());
        }
    }
    
    /**
     * Get page access token info
     */
    public void validatePageAccessToken(String pageId, String accessToken) {
        String url = UriComponentsBuilder.newInstance()
                .scheme("https")
                .host("graph.facebook.com")
                .port(443)
                .path("/v23.0/" + pageId)
                .queryParam("fields", "name,access_token")
                .queryParam("access_token", accessToken)
                .build()
                .toUriString();
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                log.info("Facebook page access token validated successfully for page: {}", pageId);
            } else {
                throw new InvalidTokenException("Facebook page access token validation failed");
            }
            
        } catch (HttpClientErrorException.Unauthorized e) {
            throw new InvalidTokenException("Facebook page access token is invalid or expired");
        } catch (HttpClientErrorException e) {
            throw new MessagingApiException("Facebook API error during token validation: " + e.getResponseBodyAsString(), 
                HttpStatus.valueOf(e.getStatusCode().value()));
        } catch (Exception e) {
            throw new MessagingApiException("Failed to validate Facebook page access token: " + e.getMessage());
        }
    }
    
    /**
     * Set up webhook subscription
     */
    public void subscribeToWebhook(MessagingAccount account) {
        String url = GRAPH_API_BASE_URL + "/" + account.getPageId() + "/subscribed_apps";
        
        Map<String, Object> payload = new HashMap<>();
        payload.put("subscribed_fields", "messages,messaging_postbacks,messaging_optins,message_deliveries,message_reads");
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + account.getAccessToken());
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
        
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                log.info("Facebook webhook subscription successful for page: {}", account.getPageId());
            } else {
                throw new MessagingApiException("Failed to subscribe to Facebook webhook. Status: " + response.getStatusCode());
            }
            
        } catch (HttpClientErrorException.Unauthorized e) {
            throw new InvalidTokenException("Facebook access token is invalid or expired");
        } catch (HttpClientErrorException e) {
            throw new MessagingApiException("Facebook API error during webhook subscription: " + e.getResponseBodyAsString(), 
                HttpStatus.valueOf(e.getStatusCode().value()));
        } catch (Exception e) {
            throw new MessagingApiException("Failed to subscribe to Facebook webhook: " + e.getMessage());
        }
    }
    
    /**
     * Get conversation history
     */
    public JsonNode getConversationHistory(MessagingAccount account, String userId, int limit) {
        String url = UriComponentsBuilder.newInstance()
                .scheme("https")
                .host("graph.facebook.com")
                .port(443)
                .path("/v23.0/" + userId + "/conversations")
                .queryParam("fields", "id,participants,snippet,updated_time")
                .queryParam("limit", limit)
                .queryParam("access_token", account.getAccessToken())
                .build()
                .toUriString();
        
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                return objectMapper.readTree(response.getBody());
            } else {
                throw new MessagingApiException("Failed to fetch Facebook conversation history. Status: " + response.getStatusCode());
            }
            
        } catch (HttpClientErrorException.Unauthorized e) {
            throw new InvalidTokenException("Facebook access token is invalid or expired");
        } catch (HttpClientErrorException e) {
            throw new MessagingApiException("Facebook API error: " + e.getResponseBodyAsString(), 
                HttpStatus.valueOf(e.getStatusCode().value()));
        } catch (Exception e) {
            throw new MessagingApiException("Failed to fetch Facebook conversation history: " + e.getMessage());
        }
    }
    
    /**
     * Mark message as read
     */
    public void markMessageAsRead(MessagingAccount account, String senderId) {
        String url = GRAPH_API_BASE_URL + "/" + account.getPageId() + "/messages";
        
        Map<String, Object> payload = new HashMap<>();
        payload.put("recipient", Map.of("id", senderId));
        payload.put("sender_action", "mark_seen");
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + account.getAccessToken());
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
        
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                log.info("Facebook message marked as read for sender: {}", senderId);
            } else {
                throw new MessagingApiException("Failed to mark Facebook message as read. Status: " + response.getStatusCode());
            }
            
        } catch (HttpClientErrorException.Unauthorized e) {
            throw new InvalidTokenException("Facebook access token is invalid or expired");
        } catch (HttpClientErrorException e) {
            throw new MessagingApiException("Facebook API error: " + e.getResponseBodyAsString(), 
                HttpStatus.valueOf(e.getStatusCode().value()));
        } catch (Exception e) {
            throw new MessagingApiException("Failed to mark Facebook message as read: " + e.getMessage());
        }
    }
    
    /**
     * Validate page access token
     */
    public boolean validatePageAccess(String pageId, String accessToken) {
        try {
            String url = UriComponentsBuilder.newInstance()
                    .scheme("https")
                    .host("graph.facebook.com")
                    .port(443)
                    .path("/v23.0/" + pageId)
                    .queryParam("fields", "name,id")
                    .queryParam("access_token", accessToken)
                    .build()
                    .toUriString();
            
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode() == HttpStatus.OK;
            
        } catch (Exception e) {
            log.error("Error validating Facebook page access: {}", pageId, e);
            return false;
        }
    }
    
    /**
     * Get page information
     */
    public Map<String, Object> getPageInfo(String pageId, String accessToken) {
        try {
            if (pageId == null || accessToken == null || accessToken.trim().isEmpty()) {
                throw new IllegalArgumentException("Page ID and access token are required");
            }

            String url = UriComponentsBuilder.newInstance()
                    .scheme("https")
                    .host("graph.facebook.com")
                    .path("/v23.0/" + pageId)
                    .queryParam("fields", "name,id,category")
                    .queryParam("access_token", accessToken)
                    .build(false)  // This prevents template expansion
                    .toUriString();

            log.debug("Requesting Facebook page info for pageId: {}", pageId);

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                Map<String, Object> pageInfo = new HashMap<>();

                pageInfo.put("name", jsonNode.has("name") ? jsonNode.get("name").asText() : null);
                pageInfo.put("id", jsonNode.has("id") ? jsonNode.get("id").asText() : null);
                pageInfo.put("category", jsonNode.has("category") ? jsonNode.get("category").asText() : null);

                if (jsonNode.has("picture") && jsonNode.get("picture").has("data")
                        && jsonNode.get("picture").get("data").has("url")) {
                    pageInfo.put("picture", jsonNode.get("picture").get("data").get("url").asText());
                }

                return pageInfo;
            }

        } catch (HttpClientErrorException e) {
            log.error("Facebook API error for page {}: {} - {}",
                    pageId, e.getStatusCode(), e.getResponseBodyAsString());
            throw e;
        } catch (Exception e) {
            log.error("Error fetching Facebook page info for page: {}", pageId, e);
            throw new RuntimeException("Failed to fetch Facebook page info", e);
        }

        return null;
    }
}
