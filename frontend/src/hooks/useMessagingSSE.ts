import { useEffect, useCallback, useRef } from 'react';
import { sseService, MessagingEvent } from '../services/sse.service';

export interface UseMessagingSSEOptions {
  autoConnect?: boolean;
  onNewMessage?: (event: MessagingEvent) => void;
  onConversationUpdate?: (event: MessagingEvent) => void;
  onUnreadCountUpdate?: (event: MessagingEvent) => void;
  onMessageStatusUpdate?: (event: MessagingEvent) => void;
  onAccountStatusUpdate?: (event: MessagingEvent) => void;
  onConnectionStatusChange?: (event: MessagingEvent) => void;
  onAnyEvent?: (event: MessagingEvent) => void;
}

export interface UseMessagingSSEReturn {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  getConnectionStats: () => Promise<{
    userConnections: number;
    totalConnections: number;
    activeUsers: number;
  }>;
  forceDisconnect: () => Promise<void>;
}

/**
 * React hook for managing SSE messaging events
 */
export function useMessagingSSE(options: UseMessagingSSEOptions = {}): UseMessagingSSEReturn {
  const {
    autoConnect = true,
    onNewMessage,
    onConversationUpdate,
    onUnreadCountUpdate,
    onMessageStatusUpdate,
    onAccountStatusUpdate,
    onConnectionStatusChange,
    onAnyEvent
  } = options;

  const unsubscribersRef = useRef<(() => void)[]>([]);

  // Connect function
  const connect = useCallback(async () => {
    await sseService.connect();
  }, []);

  // Disconnect function
  const disconnect = useCallback(() => {
    sseService.disconnect();
  }, []);

  // Get connection stats
  const getConnectionStats = useCallback(async () => {
    return await sseService.getConnectionStats();
  }, []);

  // Force disconnect
  const forceDisconnect = useCallback(async () => {
    await sseService.forceDisconnect();
  }, []);

  // Check if connected
  const isConnected = sseService.isConnected();

  // Set up event listeners
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Subscribe to specific events
    if (onNewMessage) {
      unsubscribers.push(sseService.on('NEW_MESSAGE', onNewMessage));
    }

    if (onConversationUpdate) {
      unsubscribers.push(sseService.on('CONVERSATION_UPDATE', onConversationUpdate));
    }

    if (onUnreadCountUpdate) {
      unsubscribers.push(sseService.on('UNREAD_COUNT_UPDATE', onUnreadCountUpdate));
    }

    if (onMessageStatusUpdate) {
      unsubscribers.push(sseService.on('MESSAGE_STATUS_UPDATE', onMessageStatusUpdate));
    }

    if (onAccountStatusUpdate) {
      unsubscribers.push(sseService.on('ACCOUNT_STATUS_UPDATE', onAccountStatusUpdate));
    }

    if (onConnectionStatusChange) {
      unsubscribers.push(sseService.on('CONNECTION_STATUS', onConnectionStatusChange));
    }

    if (onAnyEvent) {
      unsubscribers.push(sseService.onAny(onAnyEvent));
    }

    unsubscribersRef.current = unsubscribers;

    // Auto-connect if enabled
    if (autoConnect && !sseService.isConnected()) {
      connect().catch(console.error);
    }

    // Cleanup function
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
      unsubscribersRef.current = [];
    };
  }, [
    autoConnect,
    connect,
    onNewMessage,
    onConversationUpdate,
    onUnreadCountUpdate,
    onMessageStatusUpdate,
    onAccountStatusUpdate,
    onConnectionStatusChange,
    onAnyEvent
  ]);

  return {
    isConnected,
    connect,
    disconnect,
    getConnectionStats,
    forceDisconnect
  };
}

/**
 * Hook for listening to new messages only
 */
export function useNewMessages(onNewMessage: (event: MessagingEvent) => void) {
  return useMessagingSSE({
    onNewMessage
  });
}

/**
 * Hook for listening to conversation updates only
 */
export function useConversationUpdates(onConversationUpdate: (event: MessagingEvent) => void) {
  return useMessagingSSE({
    onConversationUpdate
  });
}

/**
 * Hook for listening to unread count updates only
 */
export function useUnreadCountUpdates(onUnreadCountUpdate: (event: MessagingEvent) => void) {
  return useMessagingSSE({
    onUnreadCountUpdate
  });
}

/**
 * Hook for listening to connection status changes only
 */
export function useConnectionStatus(onConnectionStatusChange: (event: MessagingEvent) => void) {
  return useMessagingSSE({
    onConnectionStatusChange,
    autoConnect: false // Don't auto-connect for status monitoring
  });
}

/**
 * Hook for listening to all messaging events
 */
export function useAllMessagingEvents(onAnyEvent: (event: MessagingEvent) => void) {
  return useMessagingSSE({
    onAnyEvent
  });
}

export default useMessagingSSE;
