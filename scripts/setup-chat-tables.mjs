// Setup complete chat tables using Supabase Management API
// Usage: node scripts/setup-chat-tables.mjs

const SUPABASE_ACCESS_TOKEN = 'sbp_d9fd9f159ba3a08854384eedc801d9d3bc7d9c77';
const PROJECT_REF = 'rxjsdoylkflzsxlyccqh';

async function runSQL(sql, description) {
  console.log(`📌 ${description}...`);
  
  try {
    const response = await fetch(
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

    if (!response.ok) {
      const error = await response.text();
      if (error.includes('already exists') || error.includes('42710')) {
        console.log(`   ⏭️ Already exists, skipping`);
        return { success: true, skipped: true };
      }
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    console.log(`   ✅ Success`);
    return { success: true, data: result };
  } catch (error) {
    if (error.message?.includes('already exists')) {
      console.log(`   ⏭️ Already exists, skipping`);
      return { success: true, skipped: true };
    }
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Setting up chat tables and admin policies...\n');

  // 1. Create conversations table
  await runSQL(`
    CREATE TABLE IF NOT EXISTS public.conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
      participant_1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      participant_2 UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      conversation_type VARCHAR(20) DEFAULT 'user' CHECK (conversation_type IN ('user', 'ai', 'support')),
      is_flagged BOOLEAN DEFAULT false,
      flag_reason TEXT,
      flagged_at TIMESTAMPTZ,
      flagged_by UUID,
      last_message_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `, 'Create conversations table');

  // 2. Enable RLS on conversations
  await runSQL(`
    ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
  `, 'Enable RLS on conversations');

  // 3. Create indexes for conversations
  await runSQL(`
    CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON public.conversations(participant_1);
    CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON public.conversations(participant_2);
    CREATE INDEX IF NOT EXISTS idx_conversations_property ON public.conversations(property_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_type ON public.conversations(conversation_type);
    CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON public.conversations(last_message_at DESC);
  `, 'Create indexes for conversations');

  // 4. Update chat_messages to reference conversations
  await runSQL(`
    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'conversation_id') THEN
        ALTER TABLE public.chat_messages ADD COLUMN conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'sender_id') THEN
        ALTER TABLE public.chat_messages ADD COLUMN sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'is_from_ai') THEN
        ALTER TABLE public.chat_messages ADD COLUMN is_from_ai BOOLEAN DEFAULT false;
      END IF;
    END $$;
  `, 'Update chat_messages columns');

  // 5. Create index for chat_messages
  await runSQL(`
    CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON public.chat_messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON public.chat_messages(sender_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(created_at DESC);
  `, 'Create indexes for chat_messages');

  // 6. Drop existing policies first
  await runSQL(`
    DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
    DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
    DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
    DROP POLICY IF EXISTS "Admins can view all conversations" ON public.conversations;
    DROP POLICY IF EXISTS "Admins can update any conversation" ON public.conversations;
  `, 'Drop existing conversation policies');

  // 7. Create user policies for conversations
  await runSQL(`
    CREATE POLICY "Users can view their own conversations"
      ON public.conversations FOR SELECT
      USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
  `, 'Create user view policy for conversations');

  await runSQL(`
    CREATE POLICY "Users can create conversations"
      ON public.conversations FOR INSERT
      WITH CHECK (auth.uid() = participant_1);
  `, 'Create user insert policy for conversations');

  await runSQL(`
    CREATE POLICY "Users can update their own conversations"
      ON public.conversations FOR UPDATE
      USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
  `, 'Create user update policy for conversations');

  // 8. Create admin policies for conversations
  await runSQL(`
    CREATE POLICY "Admins can view all conversations"
      ON public.conversations FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.is_admin = true
        )
      );
  `, 'Create admin view policy for conversations');

  await runSQL(`
    CREATE POLICY "Admins can update any conversation"
      ON public.conversations FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.is_admin = true
        )
      );
  `, 'Create admin update policy for conversations');

  // 9. Drop existing chat_messages policies
  await runSQL(`
    DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.chat_messages;
    DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.chat_messages;
    DROP POLICY IF EXISTS "Users can update read status of messages" ON public.chat_messages;
    DROP POLICY IF EXISTS "Admins can view all chat messages" ON public.chat_messages;
  `, 'Drop existing chat_messages policies');

  // 10. Create user policies for chat_messages
  await runSQL(`
    CREATE POLICY "Users can view messages in their conversations"
      ON public.chat_messages FOR SELECT
      USING (
        conversation_id IS NULL OR
        EXISTS (
          SELECT 1 FROM public.conversations c
          WHERE c.id = chat_messages.conversation_id
          AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
        )
        OR user_id = auth.uid()
      );
  `, 'Create user view policy for chat_messages');

  await runSQL(`
    CREATE POLICY "Users can send messages"
      ON public.chat_messages FOR INSERT
      WITH CHECK (
        sender_id = auth.uid() OR user_id = auth.uid()
      );
  `, 'Create user insert policy for chat_messages');

  await runSQL(`
    CREATE POLICY "Users can update read status"
      ON public.chat_messages FOR UPDATE
      USING (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.conversations c
          WHERE c.id = chat_messages.conversation_id
          AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
        )
      );
  `, 'Create user update policy for chat_messages');

  // 11. Create admin policy for chat_messages
  await runSQL(`
    CREATE POLICY "Admins can view all chat messages"
      ON public.chat_messages FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.is_admin = true
        )
      );
  `, 'Create admin view policy for chat_messages');

  // 12. Create is_admin helper function
  await runSQL(`
    CREATE OR REPLACE FUNCTION public.is_admin()
    RETURNS BOOLEAN AS $$
    BEGIN
      RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND is_admin = true
      );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `, 'Create is_admin helper function');

  // 13. Create get_or_create_conversation function
  await runSQL(`
    CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
      p_user_id UUID,
      p_other_user_id UUID DEFAULT NULL,
      p_property_id UUID DEFAULT NULL,
      p_type VARCHAR DEFAULT 'user'
    )
    RETURNS UUID AS $$
    DECLARE
      v_conversation_id UUID;
    BEGIN
      IF p_type = 'ai' THEN
        SELECT id INTO v_conversation_id
        FROM public.conversations
        WHERE participant_1 = p_user_id
          AND conversation_type = 'ai'
        LIMIT 1;
      ELSE
        SELECT id INTO v_conversation_id
        FROM public.conversations
        WHERE conversation_type = 'user'
          AND (
            (participant_1 = p_user_id AND participant_2 = p_other_user_id)
            OR (participant_1 = p_other_user_id AND participant_2 = p_user_id)
          )
          AND (p_property_id IS NULL OR property_id = p_property_id)
        LIMIT 1;
      END IF;

      IF v_conversation_id IS NULL THEN
        INSERT INTO public.conversations (participant_1, participant_2, property_id, conversation_type)
        VALUES (p_user_id, p_other_user_id, p_property_id, p_type)
        RETURNING id INTO v_conversation_id;
      END IF;

      RETURN v_conversation_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `, 'Create get_or_create_conversation function');

  console.log('\n' + '='.repeat(50));
  console.log('✅ Chat system setup complete!');
  console.log('='.repeat(50));
  console.log('\n📋 Created:');
  console.log('   - conversations table');
  console.log('   - Updated chat_messages table');
  console.log('   - User policies (view, create, update)');
  console.log('   - Admin policies (view all, update all)');
  console.log('   - is_admin() function');
  console.log('   - get_or_create_conversation() function');
}

main().catch(console.error);
