import api from './api';
import {
  MessagingAccountDTO,
  MessagingAccountRequestDTO,
  ConversationDTO,
  MessageDTO,
  SendMessageRequest,
  ConversationFilters,
  MessageFilters
} from '../types/messaging';

class MessagingService {
  private readonly baseUrl = '/messaging';

  // Messaging Account endpoints
  async getUserAccounts(): Promise<MessagingAccountDTO[]> {
    const response = await api.get(`${this.baseUrl}/accounts`);
    return response.data;
  }

  async getAccount(id: number): Promise<MessagingAccountDTO> {
    const response = await api.get(`${this.baseUrl}/accounts/${id}`);
    return response.data;
  }

  async createAccount(account: MessagingAccountRequestDTO): Promise<MessagingAccountDTO> {
    const response = await api.post(`${this.baseUrl}/accounts`, account);
    return response.data;
  }

  async updateAccount(id: number, account: Partial<MessagingAccountRequestDTO>): Promise<MessagingAccountDTO> {
    const response = await api.put(`${this.baseUrl}/accounts/${id}`, account);
    return response.data;
  }

  async deleteAccount(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/accounts/${id}`);
  }

  async toggleAccountStatus(id: number): Promise<MessagingAccountDTO> {
    const response = await api.patch(`${this.baseUrl}/accounts/${id}/toggle-status`);
    return response.data;
  }

  // Conversation endpoints
  async getAccountConversations(accountId: number, filters?: ConversationFilters): Promise<ConversationDTO[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.unreadOnly) params.append('unreadOnly', filters.unreadOnly.toString());
    if (filters?.platform) params.append('platform', filters.platform);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    const queryString = params.toString();
    const url = `${this.baseUrl}/accounts/${accountId}/conversations${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  }

  async getConversation(id: number): Promise<ConversationDTO> {
    const response = await api.get(`${this.baseUrl}/conversations/${id}`);
    return response.data;
  }

  async updateConversation(id: number, updates: Partial<ConversationDTO>): Promise<ConversationDTO> {
    const response = await api.put(`${this.baseUrl}/conversations/${id}`, updates);
    return response.data;
  }

  async markConversationAsRead(id: number): Promise<void> {
    await api.patch(`${this.baseUrl}/conversations/${id}/mark-read`);
  }

  async archiveConversation(id: number): Promise<void> {
    await api.patch(`${this.baseUrl}/conversations/${id}/archive`);
  }

  // Message endpoints
  async getConversationMessages(filters: MessageFilters): Promise<{
    content: MessageDTO[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const params = new URLSearchParams();
    params.append('conversationId', filters.conversationId.toString());
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.messageType) params.append('messageType', filters.messageType);
    if (filters.isInbound !== undefined) params.append('isInbound', filters.isInbound.toString());
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    const response = await api.get(`${this.baseUrl}/messages?${params.toString()}`);
    return response.data;
  }

  async sendMessage(request: SendMessageRequest): Promise<MessageDTO> {
    const response = await api.post(`${this.baseUrl}/messages/send`, request);
    return response.data;
  }

  async getMessage(id: number): Promise<MessageDTO> {
    const response = await api.get(`${this.baseUrl}/messages/${id}`);
    return response.data;
  }

  async markMessageAsRead(id: number): Promise<void> {
    await api.patch(`${this.baseUrl}/messages/${id}/mark-read`);
  }

  async deleteMessage(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/messages/${id}`);
  }

  // Statistics endpoints
  async getAccountStats(accountId: number): Promise<{
    totalConversations: number;
    unreadConversations: number;
    totalMessages: number;
    unreadMessages: number;
    responseTime: number;
  }> {
    const response = await api.get(`${this.baseUrl}/accounts/${accountId}/stats`);
    return response.data;
  }

  async getOverallStats(): Promise<{
    totalAccounts: number;
    activeAccounts: number;
    totalConversations: number;
    unreadMessages: number;
    platformBreakdown: { [platform: string]: number };
  }> {
    const response = await api.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  // Webhook validation
  async validateFacebookToken(pageId: string, accessToken: string): Promise<boolean> {
    try {
      const response = await api.post(`${this.baseUrl}/validate/facebook`, {
        pageId,
        accessToken
      });
      return response.data.valid;
    } catch (error) {
      return false;
    }
  }

  async validateWhatsAppToken(phoneNumberId: string, accessToken: string): Promise<boolean> {
    try {
      const response = await api.post(`${this.baseUrl}/validate/whatsapp`, {
        phoneNumberId,
        accessToken
      });
      return response.data.valid;
    } catch (error) {
      return false;
    }
  }

  // Note: Real-time updates are handled by SSE service (sse.service.ts)
  // This method is kept for backward compatibility but delegates to SSE
  async subscribeToUpdates(accountId: number, _callback: (message: MessageDTO) => void): Promise<() => void> {
    // Real-time updates are now handled by the SSE service
    // This method is deprecated in favor of useMessagingSSE hook
    console.warn('subscribeToUpdates is deprecated. Use useMessagingSSE hook for real-time updates.');
    
    // Return a no-op unsubscribe function
    return () => {
      console.log(`Unsubscribed from updates for account ${accountId}`);
    };
  }
}

export const messagingService = new MessagingService();
