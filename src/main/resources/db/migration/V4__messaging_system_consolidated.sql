-- V4__messaging_system_consolidated.sql
-- Consolidated migration for messaging functionality (Facebook Messenger and WhatsApp Business)
-- This replaces the previous V4 and V5 migrations with a clean, optimized schema

-- Create messaging_customers table (dedicated customer entity for messaging platforms)
CREATE TABLE messaging_customers (
    id BIGSERIAL PRIMARY KEY,
    platform_customer_id VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('FACEBOOK', 'WHATSAPP')),
    display_name VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_picture_url TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    profile_fetched BOOLEAN DEFAULT FALSE,
    profile_fetch_attempted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_platform_customer UNIQUE (platform_customer_id, platform)
);

-- Create messaging_accounts table (platform account configurations)
CREATE TABLE messaging_accounts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Create conversations table (messaging conversations)
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    messaging_account_id BIGINT NOT NULL REFERENCES messaging_accounts(id) ON DELETE CASCADE,
    messaging_customer_id BIGINT NOT NULL REFERENCES messaging_customers(id) ON DELETE CASCADE,
    conversation_name VARCHAR(255),
    last_message_at TIMESTAMP,
    unread_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_account_customer UNIQUE (messaging_account_id, messaging_customer_id)
);

-- Create messages table (individual messages)
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    messaging_account_id BIGINT NOT NULL REFERENCES messaging_accounts(id) ON DELETE CASCADE,
    messaging_customer_id BIGINT NOT NULL REFERENCES messaging_customers(id) ON DELETE CASCADE,
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

-- Create webhook_events table (for debugging and audit trail)
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

-- Create essential indexes for optimal performance
-- Messaging customers indexes
CREATE INDEX idx_messaging_customers_platform ON messaging_customers(platform);
CREATE INDEX idx_messaging_customers_profile_fetched ON messaging_customers(profile_fetched);

-- Messaging accounts indexes
CREATE INDEX idx_messaging_accounts_user_id ON messaging_accounts(user_id);
CREATE INDEX idx_messaging_accounts_platform ON messaging_accounts(platform);
CREATE INDEX idx_messaging_accounts_active ON messaging_accounts(is_active);

-- Conversations indexes
CREATE INDEX idx_conversations_account_id ON conversations(messaging_account_id);
CREATE INDEX idx_conversations_customer_id ON conversations(messaging_customer_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX idx_conversations_active ON conversations(is_active);

-- Messages indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_account_id ON messages(messaging_account_id);
CREATE INDEX idx_messages_customer_id ON messages(messaging_customer_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX idx_messages_inbound ON messages(is_inbound);
CREATE INDEX idx_messages_platform_id ON messages(platform_message_id);

-- Webhook events indexes
CREATE INDEX idx_webhook_events_account_id ON webhook_events(messaging_account_id);
CREATE INDEX idx_webhook_events_platform ON webhook_events(platform);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX idx_webhook_events_created ON webhook_events(created_at DESC);

-- Note: updated_at timestamps are handled by JPA @PreUpdate in entity classes
