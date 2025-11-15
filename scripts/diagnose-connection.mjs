import pkg from 'pg';
const { Client } = pkg;

console.log('🔍 Kiểm tra chi tiết connection string...\n');

// Thử các variations khác nhau
const connectionStrings = [
  {
    name: 'Connection String từ .env (Transaction Pooler)',
    url: 'postgresql://postgres.rxjsdoylkflzsxlyccqh:Acookingoil123@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres'
  },
  {
    name: 'Connection String (Session Pooler)',
    url: 'postgresql://postgres.rxjsdoylkflzsxlyccqh:Acookingoil123@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres'
  },
  {
    name: 'Connection String (Direct - Mode Session)',
    url: 'postgresql://postgres:Acookingoil123@db.rxjsdoylkflzsxlyccqh.supabase.co:5432/postgres'
  },
  {
    name: 'Connection String (IPv6 Mode)',
    url: 'postgresql://postgres.rxjsdoylkflzsxlyccqh:Acookingoil123@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require'
  }
];

async function testConnectionString(connString, name) {
  console.log(`\n📋 Testing: ${name}`);
  console.log(`   URL: ${connString.substring(0, 50)}...`);
  
  const client = new Client({
    connectionString: connString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('   ⏳ Connecting...');
    await client.connect();
    console.log('   ✅ KẾT NỐI THÀNH CÔNG!\n');

    const result = await client.query('SELECT version()');
    console.log('   📊', result.rows[0].version.substring(0, 50));
    
    await client.end();
    return true;
  } catch (error) {
    console.log(`   ❌ ${error.message}`);
    if (error.code) console.log(`   Code: ${error.code}`);
    
    try { await client.end(); } catch (e) {}
    return false;
  }
}

async function diagnose() {
  console.log('Thông tin từ .env:');
  console.log('  VITE_SUPABASE_URL: https://rxjsdoylkflzsxlyccqh.supabase.co');
  console.log('  Project Ref: rxjsdoylkflzsxlyccqh');
  console.log('  Database Password: Acookingoil123');
  console.log('\n' + '='.repeat(70) + '\n');

  for (const conn of connectionStrings) {
    const success = await testConnectionString(conn.url, conn.name);
    if (success) {
      console.log(`\n🎉 PHƯƠNG THỨC HOẠT ĐỘNG: ${conn.name}`);
      console.log(`\n✅ Sử dụng connection string này:`);
      console.log(conn.url);
      return;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n❌ TẤT CẢ CONNECTION STRINGS ĐỀU THẤT BẠI\n');
  console.log('💡 Nguyên nhân có thể:');
  console.log('   1. Password không đúng (Acookingoil123)');
  console.log('   2. Pooler hostname sai (aws-X-ap-southeast-1)');
  console.log('   3. Database pooler bị disable trong Supabase');
  console.log('   4. Firewall/Network blocking port 5432/6543\n');
  
  console.log('📝 Cần lấy thông tin chính xác từ Supabase Dashboard:');
  console.log('   Settings > Database > Connection String');
  console.log('   Hoặc: Settings > Database > Connection Pooling\n');
}

diagnose();
