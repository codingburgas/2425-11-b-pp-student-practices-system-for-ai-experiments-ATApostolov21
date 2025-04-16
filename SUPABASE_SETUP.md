# Supabase Authentication Setup Guide

## Problem Identified
Your authentication issues stem from Supabase's Row Level Security (RLS) policies, which are preventing:
- Anonymous users from inserting new records (registration)
- Reading user data for login verification
- Updating and deleting user records

## Solution: SQL Setup in Supabase

### Step 1: Access your Supabase Project
1. Log in to Supabase at https://app.supabase.co/
2. Select your project
3. Navigate to the SQL Editor

### Step 2: Run the SQL Setup Script
1. Open a new SQL query
2. Copy and paste the entire contents of the `setup_supabase.sql` file into the editor
3. Click "Run" to execute the SQL

This will:
- Create the users table if it doesn't exist
- Enable appropriate Row Level Security (RLS) policies
- Create SQL functions that bypass RLS for specific operations

### Step 3: Verify Setup
To verify the setup was successful:
1. Navigate to the "Table Editor" in Supabase
2. Select the "users" table
3. Check that the table structure matches what you see in the SQL script
4. Navigate to "Authentication" → "Policies" to confirm the RLS policies were created

## What Has Been Fixed in Your Code

### 1. User Model Changes
- Added RPC function calls to bypass RLS policies
- Added error handling for all Supabase operations
- Ensured proper handling of UUIDs

### 2. SQL Setup
- Created the users table with the correct structure
- Added RLS policies that allow the necessary operations
- Created SQL functions with SECURITY DEFINER to bypass RLS

### 3. Authentication Flow
- Registration should now create new users in Supabase
- Login should successfully retrieve user data
- Profile updates and deletions should work

## Testing Your Authentication

After completing the SQL setup, you should test:

1. User Registration
   - Try registering a new user
   - Check the users table in Supabase to confirm the user was created

2. User Login
   - Try logging in with the user you created
   - Verify you can access protected routes after login

3. User Profile Management
   - Test updating user information
   - Test deleting a user account

If you encounter further issues, check the Flask server logs for specific errors. 