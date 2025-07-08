-- V4__add_messaging_tables.sql
-- Migration to add messaging functionality for Facebook Messenger and WhatsApp Business

-- Create messaging_accounts table
CREATE TABLE messaging_accounts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('FACEBOOK', 'WHATSAPP')),
    account_name VARCHAR(100) NOT NULL,
    page_id VARCHAR(100),
    phone_number_id VARCHAR(100),
    business_account_id VARCHAR(100),
    access_token TEXT NOT NULL,
    webhook_verify_token VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_platform_account UNIQUE (platform, page_id, phone_number_id)
);

-- Create conversations table
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    messaging_account_id BIGINT NOT NULL REFERENCES messaging_accounts(id) ON DELETE CASCADE,
    customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    platform_customer_id VARCHAR(100) NOT NULL,
    conversation_name VARCHAR(255),
    last_message_at TIMESTAMP,
    unread_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_account_customer UNIQUE (messaging_account_id, platform_customer_id)
);

-- Create messages table
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    messaging_account_id BIGINT NOT NULL REFERENCES messaging_accounts(id) ON DELETE CASCADE,
    customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    platform_message_id VARCHAR(255),
    sender_id VARCHAR(100) NOT NULL,
    recipient_id VARCHAR(100) NOT NULL,
    message_type VARCHAR(50) NOT NULL DEFAULT 'TEXT',
    content TEXT,
    is_inbound BOOLEAN NOT NULL,
    status VARCHAR(20) DEFAULT 'SENT' CHECK (status IN ('SENT', 'DELIVERED', 'READ', 'FAILED')),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create message_attachments table
CREATE TABLE message_attachments (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    attachment_type VARCHAR(20) NOT NULL CHECK (attachment_type IN ('IMAGE', 'DOCUMENT', 'AUDIO', 'VIDEO')),
    file_url TEXT,
    file_path TEXT,
    file_size BIGINT,
    mime_type VARCHAR(100),
    original_filename VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create message_notifications table for real-time notifications
CREATE TABLE message_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create webhook_events table for debugging and audit trail
CREATE TABLE webhook_events (
    id BIGSERIAL PRIMARY KEY,
    messaging_account_id BIGINT REFERENCES messaging_accounts(id) ON DELETE SET NULL,
    platform VARCHAR(20) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    payload TEXT NOT NULL,
    processed BOOLEAN DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_messaging_accounts_user_id ON messaging_accounts(user_id);
CREATE INDEX idx_messaging_accounts_platform ON messaging_accounts(platform);
CREATE INDEX idx_messaging_accounts_active ON messaging_accounts(is_active);

CREATE INDEX idx_conversations_account_id ON conversations(messaging_account_id);
CREATE INDEX idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX idx_conversations_active ON conversations(is_active);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_account_id ON messages(messaging_account_id);
CREATE INDEX idx_messages_customer_id ON messages(customer_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX idx_messages_inbound ON messages(is_inbound);
CREATE INDEX idx_messages_platform_id ON messages(platform_message_id);

CREATE INDEX idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX idx_message_attachments_type ON message_attachments(attachment_type);

CREATE INDEX idx_message_notifications_user_id ON message_notifications(user_id);
CREATE INDEX idx_message_notifications_read ON message_notifications(is_read);
CREATE INDEX idx_message_notifications_created ON message_notifications(created_at DESC);

CREATE INDEX idx_webhook_events_account_id ON webhook_events(messaging_account_id);
CREATE INDEX idx_webhook_events_platform ON webhook_events(platform);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX idx_webhook_events_created ON webhook_events(created_at DESC);

-- Note: updated_at timestamps will be handled by JPA @PreUpdate in entity classes
