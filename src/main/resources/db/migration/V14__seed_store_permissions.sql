-- Seed Store permissions and assign to roles (idempotent)

-- Insert permissions if not exist
INSERT INTO permissions (name, description)
SELECT p.name, p.description
FROM (
    VALUES 
        ('STORE_READ', 'Permission to view store items'),
        ('STORE_CREATE', 'Permission to create manual store entries'),
        ('STORE_UPDATE', 'Permission to update store items'),
        ('STORE_DELETE', 'Permission to delete store items'),
        ('STORE_APPROVE', 'Permission to approve store adjustments')
) AS p(name, description)
LEFT JOIN permissions existing ON existing.name = p.name
WHERE existing.id IS NULL;

-- Assign to ROLE_USER (minimal: read)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN ('STORE_READ')
LEFT JOIN role_permissions rp ON rp.role_id = r.id AND rp.permission_id = p.id
WHERE r.name = 'ROLE_USER' AND rp.role_id IS NULL;

-- Assign to ROLE_MODERATOR (read, create, update, approve)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN ('STORE_READ', 'STORE_CREATE', 'STORE_UPDATE', 'STORE_APPROVE')
LEFT JOIN role_permissions rp ON rp.role_id = r.id AND rp.permission_id = p.id
WHERE r.name = 'ROLE_MODERATOR' AND rp.role_id IS NULL;

-- Assign to ROLE_ADMIN (all)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN ('STORE_READ', 'STORE_CREATE', 'STORE_UPDATE', 'STORE_DELETE', 'STORE_APPROVE')
LEFT JOIN role_permissions rp ON rp.role_id = r.id AND rp.permission_id = p.id
WHERE r.name = 'ROLE_ADMIN' AND rp.role_id IS NULL;
