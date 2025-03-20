-- Add comprehensive permissions for all entities

-- Marketplace permissions
INSERT INTO permissions (name, description) VALUES 
('MARKETPLACE_CREATE', 'Permission to create marketplaces'),
('MARKETPLACE_READ', 'Permission to view marketplaces'),
('MARKETPLACE_UPDATE', 'Permission to update marketplaces'),
('MARKETPLACE_DELETE', 'Permission to delete marketplaces');

-- Fabric permissions
INSERT INTO permissions (name, description) VALUES 
('FABRIC_CREATE', 'Permission to create fabrics'),
('FABRIC_READ', 'Permission to view fabrics'),
('FABRIC_UPDATE', 'Permission to update fabrics'),
('FABRIC_DELETE', 'Permission to delete fabrics');

-- Customer permissions
INSERT INTO permissions (name, description) VALUES 
('CUSTOMER_CREATE', 'Permission to create customers'),
('CUSTOMER_READ', 'Permission to view customers'),
('CUSTOMER_UPDATE', 'Permission to update customers'),
('CUSTOMER_DELETE', 'Permission to delete customers');

-- Product Type permissions
INSERT INTO permissions (name, description) VALUES 
('PRODUCT_TYPE_CREATE', 'Permission to create product types'),
('PRODUCT_TYPE_READ', 'Permission to view product types'),
('PRODUCT_TYPE_UPDATE', 'Permission to update product types'),
('PRODUCT_TYPE_DELETE', 'Permission to delete product types');

-- File Storage permissions
INSERT INTO permissions (name, description) VALUES 
('FILE_UPLOAD', 'Permission to upload files'),
('FILE_READ', 'Permission to view files'),
('FILE_DELETE', 'Permission to delete files');

-- Tag permissions
INSERT INTO permissions (name, description) VALUES 
('TAG_CREATE', 'Permission to create tags'),
('TAG_READ', 'Permission to view tags'),
('TAG_UPDATE', 'Permission to update tags'),
('TAG_DELETE', 'Permission to delete tags');

-- Role Management permissions
INSERT INTO permissions (name, description) VALUES 
('ROLE_CREATE', 'Permission to create roles'),
('ROLE_READ', 'Permission to view roles'),
('ROLE_UPDATE', 'Permission to update roles'),
('ROLE_DELETE', 'Permission to delete roles');

-- Dashboard permissions
INSERT INTO permissions (name, description) VALUES 
('DASHBOARD_USER_VIEW', 'Permission to view the user dashboard');

-- Add permissions to ADMIN role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ROLE_ADMIN' AND p.name IN (
    'MARKETPLACE_CREATE', 'MARKETPLACE_READ', 'MARKETPLACE_UPDATE', 'MARKETPLACE_DELETE',
    'FABRIC_CREATE', 'FABRIC_READ', 'FABRIC_UPDATE', 'FABRIC_DELETE',
    'CUSTOMER_CREATE', 'CUSTOMER_READ', 'CUSTOMER_UPDATE', 'CUSTOMER_DELETE',
    'PRODUCT_TYPE_CREATE', 'PRODUCT_TYPE_READ', 'PRODUCT_TYPE_UPDATE', 'PRODUCT_TYPE_DELETE',
    'FILE_UPLOAD', 'FILE_READ', 'FILE_DELETE',
    'TAG_CREATE', 'TAG_READ', 'TAG_UPDATE', 'TAG_DELETE',
    'ROLE_CREATE', 'ROLE_READ', 'ROLE_UPDATE', 'ROLE_DELETE',
    'DASHBOARD_USER_VIEW'
);

-- Add permissions to MODERATOR role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ROLE_MODERATOR' AND p.name IN (
    'MARKETPLACE_READ', 'MARKETPLACE_UPDATE',
    'FABRIC_READ', 'FABRIC_UPDATE',
    'CUSTOMER_READ', 'CUSTOMER_UPDATE',
    'PRODUCT_TYPE_READ',
    'FILE_UPLOAD', 'FILE_READ',
    'TAG_READ',
    'ROLE_READ',
    'DASHBOARD_USER_VIEW'
);

-- Add permissions to USER role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ROLE_USER' AND p.name IN (
    'MARKETPLACE_READ',
    'FABRIC_READ',
    'CUSTOMER_CREATE', 'CUSTOMER_READ', 'CUSTOMER_UPDATE',
    'PRODUCT_TYPE_READ',
    'FILE_UPLOAD', 'FILE_READ',
    'TAG_READ',
    'DASHBOARD_USER_VIEW'
);
