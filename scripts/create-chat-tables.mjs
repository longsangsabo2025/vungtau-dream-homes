import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createChatTables() {
  console.log('Creating chat_messages table...');

  // Create table using raw SQL via rpc
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS public.chat_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
      recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      message_type VARCHAR(20) DEFAULT 'live_chat',
      content TEXT NOT NULL,
      sender_role VARCHAR(20) DEFAULT 'user',
      is_read BOOLEAN DEFAULT false,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // Try to create table by inserting a test record first to check if exists
  const { data: testData, error: testError } = await supabase
    .from('chat_messages')
    .select('id')
    .limit(1);

  if (testError && testError.code === '42P01') {
    // Table doesn't exist, need to create via dashboard
    console.log('Table does not exist. Please create it via Supabase Dashboard SQL Editor:');
    console.log('');
    console.log('='.repeat(60));
    console.log(createTableSQL);
    console.log('');
    console.log(`
-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_property_id ON public.chat_messages(property_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_type ON public.chat_messages(message_type);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own messages"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert their own messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
  ON public.chat_messages FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = recipient_id);
    `);
    console.log('='.repeat(60));
    return;
  }

  if (testError) {
    console.error('Error checking table:', testError.message);
    return;
  }

  console.log('✅ Table chat_messages already exists!');
  
  // Check row count
  const { count } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 Current message count: ${count || 0}`);
}

createChatTables().catch(console.error);
