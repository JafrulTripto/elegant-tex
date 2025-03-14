-- Add order_number column to orders table
ALTER TABLE orders
ADD order_number VARCHAR(20) UNIQUE;

-- Update existing orders with a generated order number
-- This will use the format ET-ORD-#### where #### is the order ID padded to 4 digits
UPDATE orders 
SET order_number = CONCAT('ET-ORD-', LPAD(CAST(id AS VARCHAR), 4, '0'));

-- Make the column not nullable for future inserts
ALTER TABLE orders
ADD CONSTRAINT order_number_not_null CHECK (order_number IS NOT NULL);
