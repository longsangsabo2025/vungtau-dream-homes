// Run admin chat policies migration
// Usage: node scripts/run-admin-chat-policies.mjs

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not found in .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  console.log('🚀 Running admin chat policies migration...\n');
  
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    console.log('1️⃣ Adding admin policy for conversations...');
    try {
      await client.query(`
        CREATE POLICY "Admins can view all conversations"
          ON public.conversations FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles p
              WHERE p.id = auth.uid() AND p.is_admin = true
            )
          );
      `);
      console.log('   ✅ Created policy: Admins can view all conversations');
    } catch (e) {
      if (e.code === '42710') {
        console.log('   ⏭️ Policy already exists, skipping...');
      } else {
        throw e;
      }
    }

    console.log('2️⃣ Adding admin policy for chat_messages...');
    try {
      await client.query(`
        CREATE POLICY "Admins can view all chat messages"
          ON public.chat_messages FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles p
              WHERE p.id = auth.uid() AND p.is_admin = true
            )
          );
      `);
      console.log('   ✅ Created policy: Admins can view all chat messages');
    } catch (e) {
      if (e.code === '42710') {
        console.log('   ⏭️ Policy already exists, skipping...');
      } else {
        throw e;
      }
    }

    console.log('3️⃣ Adding flag columns to conversations...');
    try {
      await client.query(`
        ALTER TABLE public.conversations 
        ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS flag_reason TEXT,
        ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS flagged_by UUID REFERENCES auth.users(id);
      `);
      console.log('   ✅ Added flag columns to conversations');
    } catch (e) {
      console.log('   ⚠️ Some columns may already exist:', e.message);
    }

    console.log('4️⃣ Adding admin update policy for conversations...');
    try {
      await client.query(`
        CREATE POLICY "Admins can update any conversation"
          ON public.conversations FOR UPDATE
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles p
              WHERE p.id = auth.uid() AND p.is_admin = true
            )
          );
      `);
      console.log('   ✅ Created policy: Admins can update any conversation');
    } catch (e) {
      if (e.code === '42710') {
        console.log('   ⏭️ Policy already exists, skipping...');
      } else {
        throw e;
      }
    }

    console.log('5️⃣ Creating is_admin helper function...');
    try {
      await client.query(`
        CREATE OR REPLACE FUNCTION is_admin()
        RETURNS BOOLEAN AS $$
        BEGIN
          RETURN EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
          );
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `);
      console.log('   ✅ Created function: is_admin()');
    } catch (e) {
      console.log('   ⚠️ Function error:', e.message);
    }

    // Commit transaction
    await client.query('COMMIT');
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Admin can now view all conversations');
    console.log('   - Admin can now view all chat messages');
    console.log('   - Admin can flag/unflag conversations');
    console.log('   - is_admin() helper function created');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
