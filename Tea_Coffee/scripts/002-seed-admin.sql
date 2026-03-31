-- Seed initial admin user
INSERT INTO "User" ("id", "email", "name", "role", "createdAt", "updatedAt")
VALUES (
    'admin-initial-001',
    '2023csb1167@iitrpr.ac.in',
    'System Admin',
    'ADMIN',
    NOW(),
    NOW()
)
ON CONFLICT ("email") DO NOTHING;
