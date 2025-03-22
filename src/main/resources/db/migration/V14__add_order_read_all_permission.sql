-- Add ORDER_READ_ALL permission
INSERT INTO permissions (name, description) VALUES 
('ORDER_READ_ALL', 'Permission to view all orders regardless of creator');

-- Add ORDER_READ_ALL permission to ADMIN role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ROLE_ADMIN' AND p.name = 'ORDER_READ_ALL';

-- Add ORDER_READ_ALL permission to MODERATOR role if it exists
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ROLE_MODERATOR' AND p.name = 'ORDER_READ_ALL';
