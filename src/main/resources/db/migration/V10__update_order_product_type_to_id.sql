-- Migration to update order_products table from string-based product_type to product_type_id foreign key

-- Step 1: Add the new product_type_id column
ALTER TABLE order_products ADD COLUMN product_type_id BIGINT;

-- Step 2: Update existing records to map string product types to IDs
-- This assumes that product types with matching names exist in the product_types table
UPDATE order_products 
SET product_type_id = (
    SELECT pt.id 
    FROM product_types pt 
    WHERE pt.name = order_products.product_type 
    AND pt.active = true
    LIMIT 1
)
WHERE product_type IS NOT NULL;

-- Step 3: For any records that couldn't be mapped, create new product types
-- First, find unmapped product types
INSERT INTO product_types (name, active, created_at, updated_at)
SELECT DISTINCT op.product_type, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM order_products op
WHERE op.product_type_id IS NULL 
AND op.product_type IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM product_types pt 
    WHERE pt.name = op.product_type
);

-- Step 4: Update the remaining unmapped records
UPDATE order_products 
SET product_type_id = (
    SELECT pt.id 
    FROM product_types pt 
    WHERE pt.name = order_products.product_type
    LIMIT 1
)
WHERE product_type_id IS NULL 
AND product_type IS NOT NULL;

-- Step 5: Add foreign key constraint
ALTER TABLE order_products 
ADD CONSTRAINT fk_order_products_product_type 
FOREIGN KEY (product_type_id) REFERENCES product_types(id);

-- Step 6: Make the new column NOT NULL (after ensuring all records have values)
ALTER TABLE order_products ALTER COLUMN product_type_id SET NOT NULL;

-- Step 7: Drop the old product_type column
ALTER TABLE order_products DROP COLUMN product_type;
