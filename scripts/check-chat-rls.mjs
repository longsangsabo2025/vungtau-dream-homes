// Test chat message sending

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
  return response.json()
}

async function main() {
  console.log('=== Checking chat_messages RLS policies ===\n')
  
  // Check existing policies
  const policies = await execSQL(`
    SELECT policyname, cmd, qual, with_check
    FROM pg_policies 
    WHERE tablename = 'chat_messages';
  `)
  console.log('Current policies:', JSON.stringify(policies, null, 2))
  
  console.log('\n=== Checking conversations RLS policies ===\n')
  const convPolicies = await execSQL(`
    SELECT policyname, cmd, qual, with_check
    FROM pg_policies 
    WHERE tablename = 'conversations';
  `)
  console.log('Conversation policies:', JSON.stringify(convPolicies, null, 2))
}

main().catch(console.error)
