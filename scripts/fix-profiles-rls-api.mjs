// Fix profiles RLS infinite recursion using Management API

const SUPABASE_PROJECT_REF = 'rxjsdoylkflzsxlyccqh'
const SUPABASE_ACCESS_TOKEN = 'sbp_d9fd9f159ba3a08854384eedc801d9d3bc7d9c77'

async function execSQL(sql) {
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    }
  )
  
  const result = await response.json()
  return result
}

async function main() {
  console.log('=== Fixing profiles RLS infinite recursion ===\n')
  
  // Step 1: Check current policies
  console.log('1. Checking current policies...')
  const policiesResult = await execSQL(`
    SELECT policyname, cmd, qual, with_check
    FROM pg_policies 
    WHERE tablename = 'profiles';
  `)
  console.log('Current policies:', policiesResult)
  
  // Step 2: Drop all existing policies
  console.log('\n2. Dropping existing policies...')
  const dropResult = await execSQL(`
    DO $$ 
    DECLARE
      pol RECORD;
    BEGIN
      FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON profiles';
      END LOOP;
    END $$;
  `)
  console.log('Drop result:', dropResult.error || 'OK')
  
  // Step 3: Create simple non-recursive policies
  console.log('\n3. Creating new simple policies...')
  
  // Public read - NO recursion, simple true
  const readPolicy = await execSQL(`
    CREATE POLICY "profiles_public_read" ON profiles 
    FOR SELECT USING (true);
  `)
  console.log('Read policy:', readPolicy.error || '✅ Created')
  
  // Self update
  const updatePolicy = await execSQL(`
    CREATE POLICY "profiles_self_update" ON profiles 
    FOR UPDATE USING (auth.uid() = id);
  `)
  console.log('Update policy:', updatePolicy.error || '✅ Created')
  
  // Self insert
  const insertPolicy = await execSQL(`
    CREATE POLICY "profiles_self_insert" ON profiles 
    FOR INSERT WITH CHECK (auth.uid() = id);
  `)
  console.log('Insert policy:', insertPolicy.error || '✅ Created')
  
  console.log('\n=== Done! Refresh the page to test ===')
}

main().catch(console.error)
