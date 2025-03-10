-- Create tags table
CREATE TABLE tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create fabrics table
CREATE TABLE fabrics (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    image_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (image_id) REFERENCES file_storage(id)
);

-- Create fabric_tags join table for many-to-many relationship
CREATE TABLE fabric_tags (
    fabric_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (fabric_id, tag_id),
    FOREIGN KEY (fabric_id) REFERENCES fabrics(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

