import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';

const connectionString = 'postgresql://postgres.rxjsdoylkflzsxlyccqh:Acookingoil123@@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

console.log('🚀 KHỞI TẠO COMPLETE DATABASE SCHEMA\n');
console.log('='.repeat(80) + '\n');

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function setupCompleteSchema() {
  try {
    await client.connect();
    console.log('✅ Kết nối database thành công\n');

    // Đọc SQL file
    const sql = fs.readFileSync('database-complete-schema.sql', 'utf8');
    
    console.log('📝 Đang tạo complete database schema...\n');
    console.log('Các bước thực hiện:');
    console.log('  1. Tạo bảng profiles');
    console.log('  2. Tạo bảng agents');
    console.log('  3. Tạo bảng categories');
    console.log('  4. Cập nhật bảng properties (thêm columns)');
    console.log('  5. Tạo bảng property_images');
    console.log('  6. Tạo bảng property_features');
    console.log('  7. Tạo bảng property_feature_mapping');
    console.log('  8. Tạo bảng favorites');
    console.log('  9. Tạo bảng property_views');
    console.log('  10. Tạo bảng inquiries');
    console.log('  11. Tạo bảng reviews');
    console.log('  12. Tạo bảng transactions');
    console.log('  13. Tạo bảng notifications');
    console.log('  14. Tạo bảng saved_searches');
    console.log('  15. Tạo indexes');
    console.log('  16. Tạo triggers');
    console.log('  17. Setup RLS policies');
    console.log('  18. Insert initial data\n');

    // Execute SQL
    await client.query(sql);
    
    console.log('✅ Đã tạo xong toàn bộ schema!\n');

    // Verify tables created
    const tablesResult = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    console.log('📊 CÁC BẢNG ĐÃ TẠO:\n');
    for (const table of tablesResult.rows) {
      console.log(`   ✅ ${table.tablename}`);
    }

    console.log(`\n   Tổng: ${tablesResult.rows.length} bảng\n`);

    // Count foreign keys
    const fkResult = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.table_constraints
      WHERE constraint_type = 'FOREIGN KEY'
        AND table_schema = 'public'
    `);
    console.log(`🔗 Foreign Keys: ${fkResult.rows[0].count}\n`);

    // Count indexes
    const indexResult = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_indexes
      WHERE schemaname = 'public'
    `);
    console.log(`🔍 Indexes: ${indexResult.rows[0].count}\n`);

    // Count RLS policies
    const policyResult = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_policies
      WHERE schemaname = 'public'
    `);
    console.log(`🔐 RLS Policies: ${policyResult.rows[0].count}\n`);

    console.log('='.repeat(80));
    console.log('\n🎉 HOÀN THÀNH! Database schema đã đầy đủ cho hệ thống BĐS!\n');
    console.log('✅ Các tính năng đã sẵn sàng:');
    console.log('   - User profiles & authentication');
    console.log('   - Agent management');
    console.log('   - Categories & features');
    console.log('   - Property management (với nhiều ảnh)');
    console.log('   - Favorites & saved searches');
    console.log('   - Property views tracking');
    console.log('   - Contact inquiries');
    console.log('   - Reviews & ratings');
    console.log('   - Transactions management');
    console.log('   - Notifications system\n');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ LỖI:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

setupCompleteSchema();
