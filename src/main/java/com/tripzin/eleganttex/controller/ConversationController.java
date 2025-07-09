package com.tripzin.eleganttex.controller;

import com.tripzin.eleganttex.service.ConversationService;
import com.tripzin.eleganttex.security.services.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/messaging")
@RequiredArgsConstructor
@Slf4j
public class ConversationController {
    
    private final ConversationService conversationService;
    
    /**
     * Get conversations for a specific messaging account
     */
    @GetMapping("/accounts/{accountId}/conversations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Map<String, Object>>> getAccountConversations(
            @PathVariable Long accountId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean hasUnread,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Map<String, Object>> conversations = conversationService.getAccountConversations(
                currentUser.getId(), accountId, hasUnread, search, pageable);
        
        return ResponseEntity.ok(conversations);
    }
    
    /**
     * Get all conversations across all accounts
     */
    @GetMapping("/conversations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Map<String, Object>>> getAllConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean hasUnread,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String platform,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Map<String, Object>> conversations = conversationService.getAllConversations(
                currentUser.getId(), hasUnread, search, platform, pageable);
        
        return ResponseEntity.ok(conversations);
    }
    
    /**
     * Get a specific conversation by ID
     */
    @GetMapping("/conversations/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getConversation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        
        Map<String, Object> conversation = conversationService.getConversationById(currentUser.getId(), id);
        return ResponseEntity.ok(conversation);
    }
    
    /**
     * Update conversation details
     */
    @PutMapping("/conversations/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateConversation(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        
        Map<String, Object> updatedConversation = conversationService.updateConversation(
                currentUser.getId(), id, updates);
        
        return ResponseEntity.ok(updatedConversation);
    }
    
    /**
     * Mark conversation as read
     */
    @PatchMapping("/conversations/{id}/mark-read")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> markConversationAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        
        conversationService.markConversationAsRead(currentUser.getId(), id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Conversation marked as read"));
    }
    
    /**
     * Archive/unarchive conversation
     */
    @PatchMapping("/conversations/{id}/archive")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> toggleConversationArchive(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        
        boolean archive = request.getOrDefault("archive", true);
        conversationService.toggleConversationArchive(currentUser.getId(), id, archive);
        
        String message = archive ? "Conversation archived" : "Conversation unarchived";
        return ResponseEntity.ok(Map.of("success", true, "message", message));
    }
    
    /**
     * Get conversation statistics
     */
    @GetMapping("/conversations/{id}/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getConversationStats(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        
        Map<String, Object> stats = conversationService.getConversationStats(currentUser.getId(), id);
        return ResponseEntity.ok(stats);
    }
}
