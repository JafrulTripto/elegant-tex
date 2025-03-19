-- Create product_types table
CREATE TABLE product_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO product_types (name, active, created_at, updated_at) VALUES 
('Sofa Cover', TRUE, NOW(), NOW()),
('Chair Cover', TRUE, NOW(), NOW()),
('Table Cover', TRUE, NOW(), NOW()),
('Washing Machine Cover', TRUE, NOW(), NOW()),
('AC Cover', TRUE, NOW(), NOW()),
('Oven Cover', TRUE, NOW(), NOW()),
('Swing Cover', TRUE, NOW(), NOW()),
('Pillow Cover', TRUE, NOW(), NOW()),
('Bed Cover', TRUE, NOW(), NOW()),
('TV Cover', TRUE, NOW(), NOW()),
('Divan Cover', TRUE, NOW(), NOW()),
('Foam Cover', TRUE, NOW(), NOW()),
('Tull Cover', TRUE, NOW(), NOW()),
('Fan Cover', TRUE, NOW(), NOW()),
('Measurement & Sample', TRUE, NOW(), NOW()),
('Others', TRUE, NOW(), NOW()),
('Mattress Cover', TRUE, NOW(), NOW()),
('3D Printed Table & 6 Chair', TRUE, NOW(), NOW()),
('3D Printed Bed Cover Set', TRUE, NOW(), NOW());
