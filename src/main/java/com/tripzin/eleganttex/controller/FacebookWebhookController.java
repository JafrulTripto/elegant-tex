package com.tripzin.eleganttex.controller;

import com.tripzin.eleganttex.service.FacebookWebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/webhooks/facebook")
@RequiredArgsConstructor
@Slf4j
public class FacebookWebhookController {
    
    private final FacebookWebhookService facebookWebhookService;
    
    /**
     * Webhook verification endpoint for Facebook
     */
    @GetMapping
    public ResponseEntity<String> verifyWebhook(
            @RequestParam("hub.mode") String mode,
            @RequestParam("hub.challenge") String challenge,
            @RequestParam("hub.verify_token") String verifyToken) {
        
        log.info("Facebook webhook verification request received. Mode: {}, Token: {}", mode, verifyToken);
        
        if ("subscribe".equals(mode)) {
            if (facebookWebhookService.verifyWebhookToken(verifyToken)) {
                log.info("Facebook webhook verification successful");
                return ResponseEntity.ok(challenge);
            } else {
                log.warn("Facebook webhook verification failed - invalid token");
                return ResponseEntity.status(403).body("Forbidden");
            }
        }
        
        log.warn("Facebook webhook verification failed - invalid mode: {}", mode);
        return ResponseEntity.status(400).body("Bad Request");
    }
    
    /**
     * Webhook endpoint to receive Facebook messages and events
     */
    @PostMapping
    public ResponseEntity<String> handleWebhook(@RequestBody Map<String, Object> payload) {
        try {
            log.info("Facebook webhook event received");
            facebookWebhookService.processWebhookEvent(payload);
            return ResponseEntity.ok("EVENT_RECEIVED");
        } catch (Exception e) {
            log.error("Error processing Facebook webhook event", e);
            return ResponseEntity.status(500).body("Internal Server Error");
        }
    }
}
