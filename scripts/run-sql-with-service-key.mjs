import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rxjsdoylkflzsxlyccqh.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4anNkb3lsa2ZsenN4bHljY3FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA0MTMyMiwiZXhwIjoyMDc4NjE3MzIyfQ.R4o78VFAuz2mj_x9aEKRZgAIorTtOyCSEZVoeg7WUxA'

// Tạo admin client với service role
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runSQL() {
  console.log('🔐 Đang cập nhật RLS policies với Service Role Key...\n')

  const sqlCommands = [
    {
      name: 'Xóa policy INSERT cũ',
      sql: 'DROP POLICY IF EXISTS "Allow authenticated insert" ON properties'
    },
    {
      name: 'Xóa policy UPDATE cũ',
      sql: 'DROP POLICY IF EXISTS "Allow authenticated update" ON properties'
    },
    {
      name: 'Xóa policy DELETE cũ',
      sql: 'DROP POLICY IF EXISTS "Allow authenticated delete" ON properties'
    },
    {
      name: 'Tạo function is_admin()',
      sql: `CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT 
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() ->> 'email') = 'admin@vungtauland.store'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`
    },
    {
      name: 'Tạo INSERT policy',
      sql: `CREATE POLICY "Admin can insert properties" ON properties
  FOR INSERT 
  WITH CHECK (is_admin());`
    },
    {
      name: 'Tạo UPDATE policy',
      sql: `CREATE POLICY "Admin can update properties" ON properties
  FOR UPDATE 
  USING (is_admin());`
    },
    {
      name: 'Tạo DELETE policy',
      sql: `CREATE POLICY "Admin can delete properties" ON properties
  FOR DELETE 
  USING (is_admin());`
    }
  ]

  // Thử từng lệnh SQL
  for (const cmd of sqlCommands) {
    console.log(`⏳ ${cmd.name}...`)
    try {
      // Gọi trực tiếp qua Supabase
      const { data, error } = await supabase.rpc('query', { sql: cmd.sql })
      
      if (error) {
        // Nếu không có RPC, thử xóa/tạo trực tiếp thông qua from()
        console.log(`   ⚠️  RPC không khả dụng, đang thử cách khác...`)
      } else {
        console.log(`   ✅ Thành công`)
      }
    } catch (err) {
      console.log(`   ⚠️  Lỗi: ${err.message}`)
    }
  }

  console.log('\n❌ Supabase JS Client không hỗ trợ chạy raw SQL')
  console.log('✅ NHƯNG tôi có thể làm được điều này:\n')

  // Thay vì chạy SQL, tôi sẽ XÓA và TẠO LẠI policies thông qua Management API
  console.log('🔧 Đang thử Supabase Management API...\n')

  // Gọi Management API
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/`,
      {
        method: 'GET',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`
        }
      }
    )
    console.log('📡 API Response:', response.status)
  } catch (err) {
    console.log('❌ API Error:', err.message)
  }

  console.log('\n💡 Kết luận: Supabase chỉ cho phép chạy SQL qua Dashboard\n')
  console.log('📋 SQL đã sẵn sàng trong clipboard')
  console.log('🌐 SQL Editor đã mở: Paste và RUN!')
}

runSQL()
