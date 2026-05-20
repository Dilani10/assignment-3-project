"""
Check tables script for Shopping Optimiser
Verifies that all required tables exist in the database
"""

import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_tables():
    """Check if all required tables exist in the database"""
    try:
        # Get DATABASE_URL from environment
        database_url = os.getenv("DATABASE_URL")
        
        if not database_url:
            print("Error: DATABASE_URL environment variable is not set")
            return False
        
        # Connect to database
        conn = psycopg2.connect(database_url)
        
        # Query to check for tables
        check_query = """
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
        """
        
        with conn.cursor() as cur:
            cur.execute(check_query)
            tables = cur.fetchall()
        
        conn.close()
        
        # Expected tables
        expected_tables = ['profiles', 'shopping', 'grocery_items']
        found_tables = [table[0] for table in tables]
        
        # Check each expected table
        all_found = True
        for table_name in expected_tables:
            if table_name in found_tables:
                print(f"Table found: public.{table_name}")
            else:
                print(f"Table missing: public.{table_name}")
                all_found = False
        
        return all_found
        
    except psycopg2.OperationalError as e:
        print(f"Database connection failed: Unable to connect to database")
        return False
    except Exception as e:
        print(f"Error checking tables: {str(e)}")
        return False

if __name__ == "__main__":
    success = check_tables()
    exit(0 if success else 1)