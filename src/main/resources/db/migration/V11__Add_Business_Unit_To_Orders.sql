-- Add business_unit column to orders table
-- This migration adds the business_unit field to support separating orders by business units (MIRPUR, TONGI)
-- Existing orders will be assigned to TONGI by default as requested

-- Add the business_unit column with default value and NOT NULL constraint
ALTER TABLE orders ADD COLUMN business_unit VARCHAR(10) NOT NULL DEFAULT 'TONGI';

-- Add a check constraint to ensure only valid business unit values
ALTER TABLE orders ADD CONSTRAINT chk_business_unit CHECK (business_unit IN ('MIRPUR', 'TONGI'));

-- Update existing orders to have business_unit = 'TONGI'
UPDATE orders SET business_unit = 'TONGI';

-- Create an index on business_unit for better query performance
CREATE INDEX idx_orders_business_unit ON orders(business_unit);

-- Create a composite index for common filtering scenarios
CREATE INDEX idx_orders_business_unit_status ON orders(business_unit, status);
CREATE INDEX idx_orders_business_unit_order_type ON orders(business_unit, order_type);
CREATE INDEX idx_orders_business_unit_created_at ON orders(business_unit, created_at);
