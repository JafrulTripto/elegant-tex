-- Create tables

-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(120) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    account_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL,
    description VARCHAR(255)
);

-- Permissions table
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

-- User roles (many-to-many)
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Role permissions (many-to-many)
CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Verification tokens
CREATE TABLE verification_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    token_type VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES 
    ('ROLE_USER', 'Standard user role'),
    ('ROLE_MODERATOR', 'Moderator role with elevated permissions'),
    ('ROLE_ADMIN', 'Administrator role with full access');

-- Insert default permissions
INSERT INTO permissions (name, description) VALUES 
    ('READ_USER', 'Can read user data'),
    ('WRITE_USER', 'Can create and update user data'),
    ('DELETE_USER', 'Can delete user data'),
    ('MANAGE_ROLES', 'Can manage user roles'),
    ('VERIFY_USERS', 'Can verify user accounts');

-- Assign permissions to roles
-- User role permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES 
    ((SELECT id FROM roles WHERE name = 'ROLE_USER'), 
     (SELECT id FROM permissions WHERE name = 'READ_USER'));

-- Moderator role permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES 
    ((SELECT id FROM roles WHERE name = 'ROLE_MODERATOR'), 
     (SELECT id FROM permissions WHERE name = 'READ_USER')),
    ((SELECT id FROM roles WHERE name = 'ROLE_MODERATOR'), 
     (SELECT id FROM permissions WHERE name = 'WRITE_USER')),
    ((SELECT id FROM roles WHERE name = 'ROLE_MODERATOR'), 
     (SELECT id FROM permissions WHERE name = 'VERIFY_USERS'));

-- Admin role permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES 
    ((SELECT id FROM roles WHERE name = 'ROLE_ADMIN'), 
     (SELECT id FROM permissions WHERE name = 'READ_USER')),
    ((SELECT id FROM roles WHERE name = 'ROLE_ADMIN'), 
     (SELECT id FROM permissions WHERE name = 'WRITE_USER')),
    ((SELECT id FROM roles WHERE name = 'ROLE_ADMIN'), 
     (SELECT id FROM permissions WHERE name = 'DELETE_USER')),
    ((SELECT id FROM roles WHERE name = 'ROLE_ADMIN'), 
     (SELECT id FROM permissions WHERE name = 'MANAGE_ROLES')),
    ((SELECT id FROM roles WHERE name = 'ROLE_ADMIN'), 
     (SELECT id FROM permissions WHERE name = 'VERIFY_USERS'));
