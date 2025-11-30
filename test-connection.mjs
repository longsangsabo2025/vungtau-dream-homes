import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 KIỂM TRA KẾT NỐI SUPABASE\n')
console.log('=' .repeat(50))
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey ? '✅ Có' : '❌ Không có')
console.log('=' .repeat(50) + '\n')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Thiếu environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    // Test 1: Kiểm tra kết nối cơ bản
    console.log('📡 Test 1: Kết nối cơ bản...')
    const { data: healthCheck, error: healthError } = await supabase
      .from('properties')
      .select('count', { count: 'exact', head: true })
    
    if (healthError) {
      console.error('❌ Lỗi:', healthError.message)
      return
    }
    console.log('✅ Kết nối thành công!\n')

    // Test 2: Đếm số properties
    console.log('📊 Test 2: Đếm số properties...')
    const { count, error: countError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Lỗi:', countError.message)
    } else {
      console.log(`✅ Tổng số properties: ${count}\n`)
    }

    // Test 3: Lấy một vài properties mẫu
    console.log('🏠 Test 3: Lấy 3 properties mẫu...')
    const { data: properties, error: fetchError } = await supabase
      .from('properties')
      .select('id, title, price, location')
      .limit(3)
    
    if (fetchError) {
      console.error('❌ Lỗi:', fetchError.message)
    } else {
      console.log('✅ Lấy dữ liệu thành công!')
      properties.forEach((prop, idx) => {
        console.log(`   ${idx + 1}. ${prop.title} - ${prop.price?.toLocaleString('vi-VN')} VNĐ`)
      })
      console.log()
    }

    // Test 4: Kiểm tra auth
    console.log('🔐 Test 4: Kiểm tra auth...')
    const { data: { session } } = await supabase.auth.getSession()
    console.log(session ? '✅ Có session đang hoạt động' : '⚪ Chưa đăng nhập')
    
    console.log('\n' + '='.repeat(50))
    console.log('✅ TẤT CẢ TESTS HOÀN THÀNH!')
    console.log('='.repeat(50))

  } catch (error) {
    console.error('❌ Lỗi không mong đợi:', error)
  }
}

testConnection()
