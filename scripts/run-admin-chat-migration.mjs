// Run admin chat policies migration using Supabase client
// Usage: node scripts/run-admin-chat-migration.mjs

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function runMigration() {
  console.log('🚀 Running admin chat policies migration...\n');
  
  const migrations = [
    {
      name: 'Check if conversations table exists',
      sql: `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversations');`
    },
    {
      name: 'Add flag columns to conversations',
      sql: `
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'is_flagged') THEN
            ALTER TABLE public.conversations ADD COLUMN is_flagged BOOLEAN DEFAULT false;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'flag_reason') THEN
            ALTER TABLE public.conversations ADD COLUMN flag_reason TEXT;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'flagged_at') THEN
            ALTER TABLE public.conversations ADD COLUMN flagged_at TIMESTAMPTZ;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'flagged_by') THEN
            ALTER TABLE public.conversations ADD COLUMN flagged_by UUID;
          END IF;
        END $$;
      `
    },
    {
      name: 'Create is_admin function',
      sql: `
        CREATE OR REPLACE FUNCTION public.is_admin()
        RETURNS BOOLEAN AS $$
        BEGIN
          RETURN EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
          );
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    },
    {
      name: 'Drop existing admin policies if any (for conversations)',
      sql: `
        DROP POLICY IF EXISTS "Admins can view all conversations" ON public.conversations;
        DROP POLICY IF EXISTS "Admins can update any conversation" ON public.conversations;
      `
    },
    {
      name: 'Create admin view policy for conversations',
      sql: `
        CREATE POLICY "Admins can view all conversations"
          ON public.conversations FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles p
              WHERE p.id = auth.uid() AND p.is_admin = true
            )
          );
      `
    },
    {
      name: 'Create admin update policy for conversations',
      sql: `
        CREATE POLICY "Admins can update any conversation"
          ON public.conversations FOR UPDATE
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles p
              WHERE p.id = auth.uid() AND p.is_admin = true
            )
          );
      `
    },
    {
      name: 'Drop existing admin policies if any (for chat_messages)',
      sql: `
        DROP POLICY IF EXISTS "Admins can view all chat messages" ON public.chat_messages;
      `
    },
    {
      name: 'Create admin view policy for chat_messages',
      sql: `
        CREATE POLICY "Admins can view all chat messages"
          ON public.chat_messages FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles p
              WHERE p.id = auth.uid() AND p.is_admin = true
            )
          );
      `
    }
  ];

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const migration of migrations) {
    console.log(`📌 ${migration.name}...`);
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: migration.sql });
      
      if (error) {
        // Try direct query if RPC doesn't exist
        const result = await supabase.from('_manual_sql').select('*').limit(0);
        
        // If tables don't exist, skip policy creation
        if (error.message.includes('does not exist')) {
          console.log(`   ⏭️ Skipped - table not found`);
          skipCount++;
          continue;
        }
        
        throw error;
      }
      
      console.log(`   ✅ Success`);
      successCount++;
    } catch (error) {
      // Check for common expected errors
      if (error.message?.includes('already exists') || error.code === '42710') {
        console.log(`   ⏭️ Already exists, skipping`);
        skipCount++;
      } else if (error.message?.includes('does not exist') || error.code === '42P01') {
        console.log(`   ⏭️ Table not found, skipping`);
        skipCount++;
      } else {
        console.log(`   ⚠️ Warning: ${error.message || error}`);
        errorCount++;
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ⏭️ Skipped: ${skipCount}`);
  console.log(`   ⚠️ Warnings: ${errorCount}`);
  console.log('='.repeat(50));
  
  // Verify tables exist
  console.log('\n🔍 Checking table status...');
  
  const { data: convCheck } = await supabase
    .from('conversations')
    .select('id')
    .limit(1);
    
  const { data: msgCheck } = await supabase
    .from('chat_messages')
    .select('id')
    .limit(1);
    
  console.log(`   📋 conversations table: ${convCheck !== null ? '✅ exists' : '❌ not found'}`);
  console.log(`   📋 chat_messages table: ${msgCheck !== null ? '✅ exists' : '❌ not found'}`);
  
  if (convCheck === null || msgCheck === null) {
    console.log('\n⚠️ Some tables are missing. Run add-chat-messages-table.sql first!');
  } else {
    console.log('\n✅ Chat system is ready!');
  }
}

runMigration().catch(console.error);
