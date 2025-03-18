-- Assign admin role to the default admin user
INSERT INTO user_roles (user_id, role_id)
VALUES (
    (SELECT id FROM users WHERE email = 'jafrultripto@gmail.com'),
    (SELECT id FROM roles WHERE name = 'ROLE_ADMIN')
);