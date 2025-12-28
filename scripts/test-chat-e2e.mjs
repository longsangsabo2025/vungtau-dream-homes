// Test end-to-end chat flow
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
  console.log('🔍 Checking chat system...\n');

  // Check conversations
  const conversations = await runSQL(`
    SELECT 
      c.id, 
      c.conversation_type,
      c.last_message_at,
      p1.full_name as participant_1_name,
      p2.full_name as participant_2_name,
      prop.title as property_title
    FROM conversations c
    LEFT JOIN profiles p1 ON c.participant_1 = p1.id
    LEFT JOIN profiles p2 ON c.participant_2 = p2.id
    LEFT JOIN properties prop ON c.property_id = prop.id
    ORDER BY c.last_message_at DESC
    LIMIT 10;
  `);

  console.log('📋 Conversations:');
  if (conversations.length === 0) {
    console.log('   Chưa có conversation nào');
  } else {
    conversations.forEach(c => {
      console.log(`   - ${c.participant_1_name || 'N/A'} <-> ${c.participant_2_name || 'N/A'}`);
      console.log(`     Property: ${c.property_title || 'N/A'}`);
      console.log(`     Last: ${c.last_message_at}`);
    });
  }

  // Check messages
  const messages = await runSQL(`
    SELECT 
      m.id,
      m.content,
      m.created_at,
      m.is_read,
      p.full_name as sender_name
    FROM chat_messages m
    LEFT JOIN profiles p ON m.sender_id = p.id
    WHERE m.conversation_id IS NOT NULL
    ORDER BY m.created_at DESC
    LIMIT 10;
  `);

  console.log('\n💬 Recent messages:');
  if (messages.length === 0) {
    console.log('   Chưa có message nào');
  } else {
    messages.forEach(m => {
      console.log(`   - ${m.sender_name || 'Unknown'}: "${m.content?.substring(0, 50)}..."`);
      console.log(`     Time: ${m.created_at} | Read: ${m.is_read}`);
    });
  }

  // Summary
  const convCount = await runSQL(`SELECT COUNT(*) as count FROM conversations;`);
  const msgCount = await runSQL(`SELECT COUNT(*) as count FROM chat_messages WHERE conversation_id IS NOT NULL;`);
  
  console.log('\n📊 Summary:');
  console.log(`   Total conversations: ${convCount[0]?.count || 0}`);
  console.log(`   Total messages: ${msgCount[0]?.count || 0}`);
}

main().catch(console.error);
