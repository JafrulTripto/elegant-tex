CREATE TABLE work_orders (
    id BIGSERIAL PRIMARY KEY,  -- Replace AUTO_INCREMENT with BIGSERIAL
    wo_number VARCHAR(50) NOT NULL,
    work_type VARCHAR(100) NOT NULL,
    client VARCHAR(100) NOT NULL,
    photo_count INT,
    state VARCHAR(10),
    client_due_date DATE NOT NULL,
    updater VARCHAR(100),
    order_status VARCHAR(50) NOT NULL,
    remark_category VARCHAR(255),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    number_of_bids INT,
    bid_amount DECIMAL(10, 2),
    is_rush BOOLEAN DEFAULT FALSE,
    user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_work_orders_status ON work_orders(order_status);
CREATE INDEX idx_work_orders_client ON work_orders(client);
CREATE INDEX idx_work_orders_due_date ON work_orders(client_due_date);
CREATE INDEX idx_work_orders_user ON work_orders(user_id);
