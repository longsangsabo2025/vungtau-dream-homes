import pkg from 'pg';
const { Client } = pkg;

console.log('🔍 Testing với password đúng: Acookingoil123@\n');

const connectionStrings = [
  {
    name: 'Transaction Pooler (port 6543)',
    config: {
      host: 'aws-0-ap-southeast-1.pooler.supabase.com',
      port: 6543,
      database: 'postgres',
      user: 'postgres.rxjsdoylkflzsxlyccqh',
      password: 'Acookingoil123@',
      ssl: { rejectUnauthorized: false }
    }
  },
  {
    name: 'Session Pooler (port 5432)',
    config: {
      host: 'aws-0-ap-southeast-1.pooler.supabase.com',
      port: 5432,
      database: 'postgres',
      user: 'postgres.rxjsdoylkflzsxlyccqh',
      password: 'Acookingoil123@',
      ssl: { rejectUnauthorized: false }
    }
  },
  {
    name: 'Direct Connection',
    config: {
      host: 'db.rxjsdoylkflzsxlyccqh.supabase.co',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: 'Acookingoil123@',
      ssl: { rejectUnauthorized: false }
    }
  }
];

async function testConnection(config, name) {
  console.log(`\n📋 ${name}`);
  console.log(`   Host: ${config.host}:${config.port}`);
  console.log(`   User: ${config.user}`);
  
  const client = new Client(config);

  try {
    console.log('   ⏳ Connecting...');
    await client.connect();
    console.log('   ✅ KẾT NỐI THÀNH CÔNG!\n');

    const result = await client.query('SELECT version()');
    console.log('   📊 PostgreSQL:', result.rows[0].version.substring(0, 60));
    
    await client.end();
    return true;
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    try { await client.end(); } catch (e) { /* ignore */ }
    return false;
  }
}

async function runTests() {
  for (const conn of connectionStrings) {
    const success = await testConnection(conn.config, conn.name);
    if (success) {
      console.log('\n' + '='.repeat(70));
      console.log(`🎉 THÀNH CÔNG với: ${conn.name}`);
      console.log('='.repeat(70));
      return conn;
    }
  }
  
  console.log('\n❌ Tất cả đều thất bại. Cần kiểm tra lại credentials từ Dashboard.');
  return null;
}

runTests();
