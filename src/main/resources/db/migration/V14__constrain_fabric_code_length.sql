-- Migration: Reduce fabric_code length to reasonable maximum
-- Current: VARCHAR(255) - unnecessarily large for fabric codes
-- New: VARCHAR(50) - accommodates realistic fabric codes while preventing overflow
-- Note: This should only be run if no existing fabric codes exceed 50 characters

-- Check if any existing codes would be truncated (uncomment to verify):
-- SELECT id, fabric_code, LENGTH(fabric_code) as len 
-- FROM fabrics 
-- WHERE LENGTH(fabric_code) > 50;

-- If safe, apply the change:
ALTER TABLE fabrics ALTER COLUMN fabric_code TYPE VARCHAR(50);
