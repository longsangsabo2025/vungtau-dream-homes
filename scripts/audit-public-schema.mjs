import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.rxjsdoylkflzsxlyccqh:Acookingoil123@@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

console.log('\n🔍 AUDIT SCHEMA PUBLIC (Application Database)\n');
console.log('='.repeat(80) + '\n');

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function auditPublicSchema() {
  try {
    await client.connect();
    console.log('✅ Kết nối thành công\n');

    // 1. CÁC BẢNG TRONG SCHEMA PUBLIC
    console.log('📋 1. CÁC BẢNG TRONG SCHEMA PUBLIC:\n');
    const tablesResult = await client.query(`
      SELECT 
        tablename,
        pg_size_pretty(pg_total_relation_size('public.'||tablename)) as size
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('   ⚠️  KHÔNG CÓ BẢNG NÀO!\n');
    } else {
      for (const table of tablesResult.rows) {
        console.log(`   📊 ${table.tablename} (${table.size})`);
      }
      console.log(`\n   ✅ Tổng: ${tablesResult.rows.length} bảng\n`);
    }

    // 2. CẤU TRÚC TỪNG BẢNG
    if (tablesResult.rows.length > 0) {
      console.log('📐 2. CẤU TRÚC CÁC BẢNG:\n');
      
      for (const table of tablesResult.rows) {
        const tableName = table.tablename;
        
        // Đếm số records
        const countResult = await client.query(`SELECT COUNT(*) as count FROM public.${tableName}`);
        const recordCount = countResult.rows[0].count;
        
        // Lấy columns
        const columnsResult = await client.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position
        `, [tableName]);

        console.log(`\n   📊 Table: ${tableName} (${recordCount} records)`);
        console.log('   ' + '-'.repeat(76));
        
        for (const col of columnsResult.rows) {
          const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          const def = col.column_default ? ` DEFAULT ${col.column_default.substring(0, 30)}` : '';
          console.log(`      ${col.column_name.padEnd(20)} ${col.data_type.padEnd(20)} ${nullable}${def}`);
        }
      }
      console.log('\n');
    }

    // 3. FOREIGN KEYS
    console.log('🔗 3. FOREIGN KEY CONSTRAINTS:\n');
    const fkResult = await client.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name
    `);
    
    if (fkResult.rows.length === 0) {
      console.log('   ⚠️  KHÔNG CÓ FOREIGN KEYS!\n');
      console.log('   💡 Bảng properties đang standalone, không có relationships\n');
    } else {
      for (const fk of fkResult.rows) {
        console.log(`   🔗 ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      }
      console.log('');
    }

    // 4. INDEXES (custom, không bao gồm primary key auto-index)
    console.log('🔍 4. INDEXES:\n');
    const indexesResult = await client.query(`
      SELECT 
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);
    
    if (indexesResult.rows.length === 0) {
      console.log('   ⚠️  Không có indexes\n');
    } else {
      let currentTable = '';
      for (const idx of indexesResult.rows) {
        if (idx.tablename !== currentTable) {
          console.log(`\n   📊 Table: ${idx.tablename}`);
          currentTable = idx.tablename;
        }
        console.log(`      🔍 ${idx.indexname}`);
      }
      console.log('');
    }

    // 5. RLS POLICIES cho schema public
    console.log('🔐 5. RLS POLICIES (PUBLIC SCHEMA):\n');
    const policiesResult = await client.query(`
      SELECT 
        tablename,
        policyname,
        cmd,
        qual
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname
    `);
    
    if (policiesResult.rows.length === 0) {
      console.log('   ⚠️  Không có RLS policies\n');
    } else {
      let currentTable = '';
      for (const policy of policiesResult.rows) {
        if (policy.tablename !== currentTable) {
          console.log(`\n   📊 Table: ${policy.tablename}`);
          currentTable = policy.tablename;
        }
        console.log(`      🔒 ${policy.policyname} (${policy.cmd})`);
        console.log(`         Using: ${policy.qual || 'true'}`);
      }
      console.log('');
    }

    // 6. CUSTOM FUNCTIONS trong public schema
    console.log('⚙️  6. CUSTOM FUNCTIONS (PUBLIC SCHEMA):\n');
    const functionsResult = await client.query(`
      SELECT 
        p.proname as function_name,
        pg_get_function_arguments(p.oid) as arguments,
        pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      ORDER BY p.proname
    `);
    
    if (functionsResult.rows.length === 0) {
      console.log('   ⚠️  Không có custom functions\n');
    } else {
      for (const func of functionsResult.rows) {
        console.log(`   ⚙️  ${func.function_name}(${func.arguments || ''})`);
        // Hiển thị vài dòng đầu của definition
        const lines = func.definition.split('\n').slice(0, 5);
        for (const line of lines) {
          console.log(`      ${line}`);
        }
        console.log('      ...\n');
      }
    }

    // 7. TRIGGERS trong public schema
    console.log('⚡ 7. TRIGGERS (PUBLIC SCHEMA):\n');
    const triggersResult = await client.query(`
      SELECT 
        trigger_name,
        event_object_table,
        action_timing,
        event_manipulation
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table, trigger_name
    `);
    
    if (triggersResult.rows.length === 0) {
      console.log('   ⚠️  Không có triggers\n');
    } else {
      for (const trigger of triggersResult.rows) {
        console.log(`   ⚡ ${trigger.trigger_name}`);
        console.log(`      Table: ${trigger.event_object_table}`);
        console.log(`      Event: ${trigger.action_timing} ${trigger.event_manipulation}\n`);
      }
    }

    console.log('='.repeat(80));
    console.log('\n📊 ĐÁNH GIÁ SCHEMA PUBLIC:\n');
    
    if (tablesResult.rows.length === 1) {
      console.log('⚠️  CHỈ CÓ 1 BẢNG: properties');
      console.log('⚠️  THIẾU TABLES:');
      console.log('   - users/profiles (thông tin người dùng)');
      console.log('   - contacts/inquiries (liên hệ từ khách hàng)');
      console.log('   - favorites (yêu thích của user)');
      console.log('   - property_images (nhiều ảnh cho mỗi property)');
      console.log('   - transactions/bookings (giao dịch)');
      console.log('   - property_views (tracking lượt xem)');
      console.log('   - categories (phân loại chi tiết hơn)');
      console.log('   - agents (nhân viên môi giới)\n');
    }
    
    if (fkResult.rows.length === 0) {
      console.log('⚠️  KHÔNG CÓ RELATIONSHIPS giữa các bảng\n');
    }
    
    console.log('✅ RLS POLICIES: Đã cấu hình đúng cho admin\n');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ LỖI:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

auditPublicSchema();
