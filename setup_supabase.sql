-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to create new users (for registration)
DROP POLICY IF EXISTS insert_users ON users;
CREATE POLICY insert_users ON users FOR INSERT WITH CHECK (true);

-- Allow users to read their own data
DROP POLICY IF EXISTS read_own_user ON users;
CREATE POLICY read_own_user ON users FOR SELECT USING (true);

-- Allow users to update their own data
DROP POLICY IF EXISTS update_own_user ON users;
CREATE POLICY update_own_user ON users FOR UPDATE USING (true);

-- Allow users to delete their own data
DROP POLICY IF EXISTS delete_own_user ON users;
CREATE POLICY delete_own_user ON users FOR DELETE USING (true);

-- Function to get user by ID
CREATE OR REPLACE FUNCTION get_user_by_id(user_id UUID)
RETURNS SETOF users AS $$
BEGIN
  RETURN QUERY SELECT * FROM users WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user by email
CREATE OR REPLACE FUNCTION get_user_by_email(user_email TEXT)
RETURNS SETOF users AS $$
BEGIN
  RETURN QUERY SELECT * FROM users WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user data
CREATE OR REPLACE FUNCTION update_user(user_id UUID, user_data JSONB)
RETURNS SETOF users AS $$
BEGIN
  RETURN QUERY
    UPDATE users
    SET
      email = COALESCE(user_data->>'email', email),
      name = COALESCE(user_data->>'name', name),
      role = COALESCE(user_data->>'role', role),
      password = COALESCE(user_data->>'password', password)
    WHERE id = user_id
    RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete user
CREATE OR REPLACE FUNCTION delete_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM users WHERE id = user_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all teachers
CREATE OR REPLACE FUNCTION get_all_teachers()
RETURNS SETOF users AS $$
BEGIN
  RETURN QUERY SELECT * FROM users WHERE role = 'teacher';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create datasets table if it doesn't exist
CREATE TABLE IF NOT EXISTS datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for datasets
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own datasets
DROP POLICY IF EXISTS insert_own_datasets ON datasets;
CREATE POLICY insert_own_datasets ON datasets 
    FOR INSERT 
    WITH CHECK (owner_id = auth.uid() OR 
               EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'teacher'));

-- Allow users to select their own datasets, teachers can select all
DROP POLICY IF EXISTS select_datasets ON datasets;
CREATE POLICY select_datasets ON datasets 
    FOR SELECT 
    USING (owner_id = auth.uid() OR 
          EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'teacher'));

-- Allow users to update their own datasets
DROP POLICY IF EXISTS update_own_datasets ON datasets;
CREATE POLICY update_own_datasets ON datasets 
    FOR UPDATE 
    USING (owner_id = auth.uid() OR 
          EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'teacher'));

-- Allow users to delete their own datasets
DROP POLICY IF EXISTS delete_own_datasets ON datasets;
CREATE POLICY delete_own_datasets ON datasets 
    FOR DELETE 
    USING (owner_id = auth.uid() OR 
          EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'teacher'));

-- Create a security definer function to insert datasets bypassing RLS
CREATE OR REPLACE FUNCTION insert_dataset(
  p_name TEXT,
  p_description TEXT,
  p_file_path TEXT,
  p_owner_id UUID
) RETURNS datasets AS $$
DECLARE
  new_dataset datasets;
BEGIN
  INSERT INTO datasets (name, description, file_path, owner_id)
  VALUES (p_name, p_description, p_file_path, p_owner_id)
  RETURNING * INTO new_dataset;
  
  RETURN new_dataset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a security definer function to select datasets bypassing RLS
CREATE OR REPLACE FUNCTION get_dataset_by_id(p_id UUID) 
RETURNS SETOF datasets AS $$
BEGIN
  RETURN QUERY SELECT * FROM datasets WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a security definer function to get datasets by owner
CREATE OR REPLACE FUNCTION get_datasets_by_owner(p_owner_id UUID) 
RETURNS SETOF datasets AS $$
BEGIN
  RETURN QUERY SELECT * FROM datasets WHERE owner_id = p_owner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a security definer function to get all datasets
CREATE OR REPLACE FUNCTION get_all_datasets() 
RETURNS SETOF datasets AS $$
BEGIN
  RETURN QUERY SELECT * FROM datasets ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a security definer function to delete dataset
CREATE OR REPLACE FUNCTION delete_dataset(p_id UUID, p_owner_id UUID) 
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM datasets 
  WHERE id = p_id AND (owner_id = p_owner_id OR 
                     EXISTS (SELECT 1 FROM users WHERE id = p_owner_id AND role = 'teacher'));
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage bucket policies
-- Make sure the bucket exists first
INSERT INTO storage.buckets (id, name) 
VALUES ('datasets', 'datasets') 
ON CONFLICT (id) DO NOTHING;

-- Allow public access to the bucket
UPDATE storage.buckets 
SET public = TRUE 
WHERE id = 'datasets';

-- RLS policies for storage
DROP POLICY IF EXISTS storage_datasets_insert ON storage.objects;
CREATE POLICY storage_datasets_insert ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (
    bucket_id = 'datasets' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR 
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'teacher'))
);

DROP POLICY IF EXISTS storage_datasets_select ON storage.objects;
CREATE POLICY storage_datasets_select ON storage.objects 
FOR SELECT TO authenticated 
USING (
    bucket_id = 'datasets' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR 
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'teacher'))
);

DROP POLICY IF EXISTS storage_datasets_delete ON storage.objects;
CREATE POLICY storage_datasets_delete ON storage.objects 
FOR DELETE TO authenticated 
USING (
    bucket_id = 'datasets' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR 
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'teacher'))
); 