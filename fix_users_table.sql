-- Fix the users table by adding the name column and setting defaults

-- Step 1: Add the name column if it doesn't exist
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
    EXCEPTION WHEN duplicate_column THEN
        -- Column already exists, do nothing
        RAISE NOTICE 'name column already exists';
    END;
END $$;

-- Step 2: Update existing records to set name from email
UPDATE users 
SET name = SPLIT_PART(email, '@', 1)
WHERE name IS NULL OR name = '';

-- Step 3: Make the column NOT NULL 
ALTER TABLE users ALTER COLUMN name SET NOT NULL;

-- Step 4: Create or update the execute_sql function for future schema updates
CREATE OR REPLACE FUNCTION execute_sql(sql TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Update the update_user function to include the name field
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

-- Step 6: Verify the changes
SELECT 
  column_name,
  data_type,
  is_nullable
FROM 
  information_schema.columns 
WHERE 
  table_name = 'users' 
ORDER BY 
  ordinal_position; 