import pg from 'pg';
import { readFileSync } from 'fs';

const { Client } = pg;

const connectionString = 'postgresql://postgres.rxjsdoylkflzsxlyccqh:Acookingoil123@@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

async function migrate() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...\n');
    await client.connect();
    console.log('✅ Connected!\n');

    console.log('📝 Executing SQL migration...\n');
    const sql = readFileSync('./scripts/add-avatar-and-sync-name.sql', 'utf8');
    await client.query(sql);
    console.log('✅ Migration completed successfully!\n');

    console.log('📊 Verifying profiles with avatar and names:\n');
    const result = await client.query(`
      SELECT id, email, full_name, avatar_url, created_at 
      FROM profiles 
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log('Sample profiles:');
    for (const profile of result.rows) {
      console.log(`  - ${profile.full_name || 'No name'}: ${profile.email || 'No email'} | Avatar: ${profile.avatar_url || 'None'}`);
    }

    console.log('\n✨ Done! Avatar column added and names synced.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
