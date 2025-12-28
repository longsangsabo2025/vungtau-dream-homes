import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const SUPABASE_PROJECT_ID = 'rxjsdoylkflzsxlyccqh';
const SUPABASE_ACCESS_TOKEN = 'sbp_d9fd9f159ba3a08854384eedc801d9d3bc7d9c77';

async function runSQL(sql) {
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_ID}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SQL Error: ${error}`);
  }

  return response.json();
}

async function setupChatTables() {
  console.log('🚀 Creating chat tables via Supabase API...\n');

  try {
    // 1. Create conversations table
    console.log('📦 Creating conversations table...');
    await runSQL(`
      CREATE TABLE IF NOT EXISTS public.conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id UUID,
        participant_1 UUID NOT NULL,
        participant_2 UUID,
        conversation_type VARCHAR(20) DEFAULT 'user' CHECK (conversation_type IN ('user', 'ai', 'support')),
        last_message_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Conversations table created');

    // 2. Create chat_messages table
    console.log('📦 Creating chat_messages table...');
    await runSQL(`
      CREATE TABLE IF NOT EXISTS public.chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
        sender_id UUID,
        content TEXT NOT NULL,
        message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
        is_read BOOLEAN DEFAULT false,
        is_from_ai BOOLEAN DEFAULT false,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Chat messages table created');

    // 3. Create indexes
    console.log('📦 Creating indexes...');
    await runSQL(`
      CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON public.conversations(participant_1);
      CREATE INDEX IF NOT EXISTS idx_conversations_type ON public.conversations(conversation_type);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON public.chat_messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(created_at DESC);
    `);
    console.log('✅ Indexes created');

    // 4. Enable RLS
    console.log('📦 Enabling RLS...');
    await runSQL(`
      ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
    `);
    console.log('✅ RLS enabled');

    // 5. Create policies
    console.log('📦 Creating RLS policies...');
    
    // Drop existing policies if they exist
    try {
      await runSQL(`DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;`);
      await runSQL(`DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;`);
      await runSQL(`DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;`);
      await runSQL(`DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.chat_messages;`);
      await runSQL(`DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.chat_messages;`);
      await runSQL(`DROP POLICY IF EXISTS "Users can update read status of messages" ON public.chat_messages;`);
    } catch (e) {
      // Policies might not exist, continue
    }

    await runSQL(`
      CREATE POLICY "Users can view their own conversations"
        ON public.conversations FOR SELECT
        USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
    `);

    await runSQL(`
      CREATE POLICY "Users can create conversations"
        ON public.conversations FOR INSERT
        WITH CHECK (auth.uid() = participant_1);
    `);

    await runSQL(`
      CREATE POLICY "Users can update their own conversations"
        ON public.conversations FOR UPDATE
        USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
    `);

    await runSQL(`
      CREATE POLICY "Users can view messages in their conversations"
        ON public.chat_messages FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = chat_messages.conversation_id
            AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
          )
        );
    `);

    await runSQL(`
      CREATE POLICY "Users can send messages in their conversations"
        ON public.chat_messages FOR INSERT
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id
            AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
          )
        );
    `);

    await runSQL(`
      CREATE POLICY "Users can update read status of messages"
        ON public.chat_messages FOR UPDATE
        USING (
          EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = chat_messages.conversation_id
            AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
          )
        );
    `);
    
    console.log('✅ RLS policies created');

    console.log('\n🎉 All chat tables setup complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 Please run the SQL manually:');
    console.log('   1. Go to Supabase Dashboard > SQL Editor');
    console.log('   2. Copy contents from: scripts/add-chat-messages-table.sql');
    console.log('   3. Run the SQL');
  }
}

setupChatTables();
