import { createClient } from '@supabase/supabase-js'

// Load từ .env file
const supabaseUrl = 'https://rxjsdoylkflzsxlyccqh.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4anNkb3lsa2ZsenN4bHljY3FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA0MTMyMiwiZXhwIjoyMDc4NjE3MzIyfQ.R4o78VFAuz2mj_x9aEKRZgAIorTtOyCSEZVoeg7WUxA'

// Sử dụng service role key để tạo admin
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  const adminEmail = 'admin@vungtauland.store'
  const adminPassword = 'admin2026'

  console.log('🔐 Đang tạo tài khoản admin...')
  console.log(`Email: ${adminEmail}`)
  console.log(`Password: ${adminPassword}`)
  console.log('')

  try {
    // Xóa user cũ nếu tồn tại
    try {
      const { data: users } = await supabase.auth.admin.listUsers()
      const existingUser = users.users.find(u => u.email === adminEmail)
      if (existingUser) {
        console.log('🗑️  Đang xóa tài khoản cũ...')
        await supabase.auth.admin.deleteUser(existingUser.id)
        console.log('✅ Đã xóa tài khoản cũ')
      }
    } catch (e) {
      // Ignore if user doesn't exist
    }

    // Tạo user với service role (bypass email confirmation)
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        full_name: 'Administrator',
        created_by: 'script'
      }
    })

    if (error) {
      console.error('❌ Lỗi khi tạo admin:', error.message)
      return
    }

    console.log('✅ Tạo tài khoản admin thành công!')
    console.log('')
    console.log('📋 Thông tin đăng nhập:')
    console.log('-----------------------------------')
    console.log(`Email:    ${adminEmail}`)
    console.log(`Password: ${adminPassword}`)
    console.log('-----------------------------------')
    console.log('')
    console.log('User ID:', data.user?.id)
    console.log('')
    console.log('⚠️  LƯU Ý: Hãy đổi mật khẩu sau khi đăng nhập lần đầu!')
    
  } catch (err) {
    console.error('❌ Lỗi:', err)
  }
}

createAdminUser()
