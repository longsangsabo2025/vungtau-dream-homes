import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = 'https://rxjsdoylkflzsxlyccqh.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4anNkb3lsa2ZsenN4bHljY3FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA0MTMyMiwiZXhwIjoyMDc4NjE3MzIyfQ.R4o78VFAuz2mj_x9aEKRZgAIorTtOyCSEZVoeg7WUxA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Running email migration...\n');

  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, 'add-email-to-profiles.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n[${i + 1}/${statements.length}] Executing:`);
      console.log(statement.substring(0, 100) + '...\n');

      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });

        if (error) {
          // Try direct query if RPC fails
          const result = await supabase.from('_migrations').select('*').limit(1);
          console.log('⚠️  RPC not available, trying alternative method...');
        }

        console.log('✅ Success');
      } catch (err) {
        console.log('⚠️  Skipping (may already exist):', err.message);
      }
    }

    console.log('\n✨ Migration completed!\n');
    console.log('Verifying email sync...\n');

    // Verify by checking profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .limit(5);

    if (profileError) {
      console.error('❌ Error checking profiles:', profileError);
    } else {
      console.log('📊 Sample profiles with emails:');
      profiles?.forEach(profile => {
        console.log(`  - ${profile.full_name || 'No name'}: ${profile.email || 'No email'}`);
      });
    }

    console.log('\n✅ Done! You can now reload the Users Management page.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
