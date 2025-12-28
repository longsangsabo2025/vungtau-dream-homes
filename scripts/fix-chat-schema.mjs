console.log('=== CHECKING FOREIGN KEYS ===')

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rxjsdoylkflzsxlyccqh.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4anNkb3lsa2ZsenN4bHljY3FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA0MTMyMiwiZXhwIjoyMDc4NjE3MzIyfQ.R4o78VFAuz2mj_x9aEKRZgAIorTtOyCSEZVoeg7WUxA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchema() {
  console.log('1. Checking chat_messages table structure...')
  
  const { data: columns, error } = await supabase
    .rpc('get_table_info', { table_name: 'chat_messages' })
    .single()
    
  if (error) {
    // Try alternative method
    console.log('Using alternative method...')
    const query = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'chat_messages' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `
    
    try {
      const { data: cols } = await supabase.rpc('exec_sql', { query })
      console.log('chat_messages columns:', cols)
    } catch (e) {
      console.log('Checking columns manually...')
      // Test individual columns
      const testColumns = ['id', 'sender_id', 'conversation_id', 'content', 'created_at']
      for (const col of testColumns) {
        try {
          await supabase
            .from('chat_messages')
            .select(col)
            .limit(0)
          console.log(`✅ Column "${col}" exists`)
        } catch (err) {
          console.log(`❌ Column "${col}" missing`)
        }
      }
    }
  }

  console.log('\n2. Checking foreign key relationships...')
  
  // Check if sender_id points to profiles
  const fkQuery = `
    SELECT 
      tc.constraint_name,
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM 
      information_schema.table_constraints AS tc
    JOIN 
      information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN 
      information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE 
      tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'chat_messages'
      AND kcu.column_name = 'sender_id';
  `
  
  try {
    const { data: fks } = await supabase.rpc('exec_sql', { query: fkQuery })
    if (fks && fks.length > 0) {
      console.log('Foreign keys for sender_id:', fks)
    } else {
      console.log('❌ No foreign key found for sender_id!')
      
      console.log('\n3. Creating foreign key constraint...')
      const createFkQuery = `
        ALTER TABLE chat_messages 
        ADD CONSTRAINT fk_chat_messages_sender_id 
        FOREIGN KEY (sender_id) REFERENCES profiles(id);
      `
      
      const { error: fkError } = await supabase.rpc('exec_sql', { query: createFkQuery })
      if (fkError) {
        console.log('❌ Failed to create FK:', fkError)
      } else {
        console.log('✅ Foreign key created successfully')
      }
    }
  } catch (e) {
    console.log('Error checking foreign keys:', e.message)
  }

  console.log('\n4. Testing query after FK fix...')
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:profiles(id,full_name,avatar_url)
      `)
      .limit(1)
    
    if (error) {
      console.log('❌ Query still fails:', error)
    } else {
      console.log('✅ Query works now!')
      console.log('Sample:', data?.[0]?.sender)
    }
  } catch (e) {
    console.log('❌ Query exception:', e.message)
  }
}

checkSchema().then(() => {
  console.log('\n=== SCHEMA CHECK COMPLETE ===')
  process.exit(0)
})