-- Data seeding migration file
-- This file contains all data insertion operations

-- Insert default roles
INSERT INTO roles (name, description) VALUES 
    ('ROLE_USER', 'Standard user role'),
    ('ROLE_MODERATOR', 'Moderator role with elevated permissions'),
    ('ROLE_ADMIN', 'Administrator role with full access'),
    ('ROLE_MANAGER', 'Manager role with specific permissions');

-- Insert all permissions
INSERT INTO permissions (name, description) VALUES 
    -- User permissions
    ('USER_READ', 'Can read user data'),
    ('USER_WRITE', 'Can create and update user data'),
    ('USER_DELETE', 'Can delete user data'),
    ('ROLE_MANAGE', 'Can manage user roles'),
    ('USER_VERIFY', 'Can verify user accounts'),
    
    -- Order permissions
    ('ORDER_CREATE', 'Permission to create orders'),
    ('ORDER_READ', 'Permission to view orders'),
    ('ORDER_UPDATE', 'Permission to update orders'),
    ('ORDER_DELETE', 'Permission to delete orders'),
    ('ORDER_READ_ALL', 'Permission to view all orders regardless of creator'),
    
    -- Dashboard permissions
    ('DASHBOARD_ADMIN_VIEW', 'Permission to view the admin dashboard'),
    ('DASHBOARD_USER_VIEW', 'Permission to view the user dashboard'),
    
    -- Marketplace permissions
    ('MARKETPLACE_CREATE', 'Permission to create marketplaces'),
    ('MARKETPLACE_READ', 'Permission to view marketplaces'),
    ('MARKETPLACE_UPDATE', 'Permission to update marketplaces'),
    ('MARKETPLACE_DELETE', 'Permission to delete marketplaces'),
    
    -- Fabric permissions
    ('FABRIC_CREATE', 'Permission to create fabrics'),
    ('FABRIC_READ', 'Permission to view fabrics'),
    ('FABRIC_UPDATE', 'Permission to update fabrics'),
    ('FABRIC_DELETE', 'Permission to delete fabrics'),
    
    -- Customer permissions
    ('CUSTOMER_CREATE', 'Permission to create customers'),
    ('CUSTOMER_READ', 'Permission to view customers'),
    ('CUSTOMER_UPDATE', 'Permission to update customers'),
    ('CUSTOMER_DELETE', 'Permission to delete customers'),
    
    -- Product Type permissions
    ('PRODUCT_TYPE_CREATE', 'Permission to create product types'),
    ('PRODUCT_TYPE_READ', 'Permission to view product types'),
    ('PRODUCT_TYPE_UPDATE', 'Permission to update product types'),
    ('PRODUCT_TYPE_DELETE', 'Permission to delete product types'),
    
    -- File Storage permissions
    ('FILE_UPLOAD', 'Permission to upload files'),
    ('FILE_READ', 'Permission to view files'),
    ('FILE_DELETE', 'Permission to delete files'),
    
    -- Tag permissions
    ('TAG_CREATE', 'Permission to create tags'),
    ('TAG_READ', 'Permission to view tags'),
    ('TAG_UPDATE', 'Permission to update tags'),
    ('TAG_DELETE', 'Permission to delete tags'),
    
    -- Role Management permissions
    ('ROLE_CREATE', 'Permission to create roles'),
    ('ROLE_READ', 'Permission to view roles'),
    ('ROLE_UPDATE', 'Permission to update roles'),
    ('ROLE_DELETE', 'Permission to delete roles');

-- Assign permissions to roles
-- User role permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ROLE_USER' AND p.name IN (
    'USER_READ',
    'ORDER_CREATE', 'ORDER_READ', 'ORDER_UPDATE',
    'MARKETPLACE_READ',
    'FABRIC_READ',
    'PRODUCT_TYPE_READ',
    'FILE_UPLOAD', 'FILE_READ',
    'TAG_READ',
    'DASHBOARD_USER_VIEW'
);

