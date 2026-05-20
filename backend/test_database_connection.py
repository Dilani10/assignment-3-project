"""
Test database connection script for Shopping Optimiser
Verifies connection to Supabase PostgreSQL without printing sensitive information
"""

import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_connection():
    """Test database connection and print result"""
    try:
        # Get DATABASE_URL from environment
        database_url = os.getenv("DATABASE_URL")
        
        if not database_url:
            print("Error: DATABASE_URL environment variable is not set")
            return False
        
        # Attempt to connect to database
        conn = psycopg2.connect(database_url)
        
        # Test connection with a simple query
        with conn.cursor() as cur:
            cur.execute("SELECT version();")
            version = cur.fetchone()
        
        conn.close()
        
        # Print success message without exposing sensitive data
        print("Database connection successful")
        return True
        
    except psycopg2.OperationalError as e:
        print(f"Database connection failed: Unable to connect to database")
        return False
    except Exception as e:
        print(f"Database connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_connection()
    exit(0 if success else 1)