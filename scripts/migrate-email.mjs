import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

// Database connection  
const connectionString = 'postgresql://postgres.rxjsdoylkflzsxlyccqh:Acookingoil123@@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

async function runMigration() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...\n');
    await client.connect();
    console.log('✅ Connected!\n');

    // Read SQL file
    const sqlPath = path.join(__dirname, 'add-email-to-profiles.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    console.log('📝 Executing SQL migration...\n');
    
    // Execute the entire SQL script
    await client.query(sqlContent);
    
    console.log('✅ Migration completed successfully!\n');

    // Verify by checking profiles
    console.log('📊 Verifying profiles with emails:\n');
    const result = await client.query(`
      SELECT id, email, full_name, created_at 
      FROM profiles 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    console.log('Sample profiles:');
    result.rows.forEach(profile => {
      console.log(`  - ${profile.full_name || 'No name'}: ${profile.email || 'No email'}`);
    });

    console.log('\n✨ Done! Reload the Users Management page to see emails.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
