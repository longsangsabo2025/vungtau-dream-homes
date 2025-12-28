// Check profiles RLS policies and data
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
  console.log('🔍 Checking profiles table...\n');

  // Check profiles count
  const count = await runSQL(`SELECT COUNT(*) as total FROM public.profiles;`);
  console.log('📊 Total profiles:', count[0]?.total);

  // Check profiles data (limit 5)
  const profiles = await runSQL(`
    SELECT id, full_name, email, role, created_at 
    FROM public.profiles 
    ORDER BY created_at DESC 
    LIMIT 5;
  `);
  console.log('\n📋 Recent profiles:');
  profiles.forEach(p => {
    console.log(`   - ${p.full_name || 'N/A'} | ${p.email || 'N/A'} | ${p.role} | ${p.created_at}`);
  });

  // Check RLS policies on profiles
  const policies = await runSQL(`
    SELECT policyname, cmd, qual, with_check
    FROM pg_policies 
    WHERE tablename = 'profiles' AND schemaname = 'public';
  `);
  console.log('\n🔐 RLS Policies on profiles:');
  policies.forEach(p => {
    console.log(`   [${p.cmd}] ${p.policyname}`);
  });

  // Check if RLS is enabled
  const rlsStatus = await runSQL(`
    SELECT relname, relrowsecurity 
    FROM pg_class 
    WHERE relname = 'profiles';
  `);
  console.log('\n🔒 RLS enabled:', rlsStatus[0]?.relrowsecurity);
}

main().catch(console.error);
