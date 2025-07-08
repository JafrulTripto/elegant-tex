package com.tripzin.eleganttex.controller;

import com.tripzin.eleganttex.service.WhatsAppWebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/webhooks/whatsapp")
@RequiredArgsConstructor
@Slf4j
public class WhatsAppWebhookController {
    
    private final WhatsAppWebhookService whatsAppWebhookService;
    
    /**
     * Webhook verification endpoint for WhatsApp
     */
    @GetMapping
    public ResponseEntity<String> verifyWebhook(
            @RequestParam("hub.mode") String mode,
            @RequestParam("hub.challenge") String challenge,
            @RequestParam("hub.verify_token") String verifyToken) {
        
        log.info("WhatsApp webhook verification request received. Mode: {}, Token: {}", mode, verifyToken);
        
        if ("subscribe".equals(mode)) {
            if (whatsAppWebhookService.verifyWebhookToken(verifyToken)) {
                log.info("WhatsApp webhook verification successful");
                return ResponseEntity.ok(challenge);
            } else {
                log.warn("WhatsApp webhook verification failed - invalid token");
                return ResponseEntity.status(403).body("Forbidden");
            }
        }
        
        log.warn("WhatsApp webhook verification failed - invalid mode: {}", mode);
        return ResponseEntity.status(400).body("Bad Request");
    }
    
    /**
     * Webhook endpoint to receive WhatsApp messages and events
     */
    @PostMapping
    public ResponseEntity<String> handleWebhook(@RequestBody Map<String, Object> payload) {
        try {
            log.info("WhatsApp webhook event received");
            whatsAppWebhookService.processWebhookEvent(payload);
            return ResponseEntity.ok("EVENT_RECEIVED");
        } catch (Exception e) {
            log.error("Error processing WhatsApp webhook event", e);
            return ResponseEntity.status(500).body("Internal Server Error");
        }
    }
}
