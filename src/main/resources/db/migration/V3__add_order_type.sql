-- Migration to add order_type column to orders table and make marketplace_id nullable

-- Add order_type column with default value of 'MARKETPLACE'
ALTER TABLE orders ADD COLUMN order_type VARCHAR(50) NOT NULL DEFAULT 'MARKETPLACE';

-- Make marketplace_id nullable
ALTER TABLE orders ALTER COLUMN marketplace_id DROP NOT NULL;

-- Add a check constraint to ensure marketplace_id is not null when order_type is 'MARKETPLACE'
ALTER TABLE orders ADD CONSTRAINT check_marketplace_id_for_marketplace_orders 
CHECK (
    (order_type = 'MARKETPLACE' AND marketplace_id IS NOT NULL) OR 
    (order_type = 'MERCHANT')
);

-- Update existing orders to have order_type = 'MARKETPLACE'
UPDATE orders SET order_type = 'MARKETPLACE';

-- Add an index on order_type for faster filtering
CREATE INDEX idx_orders_order_type ON orders(order_type);
