// Debug chat message sending
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rxjsdoylkflzsxlyccqh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4anNkb3lsa2ZsenN4bHljY3FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA0MTMyMiwiZXhwIjoyMDc4NjE3MzIyfQ.R4o78VFAuz2mj_x9aEKRZgAIorTtOyCSEZVoeg7WUxA'
)

async function main() {
  console.log('=== Debug Chat Messages ===\n')
  
  // Check conversations
  const { data: convs, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .limit(5)
  
  if (convError) {
    console.log('❌ Conversations error:', convError.message)
  } else {
    console.log('Conversations:', convs?.length || 0)
    convs?.forEach(c => {
      console.log(`  - ${c.id}: p1=${c.participant_1}, p2=${c.participant_2}`)
    })
  }
  
  // Check chat_messages table structure
  console.log('\n=== Chat Messages Table ===')
  const { data: msgs, error: msgError } = await supabase
    .from('chat_messages')
    .select('*')
    .limit(3)
  
  if (msgError) {
    console.log('❌ Messages error:', msgError.message)
  } else {
    console.log('Messages:', msgs?.length || 0)
    if (msgs?.length > 0) {
      console.log('Sample message columns:', Object.keys(msgs[0]))
    }
  }
  
  // Test insert with service role
  console.log('\n=== Test Insert ===')
  
  // First get a user and a conversation
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .limit(2)
  
  if (profiles && profiles.length >= 2) {
    const user1 = profiles[0].id
    const user2 = profiles[1].id
    
    // Create or get conversation
    let convId
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant_1.eq.${user1},participant_2.eq.${user2}),and(participant_1.eq.${user2},participant_2.eq.${user1})`)
      .single()
    
    if (existingConv) {
      convId = existingConv.id
      console.log('Found existing conversation:', convId)
    } else {
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          participant_1: user1,
          participant_2: user2,
          conversation_type: 'user'
        })
        .select('id')
        .single()
      
      if (createError) {
        console.log('❌ Create conversation error:', createError.message)
        return
      }
      convId = newConv.id
      console.log('Created new conversation:', convId)
    }
    
    // Test message insert
    const { data: testMsg, error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: convId,
        sender_id: user1,
        content: 'Test message from debug script',
        message_type: 'text',
        is_read: false,
        is_from_ai: false
      })
      .select()
      .single()
    
    if (insertError) {
      console.log('❌ Insert error:', insertError.message)
      console.log('Details:', insertError)
    } else {
      console.log('✅ Message inserted:', testMsg.id)
      console.log('Content:', testMsg.content)
    }
  }
}

main().catch(console.error)
