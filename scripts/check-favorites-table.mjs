// Check favorites table and RLS policies
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
  console.log('🔍 Checking favorites table...\n');

  // Check if table exists
  const tables = await runSQL(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'favorites';
  `);
  
  if (tables.length === 0) {
    console.log('❌ favorites table does NOT exist!');
    return;
  }
  
  console.log('✅ favorites table exists');

  // Check columns
  const columns = await runSQL(`
    SELECT column_name, data_type FROM information_schema.columns 
    WHERE table_name = 'favorites' ORDER BY ordinal_position;
  `);
  console.log('\n📋 Columns:');
  columns.forEach(c => console.log(`   - ${c.column_name}: ${c.data_type}`));

  // Check RLS
  const rls = await runSQL(`
    SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'favorites';
  `);
  console.log('\n🔒 RLS enabled:', rls[0]?.relrowsecurity);

  // Check policies
  const policies = await runSQL(`
    SELECT policyname, cmd FROM pg_policies 
    WHERE tablename = 'favorites' AND schemaname = 'public';
  `);
  console.log('\n🔐 Policies:');
  if (policies.length === 0) {
    console.log('   ❌ No policies found!');
  } else {
    policies.forEach(p => console.log(`   [${p.cmd}] ${p.policyname}`));
  }

  // Check data count
  const count = await runSQL(`SELECT COUNT(*) as total FROM favorites;`);
  console.log('\n📊 Total favorites:', count[0]?.total);
}

main().catch(console.error);
