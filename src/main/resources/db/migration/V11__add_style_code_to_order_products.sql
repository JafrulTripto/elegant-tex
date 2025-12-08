-- Migration: Add style_code column to order_products
ALTER TABLE order_products ADD COLUMN IF NOT EXISTS style_code VARCHAR(64);

-- (Optional) Future backfill logic could go here, e.g. UPDATE statements
-- UPDATE order_products SET style_code = 'UNKNOWN' WHERE style_code IS NULL;