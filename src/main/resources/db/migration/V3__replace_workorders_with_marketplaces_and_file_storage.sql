-- Drop work_orders table
DROP TABLE IF EXISTS work_orders;

-- Create file_storage table
CREATE TABLE file_storage (
    id BIGSERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size BIGINT,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add profile_image_id to users table
ALTER TABLE users ADD profile_image_id BIGINT;

-- Create marketplaces table
CREATE TABLE marketplaces (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    page_url VARCHAR(255) NOT NULL,
    image_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (image_id) REFERENCES file_storage(id)
);

-- Create marketplace_members join table
CREATE TABLE marketplace_members (
    marketplace_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (marketplace_id, user_id),
    FOREIGN KEY (marketplace_id) REFERENCES marketplaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_marketplace_name ON marketplaces(name);
CREATE INDEX idx_marketplace_members ON marketplace_members(user_id);
CREATE INDEX idx_file_storage_entity ON file_storage(entity_type, entity_id);
