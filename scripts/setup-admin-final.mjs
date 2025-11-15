import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';

const connectionString = 'postgresql://postgres.rxjsdoylkflzsxlyccqh:Acookingoil123@@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

console.log('🔗 Kết nối tới Supabase database...\n');

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function setupAdminPolicies() {
  try {
    await client.connect();
    console.log('✅ KẾT NỐI THÀNH CÔNG!\n');

    // Đọc SQL từ file
    const sql = fs.readFileSync('database-admin-policies.sql', 'utf8');
    
    console.log('📝 Đang chạy SQL để setup admin policies...\n');
    
    // Chạy toàn bộ SQL một lần (vì có function với $$ delimiter)
    await client.query(sql);
    console.log('✅ SQL executed successfully!\n');

    console.log('='.repeat(70));
    console.log('🎉 HOÀN TẤT! Admin RLS policies đã được cập nhật thành công!');
    console.log('='.repeat(70));
    console.log('\n✅ Bây giờ chỉ có admin mới có thể:');
    console.log('   - INSERT properties');
    console.log('   - UPDATE properties');
    console.log('   - DELETE properties\n');
    console.log('📊 Người dùng thường chỉ có thể SELECT (xem) properties\n');
    console.log('🔐 Test ngay: http://localhost:5173/admin');
    console.log('   Email: admin@vungtauland.store');
    console.log('   Pass: admin2026\n');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error);
  } finally {
    await client.end();
    console.log('🔌 Đã ngắt kết nối database.\n');
  }
}

setupAdminPolicies();
