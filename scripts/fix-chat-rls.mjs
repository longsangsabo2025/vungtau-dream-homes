// Fix chat_messages RLS policies

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
  console.log('=== Fixing chat_messages RLS policies ===\n')
  
  // Step 1: Drop all existing chat_messages policies
  console.log('1. Dropping old policies...')
  await execSQL(`
    DO $$ 
    DECLARE pol RECORD;
    BEGIN
      FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'chat_messages' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON chat_messages';
      END LOOP;
    END $$;
  `)
  console.log('✅ Old policies dropped')
  
  // Step 2: Create new simple policies
  console.log('\n2. Creating new policies...')
  
  // SELECT: Users can view messages in their conversations
  const selectPolicy = await execSQL(`
    CREATE POLICY "chat_messages_select" ON chat_messages FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 FROM conversations c 
        WHERE c.id = chat_messages.conversation_id 
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
      )
    );
  `)
  console.log('SELECT policy:', selectPolicy.error || '✅ Created')
  
  // INSERT: Users can send messages (must be sender and in conversation)
  const insertPolicy = await execSQL(`
    CREATE POLICY "chat_messages_insert" ON chat_messages FOR INSERT 
    WITH CHECK (
      sender_id = auth.uid() 
      AND EXISTS (
        SELECT 1 FROM conversations c 
        WHERE c.id = chat_messages.conversation_id 
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
      )
    );
  `)
  console.log('INSERT policy:', insertPolicy.error || '✅ Created')
  
  // UPDATE: Users can update messages in their conversations (for read status)
  const updatePolicy = await execSQL(`
    CREATE POLICY "chat_messages_update" ON chat_messages FOR UPDATE 
    USING (
      EXISTS (
        SELECT 1 FROM conversations c 
        WHERE c.id = chat_messages.conversation_id 
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
      )
    );
  `)
  console.log('UPDATE policy:', updatePolicy.error || '✅ Created')
  
  console.log('\n=== Done! Try sending a message now ===')
}

main().catch(console.error)
