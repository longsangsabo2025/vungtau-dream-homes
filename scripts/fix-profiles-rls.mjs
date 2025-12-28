import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rxjsdoylkflzsxlyccqh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4anNkb3lsa2ZsenN4bHljY3FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA0MTMyMiwiZXhwIjoyMDc4NjE3MzIyfQ.R4o78VFAuz2mj_x9aEKRZgAIorTtOyCSEZVoeg7WUxA'
)

async function main() {
  console.log('=== Fixing profiles RLS policies ===\n')
  
  // Drop all existing policies on profiles to fix recursion
  const policiesToDrop = [
    'profiles_select_all',
    'profiles_select_own',
    'profiles_update_own',
    'profiles_insert_own',
    'Users can view own profile',
    'Users can update own profile',
    'Users can view all public profiles',
    'Admin can view all profiles',
    'Enable read access for all users',
    'Enable insert for authenticated users only',
    'Enable update for users based on email'
  ]
  
  for (const policy of policiesToDrop) {
    await supabase.rpc('exec_sql', { 
      sql: `DROP POLICY IF EXISTS "${policy}" ON profiles;` 
    }).catch(() => {})
  }
  
  // Create simple, non-recursive policies
  const policies = [
    // Everyone can read profiles (for property owner info)
    `CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);`,
    
    // Users can update their own profile
    `CREATE POLICY "profiles_self_update" ON profiles FOR UPDATE USING (auth.uid() = id);`,
    
    // Users can insert their own profile (for signup)
    `CREATE POLICY "profiles_self_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);`
  ]
  
  for (const sql of policies) {
    const { error } = await supabase.rpc('exec_sql', { sql })
    if (error) {
      console.log('Policy error:', error.message)
    } else {
      console.log('✅ Created policy')
    }
  }
  
  console.log('\n=== Testing query after fix ===')
  
  // Test with anon key
  const anonClient = createClient(
    'https://rxjsdoylkflzsxlyccqh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4anNkb3lsa2ZsenN4bHljY3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDEzMjIsImV4cCI6MjA3ODYxNzMyMn0.9OqV9R7nxX_XwfxEV1caYhNa063sswq3bH6zbA1-tTA'
  )
  
  const { data, error } = await anonClient
    .from('properties')
    .select(`*, profiles:owner_id(id, full_name)`)
    .limit(1)
    .single()
  
  if (error) {
    console.log('❌ Still error:', error.message)
  } else {
    console.log('✅ Query works! Property:', data.title)
  }
}

main()
