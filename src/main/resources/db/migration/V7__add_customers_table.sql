-- Create customers table
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(500) NOT NULL,
    alternative_phone VARCHAR(20),
    facebook_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (phone)
);

-- Insert existing customer data from orders table
INSERT INTO customers (name, phone, address, alternative_phone, facebook_id)
SELECT DISTINCT customer_name, customer_phone, customer_address, customer_alternative_phone, customer_facebook_id
FROM orders;

-- Add customer_id column to orders table
ALTER TABLE orders
ADD customer_id BIGINT;

-- Update orders table to reference customers table
UPDATE orders
SET customer_id = c.id
FROM customers c
WHERE orders.customer_phone = c.phone;

-- Make customer_id column NOT NULL
ALTER TABLE orders
ADD CONSTRAINT customer_id_not_null CHECK (customer_id IS NOT NULL);

-- Add foreign key constraint
ALTER TABLE orders
ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers (id);

-- Drop old customer columns from orders table
ALTER TABLE orders DROP COLUMN customer_name;
ALTER TABLE orders DROP COLUMN customer_phone;
ALTER TABLE orders DROP COLUMN customer_address;
ALTER TABLE orders DROP COLUMN customer_alternative_phone;
ALTER TABLE orders DROP COLUMN customer_facebook_id;

-- No need for separate customer permissions, using existing ORDER permissions
