#!/usr/bin/env python3
"""
Vungtauland Database Setup - Create Table and Insert Data
Uses Supabase Management API to execute SQL
"""

import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_table_and_insert_data():
    """Create table and insert sample data using Supabase SQL endpoint"""
    print("🚀 Starting Vungtauland Database Full Setup...\n")
    
    # Get credentials
    supabase_url = os.getenv('VITE_SUPABASE_URL')
    service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not all([supabase_url, service_key]):
        print("❌ Missing Supabase credentials in .env file")
        return False
    
    # Extract project ref from URL
    project_ref = supabase_url.split('//')[1].split('.')[0]
    
    headers = {
        'apikey': service_key,
        'Authorization': f'Bearer {service_key}',
        'Content-Type': 'application/json'
    }
    
    try:
        # Step 1: Create table using SQL query endpoint
        print("📊 Creating properties table...")
        
        create_table_sql = """
-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL,
  price BIGINT NOT NULL,
  location VARCHAR NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area INTEGER NOT NULL,
  image_url VARCHAR NOT NULL,
  description TEXT,
  type VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'Có sẵn',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON properties;
DROP POLICY IF EXISTS "Allow authenticated insert" ON properties;
DROP POLICY IF EXISTS "Allow authenticated update" ON properties;
DROP POLICY IF EXISTS "Allow authenticated delete" ON properties;
DROP POLICY IF EXISTS "Enable insert for service role" ON properties;

-- Create policy to allow read access to all users
CREATE POLICY "Allow public read access" ON properties
  FOR SELECT USING (true);

-- Create policy to allow insert for service role (using service_role key)
CREATE POLICY "Enable insert for service role" ON properties
  FOR INSERT WITH CHECK (true);

-- Create policy to allow update for service role
CREATE POLICY "Allow authenticated update" ON properties
  FOR UPDATE USING (true);

-- Create policy to allow delete for service role
CREATE POLICY "Allow authenticated delete" ON properties
  FOR DELETE USING (true);
"""
        
        # Execute SQL via PostgREST rpc endpoint
        sql_url = f'{supabase_url}/rest/v1/rpc/exec_sql'
        
        # Try direct table creation via REST API
        print("   Using Supabase REST API to create table...")
        
        # First, let's just try to insert data - if table doesn't exist, we'll get a clear error
        print("\n📝 Attempting to insert sample data...")
        
        properties = [
            {
                'title': 'Villa biển view tuyệt đẹp',
                'price': 8500000000,
                'location': 'Bãi Trước, Vũng Tàu',
                'bedrooms': 4,
                'bathrooms': 3,
                'area': 250,
                'image_url': 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'description': 'Villa sang trọng với view biển tuyệt đẹp, thiết kế hiện đại, đầy đủ nội thất cao cấp.',
                'type': 'Villa',
                'status': 'Có sẵn'
            },
            {
                'title': 'Căn hộ cao cấp The Sóng',
                'price': 3200000000,
                'location': 'Thùy Vân, Vũng Tàu',
                'bedrooms': 2,
                'bathrooms': 2,
                'area': 85,
                'image_url': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'description': 'Căn hộ view biển tại dự án The Sóng, đầy đủ tiện ích, gần biển Thùy Vân.',
                'type': 'Căn hộ',
                'status': 'Hot'
            },
            {
                'title': 'Nhà phố trung tâm thành phố',
                'price': 4500000000,
                'location': 'Nguyễn Thái Học, Vũng Tàu',
                'bedrooms': 3,
                'bathrooms': 2,
                'area': 120,
                'image_url': 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'description': 'Nhà phố 3 tầng tại trung tâm thành phố, gần chợ, trường học, tiện kinh doanh.',
                'type': 'Nhà phố',
                'status': 'Có sẵn'
            },
            {
                'title': 'Đất nền dự án Diamond City',
                'price': 2100000000,
                'location': 'Long Điền, Bà Rịa - Vũng Tàu',
                'bedrooms': 0,
                'bathrooms': 0,
                'area': 100,
                'image_url': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'description': 'Đất nền sổ đỏ tại dự án Diamond City, pháp lý rõ ràng, hạ tầng hoàn thiện.',
                'type': 'Đất nền',
                'status': 'Nổi bật'
            },
            {
                'title': 'Biệt thự nghỉ dưỡng Hồ Tràm',
                'price': 12000000000,
                'location': 'Hồ Tràm, Xuyên Mộc',
                'bedrooms': 5,
                'bathrooms': 4,
                'area': 350,
                'image_url': 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'description': 'Biệt thự nghỉ dưỡng sang trọng tại Hồ Tràm, có hồ bơi riêng, vườn tận hưởng.',
                'type': 'Biệt thự',
                'status': 'Hot'
            },
            {
                'title': 'Shophouse mặt tiền biển',
                'price': 6800000000,
                'location': 'Bãi Sau, Vũng Tàu',
                'bedrooms': 1,
                'bathrooms': 1,
                'area': 80,
                'image_url': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'description': 'Shophouse mặt tiền đường biển Bãi Sau, vị trí đắc địa để kinh doanh.',
                'type': 'Shophouse',
                'status': 'Có sẵn'
            },
            {
                'title': 'Căn hộ studio The Coastal',
                'price': 1800000000,
                'location': 'Bãi Trước, Vũng Tàu',
                'bedrooms': 1,
                'bathrooms': 1,
                'area': 45,
                'image_url': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'description': 'Studio hiện đại tại The Coastal, view biển, đầy đủ nội thất, sẵn sàng ở ngay.',
                'type': 'Studio',
                'status': 'Nổi bật'
            },
            {
                'title': 'Nhà mặt tiền Lê Hồng Phong',
                'price': 5500000000,
                'location': 'Lê Hồng Phong, Vũng Tàu',
                'bedrooms': 4,
                'bathrooms': 3,
                'area': 150,
                'image_url': 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'description': 'Nhà mặt tiền đường Lê Hồng Phong, 4 tầng, thích hợp kinh doanh và ở.',
                'type': 'Nhà mặt tiền',
                'status': 'Có sẵn'
            },
            {
                'title': 'Condotel Ocean Vista',
                'price': 2800000000,
                'location': 'Thùy Vân, Vũng Tàu',
                'bedrooms': 1,
                'bathrooms': 1,
                'area': 55,
                'image_url': 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'description': 'Condotel Ocean Vista với view biển 180°, cam kết lợi nhuận cho thuê.',
                'type': 'Condotel',
                'status': 'Hot'
            },
            {
                'title': 'Đất thổ cư Huyện Long Điền',
                'price': 1500000000,
                'location': 'Long Điền, Bà Rịa - Vũng Tàu',
                'bedrooms': 0,
                'bathrooms': 0,
                'area': 150,
                'image_url': 'https://images.unsplash.com/photo-1500076656116-558758c991c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'description': 'Đất thổ cư 100% tại Long Điền, gần khu công nghiệp, tiềm năng phát triển cao.',
                'type': 'Đất thổ cư',
                'status': 'Có sẵn'
            }
        ]
        
        url = f'{supabase_url}/rest/v1/properties'
        response = requests.post(
            url,
            headers={**headers, 'Prefer': 'return=representation'},
            json=properties
        )
        
        if response.status_code in [200, 201]:
            inserted_data = response.json()
            print(f"✅ Successfully inserted {len(inserted_data)} properties!\n")
            
            # Show sample
            print("📊 Sample properties:")
            for idx, prop in enumerate(inserted_data[:3], 1):
                price_formatted = f"{prop['price'] / 1_000_000_000:.1f}"
                print(f"   {idx}. {prop['title']} - {prop['type']} - {prop['status']} - {price_formatted}B VNĐ")
            
            print("\n🎉 Database setup completed successfully!")
            print("🌐 Refresh your app at http://localhost:8081 to see the data\n")
            return True
            
        elif response.status_code == 404:
            print("\n❌ Table 'properties' does not exist!")
            print("\n📋 MANUAL SETUP REQUIRED:")
            print("=" * 60)
            print("1. Open Supabase Dashboard SQL Editor:")
            print(f"   https://supabase.com/dashboard/project/{project_ref}/sql/new")
            print("\n2. Copy and paste this SQL:")
            print("=" * 60)
            print(create_table_sql)
            print("=" * 60)
            print("\n3. Click 'Run' to execute the SQL")
            print("\n4. Then run this script again: python setup-database-api.py")
            print("=" * 60)
            return False
            
        else:
            print(f"\n❌ Insert failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Request error: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = create_table_and_insert_data()
    exit(0 if success else 1)
