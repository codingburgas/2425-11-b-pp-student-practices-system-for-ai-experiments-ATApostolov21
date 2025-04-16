import os
import tempfile
import uuid
from typing import Any, Dict, Optional, Tuple

import pandas as pd
import requests
import supabase
from flask import current_app, g, session
from supabase import Client, create_client

def get_supabase_client() -> Client:
    """Get or create a Supabase client instance."""
    if 'supabase' not in g:
        url = os.environ.get('SUPABASE_URL')
        key = os.environ.get('SUPABASE_KEY')
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
        g.supabase = create_client(url, key)
        
        # Set the auth token if available in session
        if 'access_token' in session:
            g.supabase.auth.set_session(session.get('access_token'), session.get('refresh_token'))
    
    return g.supabase

def generate_unique_filename(owner_id: str, original_name: str) -> str:
    """Generate a unique filename for storage."""
    timestamp = pd.Timestamp.now().strftime('%Y%m%d%H%M%S')
    base_name = os.path.splitext(original_name)[0]
    return f"{owner_id}/{base_name}_{timestamp}.csv"

def upload_file(bucket_name: str, path: str, file_data: bytes) -> str:
    """Upload a file to Supabase storage.
    
    Args:
        bucket_name: Name of the storage bucket
        path: Path within the bucket where the file will be stored
        file_data: The binary data of the file
        
    Returns:
        URL of the uploaded file
    """
    try:
        supabase_client = get_supabase_client()
        response = supabase_client.storage.from_(bucket_name).upload(
            path,
            file_data,
            {"content-type": "text/csv"}
        )
        
        # Get public URL
        file_url = supabase_client.storage.from_(bucket_name).get_public_url(path)
        return file_url
    except Exception as e:
        current_app.logger.error(f"Error uploading file to Supabase: {str(e)}")
        raise

def download_file(bucket_name: str, path: str) -> Tuple[bytes, str]:
    """Download a file from Supabase storage.
    
    Args:
        bucket_name: Name of the storage bucket
        path: Path within the bucket
        
    Returns:
        Tuple of (file_data, temp_path)
    """
    try:
        supabase_client = get_supabase_client()
        
        # First try to get signed URL
        signed_url = supabase_client.storage.from_(bucket_name).create_signed_url(
            path, 
            60  # Valid for 60 seconds
        )
        
        # Download file using the signed URL
        response = requests.get(signed_url['signedURL'])
        response.raise_for_status()
        
        # Create a temporary file
        fd, temp_path = tempfile.mkstemp(suffix='.csv')
        with os.fdopen(fd, 'wb') as temp_file:
            temp_file.write(response.content)
        
        return response.content, temp_path
    except Exception as e:
        current_app.logger.error(f"Error downloading file from Supabase: {str(e)}")
        raise

def delete_file(bucket_name: str, path: str) -> bool:
    """Delete a file from Supabase storage.
    
    Args:
        bucket_name: Name of the storage bucket
        path: Path within the bucket
        
    Returns:
        True if successful, False otherwise
    """
    try:
        supabase_client = get_supabase_client()
        supabase_client.storage.from_(bucket_name).remove([path])
        return True
    except Exception as e:
        current_app.logger.error(f"Error deleting file from Supabase: {str(e)}")
        return False

def get_user_role() -> str:
    """Get the current user's role."""
    try:
        supabase_client = get_supabase_client()
        user = supabase_client.auth.get_user()
        
        if not user or not user.user:
            return None
            
        # Query for user details
        response = supabase_client.table('users').select('role').eq('id', user.user.id).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]['role']
        return None
    except Exception as e:
        current_app.logger.error(f"Error getting user role: {str(e)}")
        return None

def is_teacher() -> bool:
    """Check if the current user is a teacher."""
    return get_user_role() == 'teacher'

def get_current_user_id() -> Optional[str]:
    """Get the current user's ID."""
    try:
        supabase_client = get_supabase_client()
        user = supabase_client.auth.get_user()
        
        if user and user.user:
            return user.user.id
        return None
    except Exception:
        return None

def clean_temp_file(temp_path: str) -> None:
    """Clean up a temporary file."""
    if temp_path and os.path.exists(temp_path):
        try:
            os.remove(temp_path)
        except Exception as e:
            current_app.logger.error(f"Error cleaning up temporary file: {str(e)}")

def get_file_url(bucket_name: str, path: str) -> str:
    """Get a public URL for a file in Supabase storage.
    
    Args:
        bucket_name: Name of the storage bucket
        path: Path within the bucket
        
    Returns:
        Public URL of the file
    """
    try:
        supabase_client = get_supabase_client()
        file_url = supabase_client.storage.from_(bucket_name).get_public_url(path)
        return file_url
    except Exception as e:
        current_app.logger.error(f"Error getting file URL from Supabase: {str(e)}")
        return None

def execute_rpc(function_name: str, params: Dict[str, Any]) -> Dict:
    """Execute a Supabase RPC function.
    
    Args:
        function_name: Name of the function to call
        params: Parameters to pass to the function
        
    Returns:
        Response data from the function call
    """
    try:
        supabase_client = get_supabase_client()
        response = supabase_client.rpc(function_name, params).execute()
        return response.data
    except Exception as e:
        current_app.logger.error(f"Error executing RPC {function_name}: {str(e)}")
        raise 