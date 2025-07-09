package com.tripzin.eleganttex.controller;

import com.tripzin.eleganttex.security.services.UserDetailsImpl;
import com.tripzin.eleganttex.service.MessagingSSEService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

@RestController
@RequestMapping("/api/messaging/sse")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class MessagingSSEController {
    
    private final MessagingSSEService messagingSSEService;
    
    /**
     * Establish SSE connection for real-time messaging events
     */
    @GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamEvents(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long userId = userDetails.getId();
        log.info("Establishing SSE connection for user: {}", userId);
        
        return messagingSSEService.createConnection(userId);
    }
    
    /**
     * Get SSE connection statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getConnectionStats(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long userId = userDetails.getId();
        
        Map<String, Object> stats = Map.of(
                "userConnections", messagingSSEService.getConnectionCount(userId),
                "totalConnections", messagingSSEService.getTotalConnectionCount(),
                "activeUsers", messagingSSEService.getActiveUsersCount()
        );
        
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Close all SSE connections for the current user
     */
    @PostMapping("/disconnect")
    public ResponseEntity<Map<String, String>> disconnectUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long userId = userDetails.getId();
        log.info("Manually disconnecting SSE connections for user: {}", userId);
        
        messagingSSEService.closeUserConnections(userId);
        
        return ResponseEntity.ok(Map.of("message", "All connections closed successfully"));
    }
}
