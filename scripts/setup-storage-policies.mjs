/**
 * Setup Storage Policies Script
 * Tạo RLS policies cho storage buckets
 */

const PROJECT_REF = 'rxjsdoylkflzsxlyccqh';
const ACCESS_TOKEN = 'sbp_d9fd9f159ba3a08854384eedc801d9d3bc7d9c77';

async function runSQL(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  return res.json();
}

async function createStoragePolicies() {
  console.log('🔧 Setting up Storage Policies...');
  console.log('================================');
  console.log(`Project: ${PROJECT_REF}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  // Drop existing policies first (in case they exist)
  const dropPolicies = [
    `DROP POLICY IF EXISTS "Public can view property images" ON storage.objects`,
    `DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects`,
    `DROP POLICY IF EXISTS "Authenticated users can update property images" ON storage.objects`,
    `DROP POLICY IF EXISTS "Authenticated users can delete property images" ON storage.objects`,
    `DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects`,
    `DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects`,
    `DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects`,
    `DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects`,
  ];

  console.log('🗑️ Dropping existing policies...');
  for (const query of dropPolicies) {
    await runSQL(query);
  }
  console.log('   Done\n');

  // Create policies
  const policies = [
    // Property Images - Public Read
    {
      name: 'Public view property images',
      query: `CREATE POLICY "Public can view property images" 
              ON storage.objects FOR SELECT 
              USING (bucket_id = 'property-images')`
    },
    // Property Images - Authenticated Insert
    {
      name: 'Auth upload property images',
      query: `CREATE POLICY "Authenticated users can upload property images" 
              ON storage.objects FOR INSERT 
              WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated')`
    },
    // Property Images - Authenticated Update
    {
      name: 'Auth update property images',
      query: `CREATE POLICY "Authenticated users can update property images" 
              ON storage.objects FOR UPDATE 
              USING (bucket_id = 'property-images' AND auth.role() = 'authenticated')`
    },
    // Property Images - Authenticated Delete
    {
      name: 'Auth delete property images',
      query: `CREATE POLICY "Authenticated users can delete property images" 
              ON storage.objects FOR DELETE 
              USING (bucket_id = 'property-images' AND auth.role() = 'authenticated')`
    },
    // Avatars - Public Read
    {
      name: 'Public view avatars',
      query: `CREATE POLICY "Public can view avatars" 
              ON storage.objects FOR SELECT 
              USING (bucket_id = 'avatars')`
    },
    // Avatars - User Upload Own
    {
      name: 'User upload own avatar',
      query: `CREATE POLICY "Users can upload their own avatar" 
              ON storage.objects FOR INSERT 
              WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (string_to_array(name, '/'))[1])`
    },
    // Avatars - User Update Own
    {
      name: 'User update own avatar',
      query: `CREATE POLICY "Users can update their own avatar" 
              ON storage.objects FOR UPDATE 
              USING (bucket_id = 'avatars' AND auth.uid()::text = (string_to_array(name, '/'))[1])`
    },
    // Avatars - User Delete Own
    {
      name: 'User delete own avatar',
      query: `CREATE POLICY "Users can delete their own avatar" 
              ON storage.objects FOR DELETE 
              USING (bucket_id = 'avatars' AND auth.uid()::text = (string_to_array(name, '/'))[1])`
    }
  ];

  console.log('📋 Creating new policies...');
  for (const policy of policies) {
    const result = await runSQL(policy.query);
    if (result.error) {
      console.log(`   ❌ ${policy.name}: ${result.error}`);
    } else {
      console.log(`   ✅ ${policy.name}`);
    }
  }

  // Verify policies
  console.log('\n📊 Verifying policies...');
  const verifyResult = await runSQL(`
    SELECT policyname, tablename, cmd 
    FROM pg_policies 
    WHERE schemaname = 'storage' 
    ORDER BY tablename, policyname
  `);
  
  if (verifyResult && Array.isArray(verifyResult)) {
    console.log(`   Found ${verifyResult.length} storage policies:`);
    verifyResult.forEach(p => {
      console.log(`   - ${p.policyname} (${p.cmd})`);
    });
  } else {
    console.log('   Result:', JSON.stringify(verifyResult, null, 2));
  }

  console.log('\n================================');
  console.log('✅ Storage policies setup complete!');
}

createStoragePolicies().catch(console.error);
