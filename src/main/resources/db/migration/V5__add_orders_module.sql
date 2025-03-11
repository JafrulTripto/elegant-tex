-- Create orders table
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    marketplace_id BIGINT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address VARCHAR(500) NOT NULL,
    customer_alternative_phone VARCHAR(20),
    customer_facebook_id VARCHAR(255),
    delivery_channel VARCHAR(50) NOT NULL,
    delivery_charge DECIMAL(10, 2) NOT NULL,
    delivery_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (marketplace_id) REFERENCES marketplaces(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create order_products table
CREATE TABLE order_products (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_type VARCHAR(100) NOT NULL,
    fabric_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description VARCHAR(1000),
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (fabric_id) REFERENCES fabrics(id)
);

-- Create order_product_images table
CREATE TABLE order_product_images (
    id BIGSERIAL PRIMARY KEY,
    order_product_id BIGINT NOT NULL,
    image_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_product_id) REFERENCES order_products(id) ON DELETE CASCADE
);

-- Create order_status_history table
CREATE TABLE order_status_history (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes VARCHAR(1000),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Add order permissions
INSERT INTO permissions (name, description) VALUES 
('ORDER_CREATE', 'Permission to create orders'),
('ORDER_READ', 'Permission to view orders'),
('ORDER_UPDATE', 'Permission to update orders'),
('ORDER_DELETE', 'Permission to delete orders');

-- Add order permissions to ADMIN role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ROLE_ADMIN' AND p.name IN ('ORDER_CREATE', 'ORDER_READ', 'ORDER_UPDATE', 'ORDER_DELETE');

-- Add order permissions to USER role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ROLE_USER' AND p.name IN ('ORDER_CREATE', 'ORDER_READ', 'ORDER_UPDATE');
