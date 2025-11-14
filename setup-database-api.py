#!/usr/bin/env python3
"""
Vungtauland Database Setup via Supabase REST API
Inserts sample property data
"""

import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_database():
    """Insert sample properties via Supabase REST API"""
    print("🚀 Starting Vungtauland Database Setup via Supabase API...\n")
    
    # Get credentials
    supabase_url = os.getenv('VITE_SUPABASE_URL')
    anon_key = os.getenv('VITE_SUPABASE_ANON_KEY')
    service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not all([supabase_url, service_key]):
        print("❌ Missing Supabase credentials in .env file")
        return False
    
    # Use service role key for full access
    headers = {
        'apikey': service_key,
        'Authorization': f'Bearer {service_key}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    # Sample properties data
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
    
    try:
        # Check if table exists and get current count
        print("🔍 Checking existing data...")
        url = f'{supabase_url}/rest/v1/properties'
        
        response = requests.get(
            url,
            headers={**headers, 'Prefer': 'count=exact'},
            params={'select': 'id', 'limit': 0}
        )
        
        if response.status_code == 404:
            print("\n❌ Table 'properties' does not exist!")
            print("📋 Please create the table first using SQL Editor in Supabase:")
            print("   1. Go to SQL Editor in Supabase Dashboard")
            print("   2. Copy and run the SQL from 'database-setup.sql' file")
            print("   3. Then run this script again\n")
            return False
        
        current_count = int(response.headers.get('Content-Range', '0-0/0').split('/')[1])
        print(f"✅ Table exists with {current_count} records\n")
        
        # Insert properties
        print(f"📝 Inserting {len(properties)} sample properties...")
        response = requests.post(
            url,
            headers=headers,
            json=properties
        )
        
        if response.status_code in [200, 201]:
            inserted_data = response.json()
            print(f"✅ Successfully inserted {len(inserted_data)} properties!\n")
        elif response.status_code == 409:
            print("⚠️  Some properties already exist (duplicate key error)")
            print("   Continuing with verification...\n")
        else:
            print(f"❌ Insert failed with status {response.status_code}")
            print(f"   Response: {response.text}\n")
            return False
        
        # Verify final count
        print("🔍 Verifying final count...")
        response = requests.get(
            url,
            headers={**headers, 'Prefer': 'count=exact'},
            params={'select': 'id', 'limit': 0}
        )
        
        final_count = int(response.headers.get('Content-Range', '0-0/0').split('/')[1])
        print(f"✅ Total properties in database: {final_count}\n")
        
        # Get sample data
        print("📊 Sample properties:")
        response = requests.get(
            url,
            headers=headers,
            params={'select': 'title,type,status,price', 'limit': 3}
        )
        
        if response.status_code == 200:
            sample_data = response.json()
            for idx, prop in enumerate(sample_data, 1):
                price_formatted = f"{prop['price'] / 1_000_000_000:.1f}"
                print(f"   {idx}. {prop['title']} - {prop['type']} - {prop['status']} - {price_formatted}B VNĐ")
        
        print("\n🎉 Database setup completed successfully!")
        print("🌐 Refresh your app at http://localhost:8081 to see the data\n")
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Request error: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = setup_database()
    exit(0 if success else 1)
