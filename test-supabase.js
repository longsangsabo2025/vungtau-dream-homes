// Test script để kiểm tra kết nối Supabase
import { supabase } from './src/lib/supabase.js'

async function testSupabaseConnection() {
  console.log('🔄 Testing Supabase connection...')
  
  try {
    // Test 1: Kiểm tra connection
    const { data, error } = await supabase
      .from('properties')
      .select('count(*)', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Connection error:', error.message)
      return false
    }
    
    console.log('✅ Connection successful!')
    console.log(`📊 Found ${data?.length || 0} properties in database`)
    
    // Test 2: Lấy một vài records để test
    const { data: properties, error: fetchError } = await supabase
      .from('properties')
      .select('id, title, price, type, status')
      .limit(3)
    
    if (fetchError) {
      console.error('❌ Fetch error:', fetchError.message)
      return false
    }
    
    console.log('✅ Sample data retrieved:')
    properties?.forEach((prop, index) => {
      console.log(`  ${index + 1}. ${prop.title} - ${prop.type} - ${prop.status}`)
    })
    
    return true
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return false
  }
}

// Chạy test
testSupabaseConnection().then(success => {
  if (success) {
    console.log('\n🎉 All tests passed! Supabase is ready to use.')
  } else {
    console.log('\n💥 Some tests failed. Please check your configuration.')
  }
})