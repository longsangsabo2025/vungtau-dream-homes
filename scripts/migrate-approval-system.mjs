import pg from 'pg';
import { readFileSync } from 'node:fs';

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

    console.log('📝 Adding approval system to properties table...\n');
    const sql = readFileSync('./scripts/add-approval-system.sql', 'utf8');
    await client.query(sql);
    console.log('✅ Migration completed successfully!\n');

    console.log('📊 Verifying properties table structure:\n');
    const result = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'properties' 
        AND column_name IN ('approval_status', 'approved_by', 'approved_at', 'rejection_reason')
      ORDER BY column_name
    `);

    console.log('New columns added:');
    for (const col of result.rows) {
      console.log(`  - ${col.column_name}: ${col.data_type} (default: ${col.column_default || 'NULL'})`);
    }

    console.log('\n📊 Checking existing properties status:\n');
    const statusCheck = await client.query(`
      SELECT 
        approval_status,
        COUNT(*) as count
      FROM properties
      GROUP BY approval_status
      ORDER BY approval_status
    `);

    console.log('Properties by status:');
    for (const row of statusCheck.rows) {
      console.log(`  - ${row.approval_status}: ${row.count} properties`);
    }

    console.log('\n✨ Done! Approval system is ready.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
