from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

# Get Supabase credentials from environment variables
url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_KEY')

print(f"URL: {url}")
print(f"Key: {key[:10]}...{key[-10:]}")

try:
    # Create Supabase client
    supabase = create_client(url, key)
    print("Successfully created Supabase client")
    
    # Try to fetch users table
    response = supabase.table('users').select('*').execute()
    print(f"Response data: {response.data}")
    
    if not response.data:
        print("Users table is empty or doesn't exist")
    
    # Try to insert a test user
    test_email = "test_user@example.com"
    insert_response = supabase.table('users').insert({
        'email': test_email,
        'role': 'student',
        'password': 'test_password_hash'
    }).execute()
    
    print(f"Insert response: {insert_response.data}")
    
    # Try to fetch the user we just created
    check_response = supabase.table('users').select('*').eq('email', test_email).execute()
    print(f"Created user: {check_response.data}")
    
except Exception as e:
    print(f"Error occurred: {str(e)}") 