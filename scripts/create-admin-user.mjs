import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rxjsdoylkflzsxlyccqh.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4anNkb3lsa2ZsenN4bHljY3FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA0MTMyMiwiZXhwIjoyMDc4NjE3MzIyfQ.U7sLdkUBk7jyqVeaRdGKSv68C_ilDEFYTghDmGbdtWk'

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  console.log('🔧 Tạo tài khoản Admin...\n')

  const adminEmail = 'admin@vungtauland.store'
  const adminPassword = 'Admin@123456'

  try {
    // Check if admin already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const adminExists = existingUsers?.users?.find(u => u.email === adminEmail)

    if (adminExists) {
      console.log('⚠️  Admin user đã tồn tại!')
      console.log('📧 Email:', adminEmail)
      console.log('🔑 Password:', adminPassword)
      console.log('\n🔄 Updating admin metadata...')

      // Update user metadata to ensure admin role
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        adminExists.id,
        {
          user_metadata: { role: 'admin', full_name: 'Admin User' }
        }
      )

      if (updateError) {
        console.error('❌ Lỗi khi update metadata:', updateError.message)
      } else {
        console.log('✅ Đã update admin metadata thành công!')
      }

      return
    }

    // Create new admin user
    const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        full_name: 'Admin User'
      }
    })

    if (signUpError) {
      console.error('❌ Lỗi khi tạo admin:', signUpError.message)
      return
    }

    console.log('✅ Đã tạo tài khoản admin thành công!')
    console.log('\n📋 THÔNG TIN ĐĂNG NHẬP ADMIN:')
    console.log('=' .repeat(50))
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', adminPassword)
    console.log('👤 User ID:', newUser?.user?.id)
    console.log('=' .repeat(50))
    console.log('\n✅ Bạn có thể đăng nhập ngay bây giờ!')

  } catch (error) {
    console.error('❌ Lỗi:', error)
  }
}

createAdminUser()
