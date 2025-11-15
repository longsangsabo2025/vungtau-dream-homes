import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://rxjsdoylkflzsxlyccqh.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4anNkb3lsa2ZsenN4bHljY3FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA0MTMyMiwiZXhwIjoyMDc4NjE3MzIyfQ.R4o78VFAuz2mj_x9aEKRZgAIorTtOyCSEZVoeg7WUxA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupAdminPolicies() {
  console.log('🔐 Đang cập nhật RLS policies cho admin...\n')

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
      name: 'Tạo INSERT policy cho admin',
      sql: `CREATE POLICY "Admin can insert properties" ON properties
  FOR INSERT 
  WITH CHECK (is_admin());`
    },
    {
      name: 'Tạo UPDATE policy cho admin',
      sql: `CREATE POLICY "Admin can update properties" ON properties
  FOR UPDATE 
  USING (is_admin());`
    },
    {
      name: 'Tạo DELETE policy cho admin',
      sql: `CREATE POLICY "Admin can delete properties" ON properties
  FOR DELETE 
  USING (is_admin());`
    }
  ]

  for (const command of sqlCommands) {
    try {
      console.log(`⏳ ${command.name}...`)
      const { error } = await supabase.rpc('exec_sql', { query: command.sql })
      
      if (error) {
        // Nếu không có RPC function, thử cách khác
        console.log(`⚠️  Không thể dùng RPC, cần chạy SQL thủ công`)
        break
      }
      console.log(`✅ ${command.name} - Thành công`)
    } catch (err) {
      console.log(`⚠️  ${command.name} - Cần chạy thủ công`)
    }
  }

  console.log('\n📝 Do Supabase không có RPC function, bạn cần:')
  console.log('1. Vào: https://supabase.com/dashboard/project/rxjsdoylkflzsxlyccqh/sql/new')
  console.log('2. Copy SQL từ file: database-admin-policies.sql')
  console.log('3. Paste và RUN\n')
  
  console.log('Hoặc copy SQL này:\n')
  console.log('='
.repeat(70))
  const fullSQL = fs.readFileSync('database-admin-policies.sql', 'utf-8')
  console.log(fullSQL)
  console.log('='.repeat(70))
}

setupAdminPolicies()