-- Moderator role permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ROLE_MODERATOR' AND p.name IN (
    'USER_READ', 'USER_WRITE', 'USER_VERIFY',
    'ORDER_CREATE', 'ORDER_READ', 'ORDER_UPDATE', 'ORDER_READ_ALL',
    'MARKETPLACE_READ', 'MARKETPLACE_UPDATE',
    'FABRIC_READ', 'FABRIC_UPDATE',
    'CUSTOMER_READ', 'CUSTOMER_UPDATE',
    'PRODUCT_TYPE_READ',
    'FILE_UPLOAD', 'FILE_READ',
    'TAG_READ',
    'ROLE_READ',
    'DASHBOARD_USER_VIEW'
);

-- Admin role permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ROLE_ADMIN' AND p.name IN (
    'USER_READ', 'USER_WRITE', 'USER_DELETE', 'ROLE_MANAGE', 'USER_VERIFY',
    'ORDER_CREATE', 'ORDER_READ', 'ORDER_UPDATE', 'ORDER_DELETE', 'ORDER_READ_ALL',
    'DASHBOARD_ADMIN_VIEW', 'DASHBOARD_USER_VIEW',
    'MARKETPLACE_CREATE', 'MARKETPLACE_READ', 'MARKETPLACE_UPDATE', 'MARKETPLACE_DELETE',
    'FABRIC_CREATE', 'FABRIC_READ', 'FABRIC_UPDATE', 'FABRIC_DELETE',
    'CUSTOMER_CREATE', 'CUSTOMER_READ', 'CUSTOMER_UPDATE', 'CUSTOMER_DELETE',
    'PRODUCT_TYPE_CREATE', 'PRODUCT_TYPE_READ', 'PRODUCT_TYPE_UPDATE', 'PRODUCT_TYPE_DELETE',
    'FILE_UPLOAD', 'FILE_READ', 'FILE_DELETE',
    'TAG_CREATE', 'TAG_READ', 'TAG_UPDATE', 'TAG_DELETE',
    'ROLE_CREATE', 'ROLE_READ', 'ROLE_UPDATE', 'ROLE_DELETE'
);

-- Insert default admin user
-- Using a conditional insert to avoid duplicates
INSERT INTO users (first_name, last_name, email, phone, password, email_verified, account_verified)
SELECT 'Jafrul', 'Hossain', 'jafrultripto@gmail.com', '+8801832958858', 
       '$2y$10$YOWchtXnKdBOFLynBRFrsu4nlEa0pCyJDfJMa60VEnzo.GWxxl6Fu', 
       TRUE, TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'jafrultripto@gmail.com'
);

-- Assign admin role to the default admin user
INSERT INTO user_roles (user_id, role_id)
VALUES (
    (SELECT id FROM users WHERE email = 'jafrultripto@gmail.com'),
    (SELECT id FROM roles WHERE name = 'ROLE_ADMIN')
);

-- Insert default product types
INSERT INTO product_types (name, active, created_at, updated_at) VALUES 
('Sofa Cover', TRUE, NOW(), NOW()),
('Chair Cover', TRUE, NOW(), NOW()),
('Table Cover', TRUE, NOW(), NOW()),
('Washing Machine Cover', TRUE, NOW(), NOW()),
('AC Cover', TRUE, NOW(), NOW()),
('Oven Cover', TRUE, NOW(), NOW()),
('Swing Cover', TRUE, NOW(), NOW()),
('Pillow Cover', TRUE, NOW(), NOW()),
('Bed Cover', TRUE, NOW(), NOW()),
('TV Cover', TRUE, NOW(), NOW()),
('Divan Cover', TRUE, NOW(), NOW()),
('Foam Cover', TRUE, NOW(), NOW()),
('Tull Cover', TRUE, NOW(), NOW()),
('Fan Cover', TRUE, NOW(), NOW()),
('Measurement & Sample', TRUE, NOW(), NOW()),
('Others', TRUE, NOW(), NOW()),
('Mattress Cover', TRUE, NOW(), NOW()),
('3D Printed Table & 6 Chair', TRUE, NOW(), NOW()),
('3D Printed Bed Cover Set', TRUE, NOW(), NOW());
