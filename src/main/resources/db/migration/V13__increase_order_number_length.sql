-- Migration: Increase order_number column length to prevent overflow
-- Current: VARCHAR(20)
-- New: VARCHAR(100) to accommodate format ET-{FabricCode}-{StyleCode}-{OrderID}
-- Example: ET-FAB12345678-SC123456789012345-999999999 = ~50 chars max realistic
-- 100 chars provides safe buffer for future growth

ALTER TABLE orders ALTER COLUMN order_number TYPE VARCHAR(100);
