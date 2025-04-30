-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'USER';

-- Change default balance in profiles table to 0
ALTER TABLE profiles ALTER COLUMN balance SET DEFAULT 0;

-- Create an admin user if one doesn't exist
INSERT INTO users (email, password, role)
SELECT 'admin@example.com', 'YWRtaW4xMjM=', 'ADMIN'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'ADMIN')
RETURNING id;

-- Create a profile for the admin if needed
INSERT INTO profiles (id, account_number)
SELECT id, '9999999999'
FROM users 
WHERE email = 'admin@example.com'
AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT id FROM users WHERE email = 'admin@example.com'));
