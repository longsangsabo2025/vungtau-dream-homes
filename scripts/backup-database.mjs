/**
 * Backup Database Schema Script
 * Export database schema using Supabase Management API
 */

const SUPABASE_ACCESS_TOKEN = 'sbp_d9fd9f159ba3a08854384eedc801d9d3bc7d9c77';
const PROJECT_REF = 'rxjsdoylkflzsxlyccqh';
const API_BASE = 'https://api.supabase.com/v1';

const headers = {
  'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
  'Content-Type': 'application/json'
};

// Get all tables structure
async function getTablesInfo() {
  console.log('📊 Fetching database tables info...');
  
  const query = `
    SELECT 
      table_schema,
      table_name,
      table_type
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  
  try {
    const response = await fetch(`${API_BASE}/projects/${PROJECT_REF}/database/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

// Get columns info for all tables
async function getColumnsInfo() {
  console.log('📝 Fetching columns info...');
  
  const query = `
    SELECT 
      table_name,
      column_name,
      data_type,
      is_nullable,
      column_default
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
  `;
  
  try {
    const response = await fetch(`${API_BASE}/projects/${PROJECT_REF}/database/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

// Get indexes
async function getIndexes() {
  console.log('🔍 Fetching indexes...');
  
  const query = `
    SELECT 
      schemaname,
      tablename,
      indexname,
      indexdef
    FROM pg_indexes 
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname;
  `;
  
  try {
    const response = await fetch(`${API_BASE}/projects/${PROJECT_REF}/database/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

// Get RLS policies
async function getPolicies() {
  console.log('🔐 Fetching RLS policies...');
  
  const query = `
    SELECT 
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual
    FROM pg_policies 
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname;
  `;
  
  try {
    const response = await fetch(`${API_BASE}/projects/${PROJECT_REF}/database/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

// Get functions
async function getFunctions() {
  console.log('⚙️ Fetching functions...');
  
  const query = `
    SELECT 
      routine_name,
      routine_type,
      data_type as return_type
    FROM information_schema.routines 
    WHERE routine_schema = 'public'
    ORDER BY routine_name;
  `;
  
  try {
    const response = await fetch(`${API_BASE}/projects/${PROJECT_REF}/database/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

// Get row counts
async function getRowCounts() {
  console.log('📈 Fetching row counts...');
  
  const query = `
    SELECT 
      schemaname,
      relname as table_name,
      n_live_tup as row_count
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY n_live_tup DESC;
  `;
  
  try {
    const response = await fetch(`${API_BASE}/projects/${PROJECT_REF}/database/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

// Get database size
async function getDatabaseSize() {
  console.log('💾 Fetching database size...');
  
  const query = `
    SELECT 
      pg_size_pretty(pg_database_size(current_database())) as database_size,
      current_database() as database_name;
  `;
  
  try {
    const response = await fetch(`${API_BASE}/projects/${PROJECT_REF}/database/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

async function main() {
  const fs = await import('fs');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  console.log('🚀 Database Backup Script');
  console.log('==========================');
  console.log(`Project: ${PROJECT_REF}`);
  console.log(`Time: ${new Date().toISOString()}\n`);
  
  const backup = {
    timestamp: new Date().toISOString(),
    project: PROJECT_REF,
    tables: await getTablesInfo(),
    columns: await getColumnsInfo(),
    indexes: await getIndexes(),
    policies: await getPolicies(),
    functions: await getFunctions(),
    rowCounts: await getRowCounts(),
    databaseSize: await getDatabaseSize()
  };
  
  // Print summary
  console.log('\n📋 BACKUP SUMMARY');
  console.log('==================');
  
  if (backup.tables) {
    console.log(`✅ Tables: ${backup.tables.length || 0}`);
  }
  if (backup.columns) {
    console.log(`✅ Columns: ${backup.columns.length || 0}`);
  }
  if (backup.indexes) {
    console.log(`✅ Indexes: ${backup.indexes.length || 0}`);
  }
  if (backup.policies) {
    console.log(`✅ RLS Policies: ${backup.policies.length || 0}`);
  }
  if (backup.functions) {
    console.log(`✅ Functions: ${backup.functions.length || 0}`);
  }
  if (backup.rowCounts) {
    console.log('\n📊 Table Row Counts:');
    (backup.rowCounts || []).forEach(t => {
      console.log(`   - ${t.table_name}: ${t.row_count} rows`);
    });
  }
  if (backup.databaseSize && backup.databaseSize[0]) {
    console.log(`\n💾 Database Size: ${backup.databaseSize[0].database_size}`);
  }
  
  // Save backup file
  const backupPath = `backups/db-backup-${timestamp}.json`;
  fs.mkdirSync('backups', { recursive: true });
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  console.log(`\n💾 Backup saved to: ${backupPath}`);
  
  console.log('\n==========================');
  console.log('✅ Backup complete!');
}

main().catch(console.error);
