import pkg from 'pg';
const { Client } = pkg;

// Thử cả 2 cách: với password từ .env và với service role key
const attempts = [
  {
    name: 'Session Pooler (Port 5432)',
    config: {
      host: 'aws-0-ap-southeast-1.pooler.supabase.com',
      port: 5432,
      database: 'postgres',
      user: 'postgres.rxjsdoylkflzsxlyccqh',
      password: 'Acookingoil123',
      ssl: { rejectUnauthorized: false }
    }
  },
  {
    name: 'Transaction Pooler (Port 6543)',
    config: {
      host: 'aws-0-ap-southeast-1.pooler.supabase.com',
      port: 6543,
      database: 'postgres',
      user: 'postgres.rxjsdoylkflzsxlyccqh',
      password: 'Acookingoil123',
      ssl: { rejectUnauthorized: false }
    }
  },
  {
    name: 'Direct Connection (Port 5432)',
    config: {
      host: 'db.rxjsdoylkflzsxlyccqh.supabase.co',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: 'Acookingoil123',
      ssl: { rejectUnauthorized: false }
    }
  }
];

async function testAllConnections() {
  console.log('🔌 Kiểm tra các phương thức kết nối Supabase...\n');

  for (const attempt of attempts) {
    console.log(`\n📋 Thử kết nối: ${attempt.name}`);
    console.log(`   Host: ${attempt.config.host}`);
    console.log(`   Port: ${attempt.config.port}`);
    console.log(`   User: ${attempt.config.user || 'postgres'}`);
    
    const client = new Client({
      ...attempt.config,
      connectionTimeoutMillis: 10000,
    });

    try {
      console.log('   ⏳ Đang kết nối...');
      await client.connect();
      console.log('   ✅ KẾT NỐI THÀNH CÔNG!\n');

      // Test query
      const result = await client.query('SELECT version();');
      console.log('   📊 PostgreSQL:', result.rows[0].version.split(',')[0]);

      // Check properties
      const countResult = await client.query('SELECT COUNT(*) FROM properties');
      console.log(`   📊 Số BĐS: ${countResult.rows[0].count}`);

      // Check policies
      const policiesResult = await client.query(`
        SELECT policyname, cmd
        FROM pg_policies 
        WHERE tablename = 'properties'
        ORDER BY policyname;
      `);
      console.log(`   🔒 Policies: ${policiesResult.rows.length} policies`);
      for (const row of policiesResult.rows) {
        console.log(`      - ${row.policyname} (${row.cmd})`);
      }

      await client.end();
      console.log('\n   ✅ PHƯƠNG THỨC NÀY HOẠT ĐỘNG!');
      console.log(`\n🎉 Sử dụng: ${attempt.name}`);
      return { success: true, method: attempt.name, config: attempt.config };

    } catch (error) {
      console.log(`   ❌ Thất bại: ${error.message}`);
      try {
        await client.end();
      } catch (e) {
        // Ignore
      }
    }
  }

  console.log('\n❌ Tất cả phương thức đều thất bại!');
  console.log('\n💡 Cần lấy password từ Supabase Dashboard:');
  console.log('   1. Vào: https://supabase.com/dashboard/project/rxjsdoylkflzsxlyccqh/settings/database');
  console.log('   2. Tìm "Database Password" hoặc "Reset Database Password"');
  console.log('   3. Copy password mới');
  return { success: false };
}

testAllConnections();
