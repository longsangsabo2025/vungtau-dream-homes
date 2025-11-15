import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: 'postgresql://postgres.rxjsdoylkflzsxlyccqh:Acookingoil123@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function setupAdminPolicies() {
  try {
    await client.connect();
    console.log('✅ Đã kết nối database\n');

    // Step 1: Drop old policies
    console.log('1️⃣ Xóa policies cũ...');
    await client.query('DROP POLICY IF EXISTS "Allow authenticated insert" ON properties');
    await client.query('DROP POLICY IF EXISTS "Allow authenticated update" ON properties');
    await client.query('DROP POLICY IF EXISTS "Allow authenticated delete" ON properties');
    console.log('✅ Đã xóa policies cũ\n');

    // Step 2: Create is_admin function
    console.log('2️⃣ Tạo function is_admin()...');
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
    `;
    await client.query(functionSQL);
    console.log('✅ Function created\n');

    // Step 3: Create new policies
    console.log('3️⃣ Tạo admin policies mới...');
    
    await client.query(`
CREATE POLICY "Admin can insert properties" ON properties
  FOR INSERT 
  WITH CHECK (is_admin());
    `);
    console.log('  ✓ INSERT policy');

    await client.query(`
CREATE POLICY "Admin can update properties" ON properties
  FOR UPDATE 
  USING (is_admin());
    `);
    console.log('  ✓ UPDATE policy');

    await client.query(`
CREATE POLICY "Admin can delete properties" ON properties
  FOR DELETE 
  USING (is_admin());
    `);
    console.log('  ✓ DELETE policy');

    // Step 4: Verify policies
    console.log('\n4️⃣ Kiểm tra policies...');
    const result = await client.query(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd
      FROM pg_policies 
      WHERE tablename = 'properties'
      ORDER BY policyname;
    `);
    
    console.log('\n📋 Policies hiện tại:');
    result.rows.forEach(row => {
      console.log(`  - ${row.policyname} (${row.cmd})`);
    });

    console.log('\n✅ Hoàn tất cập nhật RLS policies!');
    console.log('\n🔐 Phân quyền:');
    console.log('  - SELECT: Public (tất cả mọi người)');
    console.log('  - INSERT: Chỉ admin');
    console.log('  - UPDATE: Chỉ admin');
    console.log('  - DELETE: Chỉ admin');

  } catch (err) {
    console.error('\n❌ Lỗi:', err);
  } finally {
    await client.end();
  }
}

setupAdminPolicies();
