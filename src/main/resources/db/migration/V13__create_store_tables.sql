-- Store Management System Migration
-- Creates tables for inventory management of returned/cancelled order products

-- Main store/warehouse table
CREATE TABLE stores (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store items table (inventory items)
CREATE TABLE store_items (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    fabric_id BIGINT NOT NULL,
    product_type_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    quality VARCHAR(20) NOT NULL,
    source_type VARCHAR(30) NOT NULL,
    source_order_product_id BIGINT,
    source_order_number VARCHAR(20),
    original_price DECIMAL(10, 2),
    notes TEXT,
    added_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (fabric_id) REFERENCES fabrics(id),
    FOREIGN KEY (product_type_id) REFERENCES product_types(id),
    FOREIGN KEY (source_order_product_id) REFERENCES order_products(id) ON DELETE SET NULL,
    FOREIGN KEY (added_by) REFERENCES users(id),
    CONSTRAINT check_quality CHECK (quality IN ('NEW', 'GOOD', 'FAIR', 'DAMAGED', 'WRITE_OFF')),
    CONSTRAINT check_source_type CHECK (source_type IN ('RETURNED_ORDER', 'CANCELLED_ORDER', 'MANUAL_ENTRY')),
    CONSTRAINT check_quantity_non_negative CHECK (quantity >= 0)
);

-- Store transactions table (audit trail of all inventory movements)
CREATE TABLE store_transactions (
    id BIGSERIAL PRIMARY KEY,
    store_item_id BIGINT NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    quality_before VARCHAR(20),
    quality_after VARCHAR(20),
    performed_by BIGINT NOT NULL,
    notes TEXT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_item_id) REFERENCES store_items(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(id),
    CONSTRAINT check_transaction_type CHECK (transaction_type IN ('RECEIVE', 'ADJUST', 'QUALITY_CHANGE', 'USE', 'WRITE_OFF', 'TRANSFER'))
);

-- Store adjustments table (for approval workflow)
CREATE TABLE store_adjustments (
    id BIGSERIAL PRIMARY KEY,
    store_item_id BIGINT,
    fabric_id BIGINT NOT NULL,
    product_type_id BIGINT NOT NULL,
    requested_quantity INT NOT NULL,
    current_quantity INT,
    quality VARCHAR(20) NOT NULL,
    adjustment_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reason TEXT,
    notes TEXT,
    requested_by BIGINT NOT NULL,
    approved_by BIGINT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_order_product_id BIGINT,
    source_order_number VARCHAR(255),
    original_price NUMERIC(10, 2),
    source_type VARCHAR(20),
    FOREIGN KEY (store_item_id) REFERENCES store_items(id) ON DELETE SET NULL,
    FOREIGN KEY (fabric_id) REFERENCES fabrics(id),
    FOREIGN KEY (product_type_id) REFERENCES product_types(id),
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    CONSTRAINT check_adjustment_type CHECK (adjustment_type IN ('REMOVE', 'MANUAL_ENTRY', 'AUTO_ADD')),
    CONSTRAINT check_adjustment_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

-- Store item images table (for visual documentation)
CREATE TABLE store_item_images (
    id BIGSERIAL PRIMARY KEY,
    store_item_id BIGINT NOT NULL,
    image_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_item_id) REFERENCES store_items(id) ON DELETE CASCADE,
    FOREIGN KEY (image_id) REFERENCES file_storage(id)
);

-- Create indexes for better query performance
CREATE INDEX idx_store_items_store_id ON store_items(store_id);
CREATE INDEX idx_store_items_fabric_id ON store_items(fabric_id);
CREATE INDEX idx_store_items_product_type_id ON store_items(product_type_id);
CREATE INDEX idx_store_items_sku ON store_items(sku);
CREATE INDEX idx_store_items_quality ON store_items(quality);
CREATE INDEX idx_store_items_source_type ON store_items(source_type);
CREATE INDEX idx_store_items_source_order_product ON store_items(source_order_product_id);
CREATE INDEX idx_store_transactions_store_item_id ON store_transactions(store_item_id);
CREATE INDEX idx_store_transactions_transaction_date ON store_transactions(transaction_date);
CREATE INDEX idx_store_adjustments_status ON store_adjustments(status);
CREATE INDEX idx_store_adjustments_requested_by ON store_adjustments(requested_by);
CREATE INDEX idx_store_item_images_store_item_id ON store_item_images(store_item_id);

-- Insert default main warehouse
INSERT INTO stores (name, location, description, active, created_at, updated_at) 
VALUES ('Main Warehouse', 'Primary Storage Location', 'Central storage facility for all inventory', TRUE, NOW(), NOW());
