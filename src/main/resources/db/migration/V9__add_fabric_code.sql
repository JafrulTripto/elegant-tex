-- Add fabric_code column to fabrics table
ALTER TABLE fabrics ADD fabric_code VARCHAR(255);

-- Add unique constraint on fabric_code
ALTER TABLE fabrics ADD CONSTRAINT uk_fabrics_fabric_code UNIQUE (fabric_code);

-- Update existing fabrics with default fabric codes (optional - can be null)
-- This ensures existing data doesn't break, but new fabrics can have codes
UPDATE fabrics SET fabric_code = CONCAT('FAB-', LPAD(id::text, 4, '0')) WHERE fabric_code IS NULL;
