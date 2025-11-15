import pg from 'pg';

const { Client } = pg;

const connectionString = 'postgresql://postgres.rxjsdoylkflzsxlyccqh:Acookingoil123@@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

async function syncEmails() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...\n');
    await client.connect();
    console.log('✅ Connected!\n');

    // Get all users from auth.users
    console.log('📊 Fetching auth users...\n');
    const authUsers = await client.query(`
      SELECT id, email, created_at 
      FROM auth.users 
      ORDER BY created_at DESC
    `);

    console.log(`Found ${authUsers.rows.length} auth users\n`);

    // Check profiles table
    const profiles = await client.query(`
      SELECT id, email, full_name 
      FROM profiles 
      ORDER BY created_at DESC
    `);

    console.log(`Found ${profiles.rows.length} profiles\n`);

    // Update each profile with email from auth.users
    console.log('🔄 Syncing emails...\n');
    
    for (const authUser of authUsers.rows) {
      await client.query(`
        INSERT INTO profiles (id, email, created_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) 
        DO UPDATE SET 
          email = EXCLUDED.email,
          updated_at = NOW()
      `, [authUser.id, authUser.email, authUser.created_at]);
      
      console.log(`✅ Synced: ${authUser.email}`);
    }

    console.log('\n📊 Verifying updated profiles:\n');
    const updated = await client.query(`
      SELECT id, email, full_name, created_at 
      FROM profiles 
      ORDER BY created_at DESC
    `);

    console.log('Updated profiles:');
    for (const profile of updated.rows) {
      console.log(`  - ${profile.full_name || 'No name'}: ${profile.email || 'No email'} (${profile.created_at})`);
    }

    console.log('\n✨ Email sync completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

syncEmails();
