-- Add dashboard permissions
INSERT INTO permissions (name, description) VALUES 
('DASHBOARD_ADMIN_VIEW', 'Permission to view the admin dashboard');

-- Add dashboard permissions to ADMIN role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ROLE_ADMIN' AND p.name = 'DASHBOARD_ADMIN_VIEW';
