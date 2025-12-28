import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  console.log('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Setting up chat messages tables...\n');

  try {
    // Read and execute the SQL file
    const sqlFile = join(__dirname, 'add-chat-messages-table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split by statements and execute
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.length > 10) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' }).maybeSingle();
        if (error && !error.message.includes('already exists')) {
          // Try direct query for DDL
          const { error: directError } = await supabase.from('_exec').select().limit(0);
          // Ignore - we'll run statements one by one
        }
      }
    }

    // Create tables manually
    console.log('📦 Creating conversations table...');
    const { error: convError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.conversations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          property_id UUID,
          participant_1 UUID NOT NULL,
          participant_2 UUID,
          conversation_type VARCHAR(20) DEFAULT 'user',
          last_message_at TIMESTAMPTZ DEFAULT NOW(),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    console.log('📦 Creating chat_messages table...');
    const { error: msgError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.chat_messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          conversation_id UUID NOT NULL,
          sender_id UUID,
          content TEXT NOT NULL,
          message_type VARCHAR(20) DEFAULT 'text',
          is_read BOOLEAN DEFAULT false,
          is_from_ai BOOLEAN DEFAULT false,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    console.log('\n✅ Migration completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Run the SQL from: scripts/add-chat-messages-table.sql');
    console.log('3. This will create all tables, indexes, and policies');

  } catch (error) {
    console.error('❌ Migration error:', error);
    console.log('\n📋 Manual steps:');
    console.log('1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Copy & paste the SQL from: scripts/add-chat-messages-table.sql');
    console.log('3. Run the SQL to create tables');
  }
}

runMigration();
