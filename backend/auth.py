"""
Supabase Authentication Module for Shopping Optimiser
Handles user registration, login, and token management

SECURITY NOTE: This is a learning backend implementation.
In production, tokens should be verified properly with JWKS and proper JWT validation.
This implementation uses Supabase's built-in authentication for simplicity.
"""

from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file")

# Create Supabase client instance
# Note: In production, tokens should be verified properly
supabase: Client = create_client(supabase_url, supabase_key)


def register_user(email: str, password: str, first_name: str, last_name: str):
    """
    Register a new user with Supabase Auth
    
    Args:
        email: User's email address
        password: User's password
        first_name: User's first name
        last_name: User's last name
    
    Returns:
        Supabase auth response with user and session data
    
    Note: In production, tokens should be verified properly
    """
    # Register user with Supabase Auth
    response = supabase.auth.sign_up({
        "email": email,
        "password": password,
        "options": {
            "data": {
                "first_name": first_name,
                "last_name": last_name
            }
        }
    })
    
    # Manually create profile after successful registration
    # This ensures the profile exists even if the database trigger fails
    if response.user:
        try:
            # Check if profile already exists
            existing_profile = supabase.table("profiles").select("id").eq("id", response.user.id).execute()
            
            if not existing_profile.data:
                # Create profile if it doesn't exist
                supabase.table("profiles").insert({
                    "id": response.user.id,
                    "first_name": first_name,
                    "last_name": last_name,
                    "email_address": email
                }).execute()
                print(f"✅ Profile created for user: {response.user.id}")
            else:
                print(f"✅ Profile already exists for user: {response.user.id}")
        except Exception as e:
            # Profile creation failed - raise exception to prevent registration from succeeding
            print(f"❌ Profile creation failed: {e}")
            raise Exception(f"Failed to create user profile: {e}")
    
    # For development: If email confirmation is required, we can auto-confirm
    # In production, this should be handled properly with email verification
    if response.user and not response.session:
        print("⚠️  User registered but email confirmation may be required")
        print("   Check your Supabase dashboard to disable email confirmation for development")
    
    return response


def login_user(email: str, password: str):
    """
    Login user with Supabase Auth
    
    Args:
        email: User's email address
        password: User's password
    
    Returns:
        Supabase auth response with user and session data
    
    Note: In production, tokens should be verified properly
    """
    # Login user with Supabase Auth
    response = supabase.auth.sign_in_with_password({
        "email": email,
        "password": password
    })
    return response


def get_user(access_token: str):
    """
    Get user information from access token
    
    Args:
        access_token: User's access token from Supabase Auth
    
    Returns:
        User object from Supabase
    
    Note: In production, tokens should be verified properly with JWKS
    """
    # Get user from access token
    # In production, tokens should be verified properly
    user = supabase.auth.get_user(access_token)
    return user


def refresh_token(refresh_token: str):
    """
    Refresh user's access token
    
    Args:
        refresh_token: User's refresh token
    
    Returns:
        New session with refreshed tokens
    
    Note: In production, tokens should be verified properly
    """
    # Refresh the access token
    response = supabase.auth.refresh_session(refresh_token)
    return response


def logout_user(access_token: str):
    """
    Logout user by invalidating their session
    
    Args:
        access_token: User's access token
    
    Note: In production, tokens should be verified properly
    """
    # Logout user
    supabase.auth.sign_out()