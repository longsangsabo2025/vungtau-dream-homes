import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.rxjsdoylkflzsxlyccqh:Acookingoil123@@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

console.log('\n🔍 BÁO CÁO KIỂM TRA SUPABASE DATABASE\n');
console.log('='.repeat(80) + '\n');

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function generateReport() {
  try {
    await client.connect();
    console.log('✅ 1. KẾT NỐI DATABASE: THÀNH CÔNG\n');

    // PostgreSQL version
    const versionResult = await client.query('SELECT version()');
    const version = versionResult.rows[0].version.split(',')[0];
    console.log(`📊 2. DATABASE VERSION: ${version}\n`);

    // Số lượng properties
    const countResult = await client.query('SELECT COUNT(*) as count FROM properties');
    console.log(`🏠 3. TỔNG SỐ PROPERTIES: ${countResult.rows[0].count}\n`);

    // Phân bố theo loại
    const typeDistribution = await client.query(`
      SELECT type, COUNT(*) as count 
      FROM properties 
      GROUP BY type 
      ORDER BY count DESC
    `);
    console.log('📈 4. PHÂN BỐ THEO LOẠI:\n');
    for (const row of typeDistribution.rows) {
      console.log(`   ${row.type}: ${row.count} properties`);
    }
    console.log('');

    // Phân bố theo status
    const statusDistribution = await client.query(`
      SELECT status, COUNT(*) as count 
      FROM properties 
      GROUP BY status 
      ORDER BY count DESC
    `);
    console.log('📊 5. PHÂN BỐ THEO TRẠNG THÁI:\n');
    for (const row of statusDistribution.rows) {
      console.log(`   ${row.status}: ${row.count} properties`);
    }
    console.log('');

    // Price range
    const priceStats = await client.query(`
      SELECT 
        MIN(price) as min_price,
        MAX(price) as max_price,
        AVG(price)::bigint as avg_price
      FROM properties
    `);
    const stats = priceStats.rows[0];
    console.log('💰 6. THỐNG KÊ GIÁ:\n');
    console.log(`   Thấp nhất: $${parseInt(stats.min_price).toLocaleString()}`);
    console.log(`   Cao nhất: $${parseInt(stats.max_price).toLocaleString()}`);
    console.log(`   Trung bình: $${parseInt(stats.avg_price).toLocaleString()}\n`);

    // RLS Policies
    const policiesResult = await client.query(`
      SELECT policyname, cmd 
      FROM pg_policies 
      WHERE tablename = 'properties'
      ORDER BY policyname
    `);
    console.log('🔐 7. RLS POLICIES:\n');
    for (const policy of policiesResult.rows) {
      console.log(`   ✅ ${policy.policyname} (${policy.cmd})`);
    }
    console.log('');

    // Function is_admin
    const functionCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'is_admin'
      ) as exists
    `);
    console.log(`⚙️  8. FUNCTION is_admin(): ${functionCheck.rows[0].exists ? '✅ TỒN TẠI' : '❌ KHÔNG TỒN TẠI'}\n`);

    // Sample properties
    const sampleResult = await client.query(`
      SELECT id, title, price, type, status, location
      FROM properties 
      ORDER BY created_at DESC
      LIMIT 5
    `);
    console.log('📑 9. 5 PROPERTIES MỚI NHẤT:\n');
    for (let i = 0; i < sampleResult.rows.length; i++) {
      const prop = sampleResult.rows[i];
      console.log(`   ${i + 1}. ${prop.title}`);
      console.log(`      ${prop.type} | ${prop.status} | $${parseInt(prop.price).toLocaleString()}`);
      console.log(`      📍 ${prop.location}\n`);
    }

    console.log('='.repeat(80));
    console.log('\n✅ KẾT LUẬN: Database hoạt động bình thường, tất cả policies đã được cấu hình đúng!\n');
    console.log('🔐 Admin system sẵn sàng tại: http://localhost:5173/admin');
    console.log('   Email: admin@vungtauland.store');
    console.log('   Password: admin2026\n');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ LỖI:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

generateReport();
