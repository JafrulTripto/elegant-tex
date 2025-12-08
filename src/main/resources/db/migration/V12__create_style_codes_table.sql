-- Migration: Create style_codes table
CREATE TABLE IF NOT EXISTS style_codes (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_style_codes_code ON style_codes(code);

-- Create index on active status for faster filtering
CREATE INDEX IF NOT EXISTS idx_style_codes_active ON style_codes(active);
