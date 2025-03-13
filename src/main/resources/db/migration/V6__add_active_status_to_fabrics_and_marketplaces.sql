-- Add active column to fabrics table
ALTER TABLE fabrics
ADD active BOOLEAN NOT NULL DEFAULT TRUE;

-- Add active column to marketplaces table
ALTER TABLE marketplaces
ADD active BOOLEAN NOT NULL DEFAULT TRUE;
