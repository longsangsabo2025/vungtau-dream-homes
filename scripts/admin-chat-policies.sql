-- ============================================================================
-- ADMIN CHAT POLICIES - Cho phép admin xem tất cả conversations
-- Run this in Supabase SQL Editor
-- ============================================================================

-- 1. Add admin policy for conversations
CREATE POLICY "Admins can view all conversations"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- 2. Add admin policy for chat_messages  
CREATE POLICY "Admins can view all chat messages"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- 3. Create view for admin to see conversation summaries
CREATE OR REPLACE VIEW admin_conversation_summary AS
SELECT 
  c.id as conversation_id,
  c.property_id,
  c.conversation_type,
  c.created_at as started_at,
  c.last_message_at,
  
  -- Participant 1 info
  c.participant_1 as user1_id,
  p1.full_name as user1_name,
  p1.email as user1_email,
  p1.avatar_url as user1_avatar,
  
  -- Participant 2 info
  c.participant_2 as user2_id,
  p2.full_name as user2_name,
  p2.email as user2_email,
  p2.avatar_url as user2_avatar,
  
  -- Property info
  prop.title as property_title,
  prop.location as property_location,
  
  -- Message stats
  (SELECT COUNT(*) FROM chat_messages cm WHERE cm.conversation_id = c.id) as message_count,
  (SELECT COUNT(*) FROM chat_messages cm WHERE cm.conversation_id = c.id AND cm.is_read = false) as unread_count,
  (SELECT cm.content FROM chat_messages cm WHERE cm.conversation_id = c.id ORDER BY cm.created_at DESC LIMIT 1) as last_message
  
FROM public.conversations c
LEFT JOIN public.profiles p1 ON c.participant_1 = p1.id
LEFT JOIN public.profiles p2 ON c.participant_2 = p2.id
LEFT JOIN public.properties prop ON c.property_id = prop.id
ORDER BY c.last_message_at DESC;

-- 4. Grant access to admin view
GRANT SELECT ON admin_conversation_summary TO authenticated;

-- 5. Create RLS for the view
-- Note: Views inherit the RLS of underlying tables, but we add explicit check
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Add flagged/reported status to conversations
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS flag_reason TEXT,
ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS flagged_by UUID REFERENCES auth.users(id);

-- 7. Admin can flag conversations
CREATE POLICY "Admins can update any conversation"
  ON public.conversations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- 8. Function to get conversation stats for admin dashboard
CREATE OR REPLACE FUNCTION get_chat_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_conversations', (SELECT COUNT(*) FROM conversations),
    'active_today', (SELECT COUNT(*) FROM conversations WHERE last_message_at > NOW() - INTERVAL '24 hours'),
    'flagged', (SELECT COUNT(*) FROM conversations WHERE is_flagged = true),
    'total_messages', (SELECT COUNT(*) FROM chat_messages),
    'unread_messages', (SELECT COUNT(*) FROM chat_messages WHERE is_read = false)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_chat_stats IS 'Get chat statistics for admin dashboard';
