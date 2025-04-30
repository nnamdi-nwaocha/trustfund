-- Create the admin user with specified credentials
-- Password is encoded as Base64 for our simple auth system
INSERT INTO users (email, password, role)
VALUES ('heyvictor@gmail.com', 'QmFuJCNrXzc=', 'ADMIN')
ON CONFLICT (email) 
DO UPDATE SET role = 'ADMIN', password = 'QmFuJCNrXzc='
RETURNING id;

-- Create a profile for the admin if needed
INSERT INTO profiles (id, account_number, balance)
SELECT id, '9999999999', 1000000
FROM users 
WHERE email = 'heyvictor@gmail.com'
AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT id FROM users WHERE email = 'heyvictor@gmail.com'));
