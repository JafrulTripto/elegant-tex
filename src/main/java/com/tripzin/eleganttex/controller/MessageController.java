package com.tripzin.eleganttex.controller;

import com.tripzin.eleganttex.service.MessageService;
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
public class MessageController {
    
    private final MessageService messageService;
    
    /**
     * Get messages for a conversation
     */
    @GetMapping("/conversations/{conversationId}/messages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Map<String, Object>>> getConversationMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Map<String, Object>> messages = messageService.getConversationMessages(
                currentUser.getId(), conversationId, pageable);
        
        return ResponseEntity.ok(messages);
    }
    
    /**
     * Get all messages across conversations with filtering
     */
    @GetMapping("/messages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Map<String, Object>>> getAllMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String messageType,
            @RequestParam(required = false) Boolean isInbound,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String platform,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Map<String, Object>> messages = messageService.getAllMessages(
                currentUser.getId(), messageType, isInbound, search, platform, pageable);
        
        return ResponseEntity.ok(messages);
    }
    
    /**
     * Send a message
     */
    @PostMapping("/messages/send")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> sendMessage(
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        
        Long conversationId = Long.valueOf(request.get("conversationId").toString());
        String content = (String) request.get("content");
        String messageType = (String) request.getOrDefault("messageType", "TEXT");
        
        Map<String, Object> sentMessage = messageService.sendMessage(
                currentUser.getId(), conversationId, content, messageType);
        
        return ResponseEntity.ok(sentMessage);
    }
    
    /**
     * Get a specific message by ID
     */
    @GetMapping("/messages/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getMessage(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        
        Map<String, Object> message = messageService.getMessageById(currentUser.getId(), id);
        return ResponseEntity.ok(message);
    }
    
    /**
     * Mark message as read
     */
    @PatchMapping("/messages/{id}/mark-read")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> markMessageAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        
        messageService.markMessageAsRead(currentUser.getId(), id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Message marked as read"));
    }
    
    /**
     * Delete a message (soft delete)
     */
    @DeleteMapping("/messages/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteMessage(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        
        messageService.deleteMessage(currentUser.getId(), id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Message deleted"));
    }
    
    /**
     * Get message statistics
     */
    @GetMapping("/messages/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getMessageStats(
            @RequestParam(required = false) String period,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        
        Map<String, Object> stats = messageService.getMessageStats(currentUser.getId(), period);
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Bulk mark messages as read
     */
    @PatchMapping("/messages/bulk-mark-read")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> bulkMarkAsRead(
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        
        @SuppressWarnings("unchecked")
        java.util.List<Long> messageIds = (java.util.List<Long>) request.get("messageIds");
        
        int markedCount = messageService.bulkMarkAsRead(currentUser.getId(), messageIds);
        
        return ResponseEntity.ok(Map.of(
                "success", true, 
                "message", "Messages marked as read",
                "count", markedCount
        ));
    }
}
