import api from './api';

export interface MessagingEvent {
  type: 'NEW_MESSAGE' | 'MESSAGE_STATUS_UPDATE' | 'CONVERSATION_UPDATE' | 'UNREAD_COUNT_UPDATE' | 'ACCOUNT_STATUS_UPDATE' | 'CONNECTION_STATUS';
  userId?: number;
  accountId?: number;
  conversationId?: number;
  messageId?: number;
  data?: any;
  message?: string;
  timestamp: string;
}

export type EventHandler = (event: MessagingEvent) => void;

class SSEService {
  private eventSource: EventSource | null = null;
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private isConnecting = false;

  /**
   * Connect to SSE endpoint for real-time messaging events
   */
  async connect(): Promise<void> {
    if (this.eventSource || this.isConnecting) {
      console.log('SSE already connected or connecting');
      return;
    }

    this.isConnecting = true;

    try {
      // Get auth token
      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create EventSource with auth header (using URL parameter as fallback)
      const url = `${api.defaults.baseURL}/messaging/sse/events?token=${encodeURIComponent(token)}`;
      
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('SSE connection established');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.isConnecting = false;
        this.emit('CONNECTION_STATUS', {
          type: 'CONNECTION_STATUS',
          message: 'Connected',
          timestamp: new Date().toISOString()
        });
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleEvent(data);
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        this.isConnecting = false;
        
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          this.handleReconnect();
        }
      };

      // Handle specific event types
      this.eventSource.addEventListener('NEW_MESSAGE', (event) => {
        const data = JSON.parse(event.data);
        this.emit('NEW_MESSAGE', data);
      });

      this.eventSource.addEventListener('CONVERSATION_UPDATE', (event) => {
        const data = JSON.parse(event.data);
        this.emit('CONVERSATION_UPDATE', data);
      });

      this.eventSource.addEventListener('UNREAD_COUNT_UPDATE', (event) => {
        const data = JSON.parse(event.data);
        this.emit('UNREAD_COUNT_UPDATE', data);
      });

      this.eventSource.addEventListener('MESSAGE_STATUS_UPDATE', (event) => {
        const data = JSON.parse(event.data);
        this.emit('MESSAGE_STATUS_UPDATE', data);
      });

      this.eventSource.addEventListener('ACCOUNT_STATUS_UPDATE', (event) => {
        const data = JSON.parse(event.data);
        this.emit('ACCOUNT_STATUS_UPDATE', data);
      });

      this.eventSource.addEventListener('CONNECTION_STATUS', (event) => {
        const data = JSON.parse(event.data);
        this.emit('CONNECTION_STATUS', data);
      });

    } catch (error) {
      console.error('Failed to establish SSE connection:', error);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  /**
   * Disconnect from SSE
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    
    this.emit('CONNECTION_STATUS', {
      type: 'CONNECTION_STATUS',
      message: 'Disconnected',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Subscribe to specific event types
   */
  on(eventType: MessagingEvent['type'], handler: EventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    
    this.eventHandlers.get(eventType)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Subscribe to all events
   */
  onAny(handler: EventHandler): () => void {
    return this.on('CONNECTION_STATUS', handler); // Use a dummy event type for "any"
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }

  /**
   * Get connection statistics
   */
  async getConnectionStats(): Promise<{
    userConnections: number;
    totalConnections: number;
    activeUsers: number;
  }> {
    const response = await api.get('/messaging/sse/stats');
    return response.data;
  }

  /**
   * Manually disconnect all connections
   */
  async forceDisconnect(): Promise<void> {
    await api.post('/messaging/sse/disconnect');
    this.disconnect();
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('CONNECTION_STATUS', {
        type: 'CONNECTION_STATUS',
        message: 'Connection failed - max attempts reached',
        timestamp: new Date().toISOString()
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.eventSource || this.eventSource.readyState === EventSource.CLOSED) {
        this.eventSource = null;
        this.connect();
      }
    }, delay);
  }

  /**
   * Emit event to handlers
   */
  private emit(eventType: MessagingEvent['type'], event: MessagingEvent): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Error in event handler:', error);
        }
      });
    }

    // Also emit to "any" handlers if they exist
    if (eventType !== 'CONNECTION_STATUS') {
      const anyHandlers = this.eventHandlers.get('CONNECTION_STATUS');
      if (anyHandlers) {
        anyHandlers.forEach(handler => {
          try {
            handler(event);
          } catch (error) {
            console.error('Error in any event handler:', error);
          }
        });
      }
    }
  }

  /**
   * Handle incoming events
   */
  private handleEvent(event: MessagingEvent): void {
    console.log('Received SSE event:', event);
    
    // Emit the event to registered handlers
    this.emit(event.type, event);
  }
}

// Export singleton instance
export const sseService = new SSEService();

// Auto-connect when user is authenticated
const token = localStorage.getItem('token');
if (token) {
  sseService.connect().catch(console.error);
}

// Listen for auth changes
window.addEventListener('storage', (event) => {
  if (event.key === 'token') {
    if (event.newValue) {
      // User logged in
      sseService.connect().catch(console.error);
    } else {
      // User logged out
      sseService.disconnect();
    }
  }
});

export default sseService;
