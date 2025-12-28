console.log('=== DEBUGGING CHAT QUERIES ===')

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rxjsdoylkflzsxlyccqh.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4anNkb3lsa2ZsenN4bHljY3FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA0MTMyMiwiZXhwIjoyMDc4NjE3MzIyfQ.R4o78VFAuz2mj_x9aEKRZgAIorTtOyCSEZVoeg7WUxA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testQueries() {
  console.log('1. Testing loadMessages query...')
  
  // Test different query formats
  const formats = [
    'sender:profiles!sender_id(id, full_name, avatar_url)', // With spaces
    'sender:profiles!sender_id(id,full_name,avatar_url)', // Without spaces
    'profiles!sender_id(id,full_name,avatar_url)', // Without alias
  ]
  
  for (const format of formats) {
    console.log(`\nTrying format: "${format}"`)
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`*, ${format}`)
        .limit(1)
      
      if (error) {
        console.log('❌ Error:', error)
      } else {
        console.log('✅ Success:', data?.length || 0, 'messages')
        if (data?.[0]) {
          console.log('Sample:', {
            id: data[0].id,
            content: data[0].content?.substring(0, 50),
            sender: data[0].sender || data[0].profiles
          })
        }
      }
    } catch (e) {
      console.log('❌ Exception:', e.message)
    }
  }

  console.log('\n2. Testing basic message insert...')
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: '550e8400-e29b-41d4-a716-446655440000', // Dummy UUID
        sender_id: '550e8400-e29b-41d4-a716-446655440001',
        content: 'Test message from debug',
        message_type: 'text',
        is_read: false,
        is_from_ai: false
      })
      .select()
      .single()
    
    if (error) {
      console.log('❌ Insert error:', error)
    } else {
      console.log('✅ Insert successful:', data.id)
      
      // Cleanup
      await supabase
        .from('chat_messages')
        .delete()
        .eq('id', data.id)
      console.log('🧹 Cleaned up test message')
    }
  } catch (e) {
    console.log('❌ Insert exception:', e.message)
  }

  console.log('\n3. Testing profiles table access...')
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id,full_name,avatar_url')
      .limit(3)
    
    if (error) {
      console.log('❌ Profiles error:', error)
    } else {
      console.log('✅ Profiles accessible:', data.length, 'users')
      console.log('Sample profiles:', data.map(p => ({
        id: p.id?.substring(0, 8) + '...',
        name: p.full_name
      })))
    }
  } catch (e) {
    console.log('❌ Profiles exception:', e.message)
  }
}

testQueries().then(() => {
  console.log('\n=== DEBUGGING COMPLETE ===')
  process.exit(0)
})