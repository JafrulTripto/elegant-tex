package com.tripzin.eleganttex.controller;

import com.tripzin.eleganttex.service.FacebookApiService;
import com.tripzin.eleganttex.service.WhatsAppApiService;
import com.tripzin.eleganttex.service.MessagingStatsService;
import com.tripzin.eleganttex.security.services.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/messaging")
@RequiredArgsConstructor
@Slf4j
public class MessagingController {
    
    private final FacebookApiService facebookApiService;
    private final WhatsAppApiService whatsAppApiService;
    private final MessagingStatsService messagingStatsService;
    
    /**
     * Validate Facebook page access token
     */
    @PostMapping("/validate/facebook")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> validateFacebookToken(
            @RequestBody Map<String, String> request) {
        
        String pageId = request.get("pageId");
        String accessToken = request.get("accessToken");
        
        log.info("Validating Facebook token for page: {}", pageId);
        
        try {
            boolean isValid = facebookApiService.validatePageAccess(pageId, accessToken);
            
            if (isValid) {
                // Get additional page info if valid
                Map<String, Object> pageInfo = facebookApiService.getPageInfo(pageId, accessToken);
                return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "pageInfo", pageInfo
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "valid", false,
                    "error", "Invalid page ID or access token"
                ));
            }
            
        } catch (Exception e) {
            log.error("Error validating Facebook token", e);
            return ResponseEntity.ok(Map.of(
                "valid", false,
                "error", "Failed to validate token: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Validate WhatsApp phone number access token
     */
    @PostMapping("/validate/whatsapp")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> validateWhatsAppToken(
            @RequestBody Map<String, String> request) {
        
        String phoneNumberId = request.get("phoneNumberId");
        String accessToken = request.get("accessToken");
        
        log.info("Validating WhatsApp token for phone number: {}", phoneNumberId);
        
        try {
            boolean isValid = whatsAppApiService.validatePhoneNumberAccess(phoneNumberId, accessToken);
            
            if (isValid) {
                // Get business profile if valid
                Map<String, Object> profile = whatsAppApiService.getBusinessProfile(
                    createTempAccount(phoneNumberId, accessToken)
                );
                return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "profile", profile
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "valid", false,
                    "error", "Invalid phone number ID or access token"
                ));
            }
            
        } catch (Exception e) {
            log.error("Error validating WhatsApp token", e);
            return ResponseEntity.ok(Map.of(
                "valid", false,
                "error", "Failed to validate token: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Get overall messaging statistics
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getOverallStats(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        
        Map<String, Object> stats = messagingStatsService.getOverallStats(currentUser.getId());
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Get statistics for a specific account
     */
    @GetMapping("/accounts/{accountId}/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAccountStats(
            @PathVariable Long accountId,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        
        Map<String, Object> stats = messagingStatsService.getAccountStats(currentUser.getId(), accountId);
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Helper method to create temporary account for validation
     */
    private com.tripzin.eleganttex.entity.MessagingAccount createTempAccount(String phoneNumberId, String accessToken) {
        return com.tripzin.eleganttex.entity.MessagingAccount.builder()
                .phoneNumberId(phoneNumberId)
                .accessToken(accessToken)
                .build();
    }
}
