-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to create new users (for registration)
CREATE POLICY insert_users ON users FOR INSERT WITH CHECK (true);

-- Allow users to read their own data
CREATE POLICY read_own_user ON users FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY update_own_user ON users FOR UPDATE USING (auth.uid() = id);

-- Allow users to delete their own data
CREATE POLICY delete_own_user ON users FOR DELETE USING (auth.uid() = id);

-- Add a policy for login handling
CREATE POLICY read_for_login ON users FOR SELECT USING (true); 