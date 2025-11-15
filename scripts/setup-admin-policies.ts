import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rxjsdoylkflzsxlyccqh.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4anNkb3lsa2ZsenN4bHljY3FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA0MTMyMiwiZXhwIjoyMDc4NjE3MzIyfQ.R4o78VFAuz2mj_x9aEKRZgAIorTtOyCSEZVoeg7WUxA'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupAdminPolicies() {
  console.log('🔐 Đang cập nhật RLS policies cho admin...\n')

  try {
    // Drop old policies
    console.log('1️⃣ Xóa policies cũ...')
    await supabase.rpc('exec_sql', { 
      sql: 'DROP POLICY IF EXISTS "Allow authenticated insert" ON properties'
    }).catch(() => {}) // Ignore errors if policy doesn't exist
    
    await supabase.rpc('exec_sql', { 
      sql: 'DROP POLICY IF EXISTS "Allow authenticated update" ON properties'
    }).catch(() => {})
    
    await supabase.rpc('exec_sql', { 
      sql: 'DROP POLICY IF EXISTS "Allow authenticated delete" ON properties'
    }).catch(() => {})
    
    console.log('✅ Đã xóa policies cũ\n')

    // Create is_admin function
    console.log('2️⃣ Tạo function is_admin()...')
    const functionSQL = `
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT 
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() ->> 'email') = 'admin@vungtauland.store'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `
    
    await supabase.rpc('exec_sql', { sql: functionSQL })
    console.log('✅ Function created\n')

    // Create new policies
    console.log('3️⃣ Tạo admin policies mới...')
    
    const insertPolicySQL = `
CREATE POLICY "Admin can insert properties" ON properties
  FOR INSERT 
  WITH CHECK (is_admin());
    `
    await supabase.rpc('exec_sql', { sql: insertPolicySQL })
    console.log('  ✓ INSERT policy')

    const updatePolicySQL = `
CREATE POLICY "Admin can update properties" ON properties
  FOR UPDATE 
  USING (is_admin());
    `
    await supabase.rpc('exec_sql', { sql: updatePolicySQL })
    console.log('  ✓ UPDATE policy')

    const deletePolicySQL = `
CREATE POLICY "Admin can delete properties" ON properties
  FOR DELETE 
  USING (is_admin());
    `
    await supabase.rpc('exec_sql', { sql: deletePolicySQL })
    console.log('  ✓ DELETE policy')

    console.log('\n✅ Hoàn tất cập nhật RLS policies!')
    console.log('\n📋 Policies hiện tại:')
    console.log('  - SELECT: Public (tất cả mọi người)')
    console.log('  - INSERT: Chỉ admin')
    console.log('  - UPDATE: Chỉ admin')
    console.log('  - DELETE: Chỉ admin')
    
  } catch (err: any) {
    console.error('\n❌ Lỗi:', err.message)
    console.log('\n💡 Hướng dẫn thực hiện thủ công:')
    console.log('1. Vào Supabase Dashboard: https://supabase.com/dashboard/project/rxjsdoylkflzsxlyccqh/editor')
    console.log('2. Chọn SQL Editor')
    console.log('3. Copy nội dung file: database-admin-policies.sql')
    console.log('4. Paste vào SQL Editor và Run')
  }
}

setupAdminPolicies()
