package com.tripzin.eleganttex.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripzin.eleganttex.dto.sse.MessagingEventDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessagingSSEService {
    
    private final ObjectMapper objectMapper;
    
    // Store SSE connections by user ID
    private final Map<Long, CopyOnWriteArrayList<SseEmitter>> userConnections = new ConcurrentHashMap<>();
    
    // SSE timeout (30 minutes)
    private static final long SSE_TIMEOUT = 30 * 60 * 1000L;
    
    /**
     * Create a new SSE connection for a user
     */
    public SseEmitter createConnection(Long userId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
        
        // Add connection to user's connection list
        userConnections.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);
        
        // Set up connection lifecycle handlers
        emitter.onCompletion(() -> {
            log.debug("SSE connection completed for user: {}", userId);
            removeConnection(userId, emitter);
        });
        
        emitter.onTimeout(() -> {
            log.debug("SSE connection timed out for user: {}", userId);
            removeConnection(userId, emitter);
        });
        
        emitter.onError((ex) -> {
            log.error("SSE connection error for user: {}", userId, ex);
            removeConnection(userId, emitter);
        });
        
        // Send initial connection confirmation
        try {
            MessagingEventDTO connectionEvent = MessagingEventDTO.connectionStatus(userId, "Connected to messaging events");
            sendEventToEmitter(emitter, connectionEvent);
            log.info("New SSE connection established for user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to send initial connection event to user: {}", userId, e);
            removeConnection(userId, emitter);
        }
        
        return emitter;
    }
    
    /**
     * Send event to all connections of a specific user
     */
    public void sendEventToUser(Long userId, MessagingEventDTO event) {
        CopyOnWriteArrayList<SseEmitter> connections = userConnections.get(userId);
        if (connections == null || connections.isEmpty()) {
            log.debug("No active SSE connections for user: {}", userId);
            return;
        }
        
        log.debug("Sending event {} to {} connections for user: {}", event.getType(), connections.size(), userId);
        
        // Send to all user connections
        connections.removeIf(emitter -> !sendEventToEmitter(emitter, event));
        
        // Clean up if no connections left
        if (connections.isEmpty()) {
            userConnections.remove(userId);
        }
    }
    
    /**
     * Send event to multiple users
     */
    public void sendEventToUsers(Iterable<Long> userIds, MessagingEventDTO event) {
        for (Long userId : userIds) {
            sendEventToUser(userId, event);
        }
    }
    
    /**
     * Broadcast event to all connected users
     */
    public void broadcastEvent(MessagingEventDTO event) {
        if (userConnections.isEmpty()) {
            log.debug("No active SSE connections for broadcast");
            return;
        }
        
        log.debug("Broadcasting event {} to {} users", event.getType(), userConnections.size());
        
        userConnections.forEach((userId, connections) -> {
            connections.removeIf(emitter -> !sendEventToEmitter(emitter, event));
            if (connections.isEmpty()) {
                userConnections.remove(userId);
            }
        });
    }
    
    /**
     * Get active connection count for a user
     */
    public int getConnectionCount(Long userId) {
        CopyOnWriteArrayList<SseEmitter> connections = userConnections.get(userId);
        return connections != null ? connections.size() : 0;
    }
    
    /**
     * Get total active connections count
     */
    public int getTotalConnectionCount() {
        return userConnections.values().stream()
                .mapToInt(CopyOnWriteArrayList::size)
                .sum();
    }
    
    /**
     * Get active users count
     */
    public int getActiveUsersCount() {
        return userConnections.size();
    }
    
    /**
     * Remove a specific connection
     */
    private void removeConnection(Long userId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> connections = userConnections.get(userId);
        if (connections != null) {
            connections.remove(emitter);
            if (connections.isEmpty()) {
                userConnections.remove(userId);
            }
        }
    }
    
    /**
     * Send event to a specific emitter
     */
    private boolean sendEventToEmitter(SseEmitter emitter, MessagingEventDTO event) {
        try {
            String eventData = objectMapper.writeValueAsString(event);
            emitter.send(SseEmitter.event()
                    .name(event.getType().name())
                    .data(eventData)
                    .id(String.valueOf(System.currentTimeMillis())));
            return true;
        } catch (IOException e) {
            log.error("Failed to send SSE event: {}", e.getMessage());
            try {
                emitter.completeWithError(e);
            } catch (Exception ex) {
                log.error("Failed to complete emitter with error", ex);
            }
            return false;
        }
    }
    
    /**
     * Close all connections for a user
     */
    public void closeUserConnections(Long userId) {
        CopyOnWriteArrayList<SseEmitter> connections = userConnections.remove(userId);
        if (connections != null) {
            for (SseEmitter emitter : connections) {
                try {
                    emitter.complete();
                } catch (Exception e) {
                    log.error("Error closing SSE connection for user: {}", userId, e);
                }
            }
            log.info("Closed {} SSE connections for user: {}", connections.size(), userId);
        }
    }
    
    /**
     * Close all connections (for shutdown)
     */
    public void closeAllConnections() {
        log.info("Closing all SSE connections ({} users, {} total connections)", 
                getActiveUsersCount(), getTotalConnectionCount());
        
        userConnections.forEach((userId, connections) -> {
            for (SseEmitter emitter : connections) {
                try {
                    emitter.complete();
                } catch (Exception e) {
                    log.error("Error closing SSE connection for user: {}", userId, e);
                }
            }
        });
        
        userConnections.clear();
    }
}
