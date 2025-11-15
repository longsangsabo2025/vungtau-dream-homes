import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.rxjsdoylkflzsxlyccqh:Acookingoil123@@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

console.log('🔍 KIỂM TRA CẤU TRÚC BẢNG PROPERTIES\n');

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function checkTableStructure() {
  try {
    await client.connect();
    console.log('✅ Đã kết nối database\n');

    // Lấy tất cả columns của bảng properties
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'properties'
      ORDER BY ordinal_position
    `);

    console.log('📊 CẤU TRÚC BẢNG PROPERTIES:\n');
    console.log('='.repeat(80) + '\n');
    
    columnsResult.rows.forEach((col, index) => {
      console.log(`${index + 1}. ${col.column_name}`);
      console.log(`   Type: ${col.data_type}`);
      console.log(`   Nullable: ${col.is_nullable}`);
      if (col.column_default) {
        console.log(`   Default: ${col.column_default.substring(0, 60)}`);
      }
      console.log('');
    });

    console.log('='.repeat(80) + '\n');

    // Lấy sample data với đúng tên cột
    const sampleResult = await client.query('SELECT * FROM properties LIMIT 1');
    
    if (sampleResult.rows.length > 0) {
      console.log('📋 SAMPLE DATA (1 record):\n');
      const record = sampleResult.rows[0];
      Object.keys(record).forEach(key => {
        let value = record[key];
        if (value && typeof value === 'object') {
          value = JSON.stringify(value).substring(0, 50);
        }
        console.log(`   ${key}: ${value}`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('❌ LỖI:', error.message);
  } finally {
    await client.end();
  }
}

checkTableStructure();
