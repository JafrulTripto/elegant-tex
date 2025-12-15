-- Add style_code to store_items to support displaying style codes in Store
ALTER TABLE store_items ADD COLUMN IF NOT EXISTS style_code VARCHAR(50);
