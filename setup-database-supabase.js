import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('🚀 Starting Vungtauland Database Setup via Supabase...\n')
  
  try {
    // Check if table already exists
    console.log('🔍 Checking existing data...')
    const { data: existingData, error: checkError } = await supabase
      .from('properties')
      .select('count', { count: 'exact', head: true })
    
    if (!checkError && existingData) {
      console.log('⚠️  Table already exists with data. Skipping creation...\n')
    }
    
    // Sample properties data
    const properties = [
      {
        title: 'Villa biển view tuyệt đẹp',
        price: 8500000000,
        location: 'Bãi Trước, Vũng Tàu',
        bedrooms: 4,
        bathrooms: 3,
        area: 250,
        image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Villa sang trọng với view biển tuyệt đẹp, thiết kế hiện đại, đầy đủ nội thất cao cấp.',
        type: 'Villa',
        status: 'Có sẵn'
      },
      {
        title: 'Căn hộ cao cấp The Sóng',
        price: 3200000000,
        location: 'Thùy Vân, Vũng Tàu',
        bedrooms: 2,
        bathrooms: 2,
        area: 85,
        image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Căn hộ view biển tại dự án The Sóng, đầy đủ tiện ích, gần biển Thùy Vân.',
        type: 'Căn hộ',
        status: 'Hot'
      },
      {
        title: 'Nhà phố trung tâm thành phố',
        price: 4500000000,
        location: 'Nguyễn Thái Học, Vũng Tàu',
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        image_url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Nhà phố 3 tầng tại trung tâm thành phố, gần chợ, trường học, tiện kinh doanh.',
        type: 'Nhà phố',
        status: 'Có sẵn'
      },
      {
        title: 'Đất nền dự án Diamond City',
        price: 2100000000,
        location: 'Long Điền, Bà Rịa - Vũng Tàu',
        bedrooms: 0,
        bathrooms: 0,
        area: 100,
        image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Đất nền sổ đỏ tại dự án Diamond City, pháp lý rõ ràng, hạ tầng hoàn thiện.',
        type: 'Đất nền',
        status: 'Nổi bật'
      },
      {
        title: 'Biệt thự nghỉ dưỡng Hồ Tràm',
        price: 12000000000,
        location: 'Hồ Tràm, Xuyên Mộc',
        bedrooms: 5,
        bathrooms: 4,
        area: 350,
        image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Biệt thự nghỉ dưỡng sang trọng tại Hồ Tràm, có hồ bơi riêng, vườn tận hưởng.',
        type: 'Biệt thự',
        status: 'Hot'
      },
      {
        title: 'Shophouse mặt tiền biển',
        price: 6800000000,
        location: 'Bãi Sau, Vũng Tàu',
        bedrooms: 1,
        bathrooms: 1,
        area: 80,
        image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Shophouse mặt tiền đường biển Bãi Sau, vị trí đắc địa để kinh doanh.',
        type: 'Shophouse',
        status: 'Có sẵn'
      },
      {
        title: 'Căn hộ studio The Coastal',
        price: 1800000000,
        location: 'Bãi Trước, Vũng Tàu',
        bedrooms: 1,
        bathrooms: 1,
        area: 45,
        image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Studio hiện đại tại The Coastal, view biển, đầy đủ nội thất, sẵn sàng ở ngay.',
        type: 'Studio',
        status: 'Nổi bật'
      },
      {
        title: 'Nhà mặt tiền Lê Hồng Phong',
        price: 5500000000,
        location: 'Lê Hồng Phong, Vũng Tàu',
        bedrooms: 4,
        bathrooms: 3,
        area: 150,
        image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Nhà mặt tiền đường Lê Hồng Phong, 4 tầng, thích hợp kinh doanh và ở.',
        type: 'Nhà mặt tiền',
        status: 'Có sẵn'
      },
      {
        title: 'Condotel Ocean Vista',
        price: 2800000000,
        location: 'Thùy Vân, Vũng Tàu',
        bedrooms: 1,
        bathrooms: 1,
        area: 55,
        image_url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Condotel Ocean Vista với view biển 180°, cam kết lợi nhuận cho thuê.',
        type: 'Condotel',
        status: 'Hot'
      },
      {
        title: 'Đất thổ cư Huyện Long Điền',
        price: 1500000000,
        location: 'Long Điền, Bà Rịa - Vũng Tàu',
        bedrooms: 0,
        bathrooms: 0,
        area: 150,
        image_url: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Đất thổ cư 100% tại Long Điền, gần khu công nghiệp, tiềm năng phát triển cao.',
        type: 'Đất thổ cư',
        status: 'Có sẵn'
      }
    ]
    
    // Insert data
    console.log('📝 Inserting sample properties...')
    const { data, error } = await supabase
      .from('properties')
      .insert(properties)
      .select()
    
    if (error) {
      if (error.code === '42P01') {
        console.error('\n❌ Table "properties" does not exist!')
        console.error('📋 Please run the SQL script in Supabase Dashboard first:')
        console.error('   1. Go to SQL Editor in Supabase Dashboard')
        console.error('   2. Copy content from database-setup.sql')
        console.error('   3. Run the SQL to create table')
        console.error('   4. Then run this script again\n')
      } else if (error.code === '23505') {
        console.log('⚠️  Some properties already exist, skipping duplicates...')
      } else {
        throw error
      }
    } else {
      console.log(`✅ Inserted ${data.length} properties successfully!\n`)
    }
    
    // Verify data
    console.log('🔍 Verifying setup...')
    const { count } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
    
    console.log(`✅ Total properties in database: ${count}\n`)
    
    // Show sample
    console.log('📊 Sample properties:')
    const { data: sample } = await supabase
      .from('properties')
      .select('title, type, status, price')
      .limit(3)
    
    sample?.forEach((row, index) => {
      const priceFormatted = (row.price / 1000000000).toFixed(1)
      console.log(`   ${index + 1}. ${row.title} - ${row.type} - ${row.status} - ${priceFormatted}B VNĐ`)
    })
    
    console.log('\n🎉 Database setup completed successfully!')
    console.log('🌐 You can now access your app at http://localhost:8081\n')
    
  } catch (error) {
    console.error('\n❌ Error during setup:', error.message)
    if (error.details) console.error('Details:', error.details)
    if (error.hint) console.error('Hint:', error.hint)
    process.exit(1)
  }
}

// Run setup
setupDatabase()