// Verify chat setup is complete
const SUPABASE_ACCESS_TOKEN = 'sbp_d9fd9f159ba3a08854384eedc801d9d3bc7d9c77';
const PROJECT_REF = 'rxjsdoylkflzsxlyccqh';

async function runSQL(sql) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  return res.json();
}

async function main() {
  console.log('🔍 Verifying chat system setup...\n');

  // Check conversations table
  const tables = await runSQL(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('conversations', 'chat_messages')
  `);
  console.log('📋 Tables:', tables.map(t => t.table_name).join(', '));

  // Check conversations columns
  const convCols = await runSQL(`
    SELECT column_name, data_type FROM information_schema.columns 
    WHERE table_name = 'conversations' ORDER BY ordinal_position
  `);
  console.log('\n📁 conversations columns:');
  convCols.forEach(c => console.log(`   - ${c.column_name}: ${c.data_type}`));

  // Check chat_messages columns
  const msgCols = await runSQL(`
    SELECT column_name, data_type FROM information_schema.columns 
    WHERE table_name = 'chat_messages' ORDER BY ordinal_position
  `);
  console.log('\n📁 chat_messages columns:');
  msgCols.forEach(c => console.log(`   - ${c.column_name}: ${c.data_type}`));

  // Check RLS policies
  const policies = await runSQL(`
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE tablename IN ('conversations', 'chat_messages')
    ORDER BY tablename, policyname
  `);
  console.log('\n🔐 RLS Policies:');
  policies.forEach(p => console.log(`   [${p.tablename}] ${p.policyname}`));

  // Check functions
  const funcs = await runSQL(`
    SELECT routine_name FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('is_admin', 'get_or_create_conversation')
  `);
  console.log('\n⚡ Functions:', funcs.map(f => f.routine_name).join(', '));

  console.log('\n✅ Verification complete!');
}

main().catch(console.error);
