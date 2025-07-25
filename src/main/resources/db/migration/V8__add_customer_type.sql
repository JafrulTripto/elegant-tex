-- Add customer_type column to customers table
ALTER TABLE customers ADD COLUMN customer_type VARCHAR(20);

-- Update existing customers based on their order history
-- First, set MARKETPLACE type for customers who have marketplace orders
UPDATE customers SET customer_type = 'MARKETPLACE' 
WHERE id IN (
    SELECT DISTINCT customer_id FROM orders WHERE order_type = 'MARKETPLACE'
);

-- Then, set MERCHANT type for customers who have merchant orders and don't already have a type
UPDATE customers SET customer_type = 'MERCHANT' 
WHERE id IN (
    SELECT DISTINCT customer_id FROM orders WHERE order_type = 'MERCHANT'
) AND customer_type IS NULL;

-- For customers with both types of orders, prioritize MARKETPLACE (already set above)
-- For customers with no orders (if any), set default to MARKETPLACE
UPDATE customers SET customer_type = 'MARKETPLACE' WHERE customer_type IS NULL;

-- Make the column non-nullable
ALTER TABLE customers ALTER COLUMN customer_type SET NOT NULL;

-- Add index for better query performance
CREATE INDEX idx_customers_customer_type ON customers(customer_type);
