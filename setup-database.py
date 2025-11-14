#!/usr/bin/env python3
"""
Vungtauland Database Setup Script
Automatically creates tables and inserts sample data
"""

import os
import psycopg2
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_database():
    """Setup database with tables and sample data"""
    print("🚀 Starting Vungtauland Database Setup...\n")
    
    # Get database URL
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print("❌ DATABASE_URL not found in .env file")
        return False
    
    conn = None
    cursor = None
    
    try:
        # Parse database URL
        print("📡 Parsing database connection...")
        parsed = urlparse(db_url)
        
        # Extract connection parameters
        conn_params = {
            'host': parsed.hostname,
            'port': parsed.port,
            'database': parsed.path.lstrip('/'),
            'user': parsed.username,
            'password': parsed.password,
            'sslmode': 'require'
        }
        
        print(f"   Host: {conn_params['host']}")
        print(f"   Port: {conn_params['port']}")
        print(f"   Database: {conn_params['database']}")
        print(f"   User: {conn_params['user']}")
        
        # Connect to database
        print("\n📡 Connecting to database...")
        conn = psycopg2.connect(**conn_params)
        cursor = conn.cursor()
        print("✅ Connected successfully!\n")
        
        # Read and execute SQL file
        print("📄 Reading SQL setup file...")
        sql_file_path = os.path.join(os.path.dirname(__file__), 'database-setup.sql')
        
        with open(sql_file_path, 'r', encoding='utf-8') as f:
            sql_script = f.read()
        
        print("✅ SQL file loaded\n")
        
        # Execute SQL
        print("⚡ Executing SQL commands...")
        cursor.execute(sql_script)
        conn.commit()
        print("✅ Database setup completed!\n")
        
        # Verify setup
        print("🔍 Verifying setup...")
        cursor.execute("SELECT COUNT(*) FROM properties")
        result = cursor.fetchone()
        count = result[0] if result else 0
        print(f"✅ Found {count} properties in database\n")
        
        # Show sample data
        if count > 0:
            print("📊 Sample properties:")
            cursor.execute("SELECT title, type, status, price FROM properties LIMIT 3")
            rows = cursor.fetchall()
            for idx, row in enumerate(rows, 1):
                title, prop_type, status, price = row
                price_formatted = f"{price / 1_000_000_000:.1f}"
                print(f"   {idx}. {title} - {prop_type} - {status} - {price_formatted}B VNĐ")
        
        print("\n🎉 Database setup completed successfully!")
        print("🌐 You can now access your app at http://localhost:8081\n")
        
        return True
        
    except psycopg2.Error as e:
        print(f"\n❌ Database error: {e}")
        if conn:
            conn.rollback()
        return False
        
    except FileNotFoundError:
        print("\n❌ SQL file 'database-setup.sql' not found!")
        print("Please make sure the file exists in the project root directory.\n")
        return False
        
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return False
        
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
            print("🔌 Database connection closed")

if __name__ == "__main__":
    success = setup_database()
    exit(0 if success else 1)
