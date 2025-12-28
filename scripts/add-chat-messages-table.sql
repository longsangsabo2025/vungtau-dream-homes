-- ============================================================================
-- CHAT MESSAGES TABLE - Lưu lịch sử chat giữa users
-- ============================================================================

-- 1. CONVERSATIONS TABLE - Nhóm các cuộc hội thoại
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  participant_1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2 UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for AI conversations
  conversation_type VARCHAR(20) DEFAULT 'user' CHECK (conversation_type IN ('user', 'ai', 'support')),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CHAT MESSAGES TABLE - Lưu từng tin nhắn
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for AI/system messages
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  is_read BOOLEAN DEFAULT false,
  is_from_ai BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}', -- Extra data like AI model, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON public.conversations(participant_1);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON public.conversations(participant_2);
CREATE INDEX IF NOT EXISTS idx_conversations_property ON public.conversations(property_id);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON public.conversations(conversation_type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(created_at DESC);

-- 4. RLS POLICIES
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view their own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = participant_1);

CREATE POLICY "Users can update their own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Chat messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = chat_messages.conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

CREATE POLICY "Users can update read status of messages"
  ON public.chat_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = chat_messages.conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

-- 5. Function to get or create conversation
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_user_id UUID,
  p_other_user_id UUID DEFAULT NULL,
  p_property_id UUID DEFAULT NULL,
  p_type VARCHAR DEFAULT 'user'
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Try to find existing conversation
  IF p_type = 'ai' THEN
    -- AI conversation is per user
    SELECT id INTO v_conversation_id
    FROM public.conversations
    WHERE participant_1 = p_user_id
      AND conversation_type = 'ai'
    LIMIT 1;
  ELSE
    -- User-to-user conversation
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

  -- Create if not exists
  IF v_conversation_id IS NULL THEN
    INSERT INTO public.conversations (participant_1, participant_2, property_id, conversation_type)
    VALUES (p_user_id, p_other_user_id, p_property_id, p_type)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
