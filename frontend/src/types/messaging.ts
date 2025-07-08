export interface MessagingAccountDTO {
  id: number;
  accountName: string;
  platform: 'FACEBOOK' | 'WHATSAPP';
  pageId?: string;
  phoneNumberId?: string;
  businessAccountId?: string;
  isActive: boolean;
  webhookVerifyToken: string;
  unreadMessageCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessagingAccountRequestDTO {
  accountName: string;
  platform: 'FACEBOOK' | 'WHATSAPP';
  pageId?: string;
  phoneNumberId?: string;
  businessAccountId?: string;
  accessToken: string;
  webhookVerifyToken: string;
}

export interface ConversationDTO {
  id: number;
  messagingAccountId: number;
  customerId: number;
  platformCustomerId: string;
  conversationName: string;
  lastMessageAt?: string;
  unreadCount: number;
  isActive: boolean;
  customer: CustomerInfo;
  lastMessage?: MessageDTO;
}

export interface MessageDTO {
  id: number;
  conversationId: number;
  messagingAccountId: number;
  customerId: number;
  platformMessageId: string;
  senderId: string;
  recipientId: string;
  messageType: MessageType;
  content: string;
  isInbound: boolean;
  status: MessageStatus;
  timestamp: string;
  attachments?: MessageAttachmentDTO[];
}

export interface MessageAttachmentDTO {
  id: number;
  messageId: number;
  attachmentType: AttachmentType;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
}

export interface CustomerInfo {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  facebookId?: string;
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  LOCATION = 'LOCATION',
  CONTACT = 'CONTACT',
  STICKER = 'STICKER',
  OTHER = 'OTHER'
}

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED'
}

export enum AttachmentType {
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO'
}

export interface SendMessageRequest {
  conversationId: number;
  content: string;
  messageType?: MessageType;
}

export interface ConversationFilters {
  search?: string;
  unreadOnly?: boolean;
  platform?: 'FACEBOOK' | 'WHATSAPP';
  dateFrom?: string;
  dateTo?: string;
}

export interface MessageFilters {
  conversationId: number;
  page?: number;
  size?: number;
  messageType?: MessageType;
  isInbound?: boolean;
  dateFrom?: string;
  dateTo?: string;
}
