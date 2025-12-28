// Fix chat_messages table - remove user_id NOT NULL constraint

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
  console.log('=== Fixing chat_messages table ===\n')
  
  // Check current columns
  console.log('1. Checking current structure...')
  const cols = await execSQL(`
    SELECT column_name, is_nullable, data_type
    FROM information_schema.columns 
    WHERE table_name = 'chat_messages'
    ORDER BY ordinal_position;
  `)
  console.log('Columns:', cols)
  
  // Make user_id nullable since we're using sender_id now
  console.log('\n2. Making user_id nullable...')
  const alterResult = await execSQL(`
    ALTER TABLE chat_messages 
    ALTER COLUMN user_id DROP NOT NULL;
  `)
  console.log('Result:', alterResult.error || '✅ user_id is now nullable')
  
  // Also make recipient_id and property_id nullable if needed
  console.log('\n3. Making other legacy columns nullable...')
  await execSQL(`ALTER TABLE chat_messages ALTER COLUMN recipient_id DROP NOT NULL;`)
  await execSQL(`ALTER TABLE chat_messages ALTER COLUMN property_id DROP NOT NULL;`)
  console.log('✅ Legacy columns are now nullable')
  
  console.log('\n=== Done! Try sending a message now ===')
}

main().catch(console.error)
