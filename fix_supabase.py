from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

# Get Supabase credentials from environment variables
url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_KEY')

print(f"Connecting to Supabase: {url}")

try:
    # Create Supabase client
    supabase = create_client(url, key)
    print("Successfully connected to Supabase")
    
    # Check if users table has any entries
    response = supabase.table('users').select('*').execute()
    print(f"Found {len(response.data)} users in the table")
    
    # Now, run an RPC to fix the users table by adding the name column with a default value if it doesn't exist
    # Note: This assumes you have a function in your database or can create one directly
    try:
        # First try to alter the table directly - this might not work due to RLS
        sql = """
        -- Try to add the name column if it doesn't exist
        DO $$ 
        BEGIN
            BEGIN
                ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
            EXCEPTION WHEN undefined_column THEN
                -- Column already exists
            END;
            
            -- Update existing records to set name if null
            UPDATE users SET name = SPLIT_PART(email, '@', 1) WHERE name IS NULL;
            
            -- Make the column not null after setting defaults
            ALTER TABLE users ALTER COLUMN name SET NOT NULL;
        END $$;
        """
        
        # Execute the SQL using Postgres function
        rpc_response = supabase.rpc('execute_sql', {'sql': sql}).execute()
        print("Table schema updated successfully")
    except Exception as e:
        print(f"Error updating schema: {e}")
        print("You'll need to make this change directly in the Supabase UI using SQL Editor")
        print("Execute the following SQL in the Supabase SQL Editor:")
        print(sql)
    
    # Try to create a test user to verify everything works
    test_email = f"test_user_{os.urandom(4).hex()}@example.com"
    test_name = test_email.split('@')[0]
    
    try:
        insert_response = supabase.table('users').insert({
            'email': test_email,
            'name': test_name,
            'role': 'student',
            'password': 'test_password_hash'
        }).execute()
        
        if insert_response.data:
            print(f"Successfully created test user: {test_email}")
            
            # Now try to retrieve the user
            check_response = supabase.table('users').select('*').eq('email', test_email).execute()
            if check_response.data:
                print(f"Successfully retrieved test user: {check_response.data[0]}")
                
                # Clean up by deleting the test user
                delete_response = supabase.table('users').delete().eq('id', check_response.data[0]['id']).execute()
                print("Test user deleted successfully")
            else:
                print("Could not retrieve the test user")
        else:
            print("Failed to create test user")
    except Exception as e:
        print(f"Error testing user creation: {e}")
    
except Exception as e:
    print(f"Error connecting to Supabase: {e}") 