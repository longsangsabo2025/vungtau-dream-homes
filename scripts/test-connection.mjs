import pkg from 'pg';
const { Client } = pkg;

// Lấy connection string từ .env
const connectionString = 'postgresql://postgres.rxjsdoylkflzsxlyccqh:Acookingoil123@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

async function testConnection() {
  console.log('🔌 Đang kiểm tra kết nối Supabase Transaction Pooler...\n');
  console.log('📋 Thông tin kết nối:');
  console.log('   Host: aws-1-ap-southeast-1.pooler.supabase.com');
  console.log('   Port: 6543');
  console.log('   Database: postgres');
  console.log('   User: postgres.rxjsdoylkflzsxlyccqh\n');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('⏳ Đang kết nối...');
    await client.connect();
    console.log('✅ Kết nối thành công!\n');

    // Test query
    console.log('🔍 Đang test query...');
    const result = await client.query('SELECT version();');
    console.log('✅ Query thành công!');
    console.log('📊 PostgreSQL Version:', result.rows[0].version.split(',')[0]);
    console.log('');

    // Check properties table
    console.log('📋 Kiểm tra bảng properties...');
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'properties'
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ Bảng properties tồn tại');
      
      // Count properties
      const countResult = await client.query('SELECT COUNT(*) FROM properties');
      console.log(`📊 Số lượng BĐS: ${countResult.rows[0].count}`);
    } else {
      console.log('❌ Bảng properties không tồn tại');
    }
    console.log('');

    // Check RLS policies
    console.log('🔒 Kiểm tra RLS policies...');
    const policiesResult = await client.query(`
      SELECT schemaname, tablename, policyname, permissive, cmd
      FROM pg_policies 
      WHERE tablename = 'properties'
      ORDER BY policyname;
    `);
    
    if (policiesResult.rows.length > 0) {
      console.log(`✅ Tìm thấy ${policiesResult.rows.length} policies:`);
      policiesResult.rows.forEach(row => {
        console.log(`   - ${row.policyname} (${row.cmd})`);
      });
    } else {
      console.log('⚠️  Không tìm thấy policies nào');
    }
    console.log('');

    console.log('✅ Tất cả kiểm tra hoàn tất!');
    console.log('🎉 Connection pooler hoạt động bình thường!');

  } catch (error) {
    console.error('❌ Lỗi kết nối:', error.message);
    console.error('\n🔍 Chi tiết lỗi:');
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Gợi ý: Không thể kết nối đến server');
    } else if (error.code === '28P01') {
      console.error('\n💡 Gợi ý: Sai password hoặc authentication');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Gợi ý: Không tìm thấy host');
    }
  } finally {
    await client.end();
    console.log('\n🔌 Đã đóng kết nối');
  }
}

testConnection();
