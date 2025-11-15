import pg from 'pg'
const { Client } = pg

const client = new Client({
  connectionString: 'postgresql://postgres.rxjsdoylkflzsxlyccqh:Acookingoil123@@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
})

async function checkTableStructure() {
  try {
    await client.connect()
    console.log('🔍 KIỂM TRA CẤU TRÚC BẢNG\n')

    // Check properties table structure
    const propsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'properties'
      ORDER BY ordinal_position
    `)
    
    console.log('📋 PROPERTIES TABLE:')
    console.log(propsColumns.rows.map(r => `  - ${r.column_name} (${r.data_type})`).join('\n'))

    // Check agents table structure
    const agentsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'agents'
      ORDER BY ordinal_position
    `)
    
    console.log('\n📋 AGENTS TABLE:')
    console.log(agentsColumns.rows.map(r => `  - ${r.column_name} (${r.data_type})`).join('\n'))

    // Check inquiries table structure
    const inquiriesColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'inquiries'
      ORDER BY ordinal_position
    `)
    
    console.log('\n📋 INQUIRIES TABLE:')
    console.log(inquiriesColumns.rows.map(r => `  - ${r.column_name} (${r.data_type})`).join('\n'))

    // Check transactions table structure
    const transactionsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'transactions'
      ORDER BY ordinal_position
    `)
    
    console.log('\n📋 TRANSACTIONS TABLE:')
    console.log(transactionsColumns.rows.map(r => `  - ${r.column_name} (${r.data_type})`).join('\n'))

    // Count records in each table
    console.log('\n📊 SỐ LƯỢNG RECORDS:')
    const tables = ['properties', 'property_images', 'categories', 'property_features', 
                    'property_feature_mapping', 'agents', 'favorites', 'property_views',
                    'inquiries', 'reviews', 'transactions', 'notifications', 'profiles']
    
    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM ${table}`)
      console.log(`  - ${table}: ${result.rows[0].count}`)
    }

  } catch (error) {
    console.error('❌ Lỗi:', error.message)
  } finally {
    await client.end()
  }
}

checkTableStructure()
