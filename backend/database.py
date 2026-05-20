"""
Database initialization module for Shopping Optimiser
Reads SQL from setup_database.sql and executes it to create tables and triggers
"""

import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_database_url():
    """Get DATABASE_URL from environment variables"""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable is not set")
    return database_url

def init_database():
    """Initialize database by executing SQL setup script"""
    try:
        # Read SQL setup file
        with open("setup_database.sql", "r") as f:
            sql_script = f.read()
        
        # Connect to database
        database_url = get_database_url()
        conn = psycopg2.connect(database_url)
        conn.autocommit = True
        
        # Execute SQL script
        with conn.cursor() as cur:
            cur.execute(sql_script)
        
        conn.close()
        print("Database initialization completed successfully")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        raise

if __name__ == "__main__":
    init_database()