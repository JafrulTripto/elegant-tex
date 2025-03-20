-- Create a backup of the roles table
CREATE TABLE roles_backup AS SELECT * FROM roles;

-- Update the roles table to use string-based roles
ALTER TABLE roles ALTER COLUMN name TYPE VARCHAR(50);

-- Update existing roles to use string values if they're stored as enum ordinals
UPDATE roles SET name = 'ROLE_USER' WHERE name = '0';
UPDATE roles SET name = 'ROLE_MODERATOR' WHERE name = '1';
UPDATE roles SET name = 'ROLE_ADMIN' WHERE name = '2';

-- Also handle the case where they might be stored as enum names
UPDATE roles SET name = 'ROLE_USER' WHERE name = 'ROLE_USER';
UPDATE roles SET name = 'ROLE_MODERATOR' WHERE name = 'ROLE_MODERATOR';
UPDATE roles SET name = 'ROLE_ADMIN' WHERE name = 'ROLE_ADMIN';

-- Add the new ROLE_MANAGER role
INSERT INTO roles (name, description) 
VALUES ('ROLE_MANAGER', 'Manager role with specific permissions')
ON CONFLICT (name) DO NOTHING;
