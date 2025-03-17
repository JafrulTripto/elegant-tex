-- Create product_types table
CREATE TABLE product_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default product types
INSERT INTO product_types (name, active) VALUES
('Shirt', TRUE),
('Pants', TRUE),
('Dress', TRUE),
('Skirt', TRUE),
('Blouse', TRUE),
('Jacket', TRUE),
('Coat', TRUE),
('Sweater', TRUE),
('T-shirt', TRUE),
('Jeans', TRUE),
('Suit', TRUE),
('Uniform', TRUE),
('Other', TRUE);
