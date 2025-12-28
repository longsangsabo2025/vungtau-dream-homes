-- Fix chat_messages foreign key relationships
-- Run this in Supabase SQL Editor

-- 1. Add foreign key constraint from sender_id to profiles.id
ALTER TABLE chat_messages 
ADD CONSTRAINT fk_chat_messages_sender_id 
FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- 2. Verify the constraint was created
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

-- 3. Test the join query
SELECT 
  cm.*,
  p.full_name,
  p.avatar_url
FROM chat_messages cm
LEFT JOIN profiles p ON cm.sender_id = p.id
LIMIT 3;