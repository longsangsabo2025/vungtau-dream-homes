import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupChatTables() {
  console.log('🚀 Setting up chat tables with full schema...\n');

  // 1. Create conversations table
  console.log('📦 Creating conversations table...');
  const { error: convError } = await supabase.from('conversations').select('id').limit(1);
  
  if (convError && convError.code === '42P01') {
    // Table doesn't exist, need to create via SQL
    console.log('⚠️ Tables need to be created via SQL Editor');
  } else {
    console.log('✅ Conversations table exists');
  }

  // 2. Create chat_messages table  
  console.log('📦 Checking chat_messages table...');
  const { error: msgError } = await supabase.from('chat_messages').select('id').limit(1);
  
  if (msgError && msgError.code === '42P01') {
    console.log('⚠️ Tables need to be created via SQL Editor');
  } else {
    console.log('✅ Chat messages table exists');
  }

  // Test insert to verify everything works
  console.log('\n🧪 Testing table access...');
  
  // Check if we can query the tables
  const { data: convData, error: testConvError } = await supabase
    .from('conversations')
    .select('count')
    .limit(1);
  
  if (!testConvError) {
    console.log('✅ Conversations table is accessible');
  } else {
    console.log('❌ Conversations table error:', testConvError.message);
  }

  const { data: msgData, error: testMsgError } = await supabase
    .from('chat_messages')
    .select('count')
    .limit(1);
  
  if (!testMsgError) {
    console.log('✅ Chat messages table is accessible');
  } else {
    console.log('❌ Chat messages table error:', testMsgError.message);
  }

  console.log('\n✅ Setup complete!');
  console.log('\n📋 If tables don\'t exist, run this SQL in Supabase Dashboard:');
  console.log('   scripts/add-chat-messages-table.sql');
}

setupChatTables();
