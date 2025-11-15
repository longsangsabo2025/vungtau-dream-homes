import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.rxjsdoylkflzsxlyccqh:Acookingoil123@@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

console.log('\n🔍 FULL DATABASE AUDIT\n');
console.log('='.repeat(80) + '\n');

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function fullAudit() {
  try {
    await client.connect();
    console.log('✅ Kết nối thành công\n');

    // 1. KIỂM TRA TẤT CẢ CÁC SCHEMA
    console.log('📂 1. DATABASE SCHEMAS:\n');
    const schemasResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY schema_name
    `);
    for (const row of schemasResult.rows) {
      console.log(`   📁 ${row.schema_name}`);
    }
    console.log('');

    // 2. KIỂM TRA TẤT CẢ CÁC BẢNG (tất cả schema)
    console.log('📋 2. TẤT CẢ CÁC BẢNG TRONG DATABASE:\n');
    const tablesResult = await client.query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
      FROM pg_tables
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schemaname, tablename
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('   ⚠️  KHÔNG CÓ BẢNG NÀO (ngoài system tables)!\n');
    } else {
      for (const table of tablesResult.rows) {
        console.log(`   📊 ${table.schemaname}.${table.tablename} (${table.size})`);
      }
      console.log(`\n   Tổng: ${tablesResult.rows.length} bảng\n`);
    }

    // 3. KIỂM TRA VIEWS
    console.log('👁️  3. VIEWS:\n');
    const viewsResult = await client.query(`
      SELECT schemaname, viewname
      FROM pg_views
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schemaname, viewname
    `);
    
    if (viewsResult.rows.length === 0) {
      console.log('   ⚠️  Không có views\n');
    } else {
      for (const view of viewsResult.rows) {
        console.log(`   👁️  ${view.schemaname}.${view.viewname}`);
      }
      console.log('');
    }

    // 4. KIỂM TRA FUNCTIONS
    console.log('⚙️  4. STORED FUNCTIONS:\n');
    const functionsResult = await client.query(`
      SELECT 
        n.nspname as schema,
        p.proname as function_name,
        pg_get_function_arguments(p.oid) as arguments
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY n.nspname, p.proname
    `);
    
    if (functionsResult.rows.length === 0) {
      console.log('   ⚠️  Không có custom functions\n');
    } else {
      for (const func of functionsResult.rows) {
        console.log(`   ⚙️  ${func.schema}.${func.function_name}(${func.arguments || ''})`);
      }
      console.log(`\n   Tổng: ${functionsResult.rows.length} functions\n`);
    }

    // 5. KIỂM TRA TRIGGERS
    console.log('⚡ 5. TRIGGERS:\n');
    const triggersResult = await client.query(`
      SELECT 
        trigger_schema,
        trigger_name,
        event_object_table,
        action_timing,
        event_manipulation
      FROM information_schema.triggers
      WHERE trigger_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY trigger_schema, event_object_table, trigger_name
    `);
    
    if (triggersResult.rows.length === 0) {
      console.log('   ⚠️  Không có triggers\n');
    } else {
      for (const trigger of triggersResult.rows) {
        console.log(`   ⚡ ${trigger.trigger_schema}.${trigger.trigger_name}`);
        console.log(`      Table: ${trigger.event_object_table}`);
        console.log(`      Event: ${trigger.action_timing} ${trigger.event_manipulation}\n`);
      }
    }

    // 6. KIỂM TRA RLS POLICIES (tất cả bảng)
    console.log('🔐 6. ROW LEVEL SECURITY POLICIES:\n');
    const allPoliciesResult = await client.query(`
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual
      FROM pg_policies
      ORDER BY schemaname, tablename, policyname
    `);
    
    if (allPoliciesResult.rows.length === 0) {
      console.log('   ⚠️  Không có RLS policies\n');
    } else {
      let currentTable = '';
      for (const policy of allPoliciesResult.rows) {
        const tableName = `${policy.schemaname}.${policy.tablename}`;
        if (tableName !== currentTable) {
          console.log(`\n   📊 Table: ${tableName}`);
          currentTable = tableName;
        }
        console.log(`      🔒 ${policy.policyname}`);
        console.log(`         Command: ${policy.cmd}`);
        console.log(`         Roles: ${policy.roles?.join(', ')}`);
        console.log(`         Using: ${policy.qual || 'true'}`);
      }
      console.log(`\n   Tổng: ${allPoliciesResult.rows.length} policies\n`);
    }

    // 7. KIỂM TRA INDEXES
    console.log('🔍 7. INDEXES:\n');
    const indexesResult = await client.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schemaname, tablename, indexname
    `);
    
    if (indexesResult.rows.length === 0) {
      console.log('   ⚠️  Không có custom indexes\n');
    } else {
      let currentTable = '';
      for (const idx of indexesResult.rows) {
        const tableName = `${idx.schemaname}.${idx.tablename}`;
        if (tableName !== currentTable) {
          console.log(`\n   📊 Table: ${tableName}`);
          currentTable = tableName;
        }
        console.log(`      🔍 ${idx.indexname}`);
      }
      console.log(`\n   Tổng: ${indexesResult.rows.length} indexes\n`);
    }

    // 8. KIỂM TRA FOREIGN KEYS
    console.log('🔗 8. FOREIGN KEY CONSTRAINTS:\n');
    const fkResult = await client.query(`
      SELECT
        tc.table_schema, 
        tc.table_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY tc.table_schema, tc.table_name
    `);
    
    if (fkResult.rows.length === 0) {
      console.log('   ⚠️  KHÔNG CÓ FOREIGN KEYS - Database thiếu relationships!\n');
    } else {
      for (const fk of fkResult.rows) {
        console.log(`   🔗 ${fk.table_schema}.${fk.table_name}.${fk.column_name}`);
        console.log(`      → ${fk.foreign_table_schema}.${fk.foreign_table_name}.${fk.foreign_column_name}\n`);
      }
    }

    // 9. STORAGE BUCKETS (Supabase specific)
    console.log('🗄️  9. STORAGE BUCKETS:\n');
    const bucketsResult = await client.query(`
      SELECT id, name, public, created_at
      FROM storage.buckets
      ORDER BY created_at
    `).catch(() => ({ rows: [] }));
    
    if (bucketsResult.rows.length === 0) {
      console.log('   ⚠️  Không có storage buckets\n');
    } else {
      for (const bucket of bucketsResult.rows) {
        console.log(`   🗄️  ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
      }
      console.log('');
    }

    // 10. AUTH USERS
    console.log('👥 10. AUTH USERS:\n');
    const usersResult = await client.query(`
      SELECT 
        id,
        email,
        created_at,
        email_confirmed_at,
        raw_user_meta_data
      FROM auth.users
      ORDER BY created_at DESC
      LIMIT 10
    `).catch(() => ({ rows: [] }));
    
    if (usersResult.rows.length === 0) {
      console.log('   ⚠️  Không có users\n');
    } else {
      for (const user of usersResult.rows) {
        const metadata = user.raw_user_meta_data || {};
        const role = metadata.role || 'user';
        console.log(`   👤 ${user.email}`);
        console.log(`      Role: ${role} | Created: ${new Date(user.created_at).toLocaleDateString()}`);
      }
      console.log(`\n   Tổng: ${usersResult.rows.length} users (hiển thị 10 mới nhất)\n`);
    }

    console.log('='.repeat(80));
    console.log('\n📊 ĐÁNH GIÁ TỔNG QUAN:\n');
    
    const issues = [];
    
    if (tablesResult.rows.length === 1) {
      issues.push('⚠️  CHỈ CÓ 1 BẢNG - Database structure quá đơn giản');
    }
    
    if (fkResult.rows.length === 0) {
      issues.push('⚠️  KHÔNG CÓ FOREIGN KEYS - Thiếu data relationships');
    }
    
    if (triggersResult.rows.length === 0) {
      issues.push('⚠️  KHÔNG CÓ TRIGGERS - Thiếu automated data management');
    }
    
    if (viewsResult.rows.length === 0) {
      issues.push('⚠️  KHÔNG CÓ VIEWS - Thiếu data abstraction layer');
    }

    if (issues.length > 0) {
      console.log('🚨 VẤN ĐỀ PHÁT HIỆN:\n');
      for (const issue of issues) {
        console.log(`   ${issue}`);
      }
      console.log('\n💡 KHUYẾN NGHỊ: Database cần bổ sung thêm tables và relationships cho một hệ thống BĐS hoàn chỉnh!\n');
    } else {
      console.log('✅ Database structure tốt!\n');
    }

    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ LỖI:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

fullAudit();
