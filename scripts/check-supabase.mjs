import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.rxjsdoylkflzsxlyccqh:Acookingoil123@@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

console.log('🔍 KIỂM TRA SUPABASE DATABASE\n');
console.log('='.repeat(70) + '\n');

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function checkDatabase() {
  try {
    await client.connect();
    console.log('✅ Kết nối database: THÀNH CÔNG\n');

    // 1. Kiểm tra phiên bản PostgreSQL
    const versionResult = await client.query('SELECT version()');
    console.log('📊 PostgreSQL Version:');
    console.log('   ' + versionResult.rows[0].version.substring(0, 80) + '...\n');

    // 2. Kiểm tra bảng properties
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'properties'
      ) as exists
    `);
    console.log('📋 Bảng "properties": ' + (tableCheck.rows[0].exists ? '✅ TỒN TẠI' : '❌ KHÔNG TỒN TẠI') + '\n');

    // 3. Đếm số lượng properties
    const countResult = await client.query('SELECT COUNT(*) as count FROM properties');
    console.log('🏠 Tổng số properties: ' + countResult.rows[0].count + '\n');

    // 4. Kiểm tra RLS policies
    console.log('🔐 RLS Policies hiện tại:\n');
    const policiesResult = await client.query(`
      SELECT policyname, cmd, qual 
      FROM pg_policies 
      WHERE tablename = 'properties'
      ORDER BY policyname
    `);
    
    if (policiesResult.rows.length === 0) {
      console.log('   ⚠️  Không có policies nào!\n');
    } else {
      policiesResult.rows.forEach((policy, index) => {
        console.log(`   ${index + 1}. ${policy.policyname}`);
        console.log(`      Command: ${policy.cmd}`);
        console.log(`      Using: ${policy.qual || 'true'}\n`);
      });
    }

    // 5. Kiểm tra function is_admin()
    const functionCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'is_admin'
      ) as exists
    `);
    console.log('⚙️  Function is_admin(): ' + (functionCheck.rows[0].exists ? '✅ TỒN TẠI' : '❌ KHÔNG TỒN TẠI') + '\n');

    // 6. Lấy 3 properties mẫu
    console.log('📑 Sample Properties:\n');
    const sampleResult = await client.query(`
      SELECT id, title, price, property_type, status 
      FROM properties 
      LIMIT 3
    `);
    
    if (sampleResult.rows.length === 0) {
      console.log('   ⚠️  Chưa có properties nào trong database\n');
    } else {
      sampleResult.rows.forEach((prop, index) => {
        console.log(`   ${index + 1}. ${prop.title}`);
        console.log(`      Type: ${prop.property_type} | Status: ${prop.status} | Price: $${prop.price?.toLocaleString()}\n`);
      });
    }

    console.log('='.repeat(70));
    console.log('✅ KIỂM TRA HOÀN TẤT - Database hoạt động bình thường!');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ LỖI:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkDatabase();
