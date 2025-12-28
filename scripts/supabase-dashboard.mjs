/**
 * 🚀 VungTauLand - Supabase Management Dashboard
 * 
 * Script tổng hợp để quản lý toàn bộ Supabase project
 * Sử dụng: node scripts/supabase-dashboard.mjs [command]
 * 
 * Commands:
 *   info     - Xem thông tin project
 *   stats    - Xem thống kê database  
 *   backup   - Backup database schema
 *   types    - Generate TypeScript types
 *   logs     - Xem logs gần đây
 *   health   - Kiểm tra sức khỏe services
 */

const SUPABASE_ACCESS_TOKEN = 'sbp_d9fd9f159ba3a08854384eedc801d9d3bc7d9c77';
const PROJECT_REF = 'rxjsdoylkflzsxlyccqh';
const API_BASE = 'https://api.supabase.com/v1';

const headers = {
  'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
  'Content-Type': 'application/json'
};

const command = process.argv[2] || 'info';

// Utility functions
async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers,
    ...options
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  
  return response.json();
}

async function queryDB(sql) {
  return fetchAPI(`/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    body: JSON.stringify({ query: sql })
  });
}

// Commands
async function showInfo() {
  console.log('📊 PROJECT INFO');
  console.log('================\n');
  
  const project = await fetchAPI(`/projects/${PROJECT_REF}`);
  console.log(`Name: ${project.name}`);
  console.log(`Region: ${project.region}`);
  console.log(`Status: ${project.status}`);
  console.log(`Created: ${project.created_at}`);
  console.log(`Database Host: ${project.database?.host || 'N/A'}`);
  
  console.log('\n🔐 AUTH CONFIG');
  const auth = await fetchAPI(`/projects/${PROJECT_REF}/config/auth`);
  console.log(`Site URL: ${auth.site_url}`);
  console.log(`Email Auth: ${auth.external_email_enabled ? '✅' : '❌'}`);
  console.log(`Google OAuth: ${auth.external_google_enabled ? '✅' : '❌'}`);
  console.log(`Facebook OAuth: ${auth.external_facebook_enabled ? '✅' : '❌'}`);
  console.log(`MFA Enabled: ${auth.mfa_totp_enroll_enabled ? '✅' : '❌'}`);
  
  console.log('\n📦 STORAGE');
  const { data: buckets } = await (await import('@supabase/supabase-js')).createClient(
    `https://${PROJECT_REF}.supabase.co`,
    (await fetchAPI(`/projects/${PROJECT_REF}/api-keys?reveal=true`)).find(k => k.name === 'service_role').api_key
  ).storage.listBuckets();
  
  if (buckets?.length) {
    buckets.forEach(b => console.log(`- ${b.name} (${b.public ? 'public' : 'private'})`));
  } else {
    console.log('No buckets');
  }
  
  console.log('\n⚡ EDGE FUNCTIONS');
  const functions = await fetchAPI(`/projects/${PROJECT_REF}/functions`);
  if (functions.length) {
    functions.forEach(f => console.log(`- ${f.name} (${f.status})`));
  } else {
    console.log('No functions deployed');
  }
}

async function showStats() {
  console.log('📈 DATABASE STATISTICS');
  console.log('======================\n');
  
  // Database size
  const size = await queryDB(`
    SELECT 
      pg_size_pretty(pg_database_size(current_database())) as size,
      current_database() as name
  `);
  console.log(`💾 Database Size: ${size[0]?.size || 'N/A'}`);
  
  // Table counts
  const tables = await queryDB(`
    SELECT count(*) as count FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);
  console.log(`📋 Total Tables: ${tables[0]?.count || 0}`);
  
  // Row counts per table
  console.log('\n📊 Row Counts:');
  const rows = await queryDB(`
    SELECT relname as table_name, n_live_tup as rows
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY n_live_tup DESC
  `);
  rows.forEach(r => console.log(`   ${r.table_name}: ${r.rows}`));
  
  // Index count
  const indexes = await queryDB(`
    SELECT count(*) as count FROM pg_indexes WHERE schemaname = 'public'
  `);
  console.log(`\n🔍 Total Indexes: ${indexes[0]?.count || 0}`);
  
  // Policy count  
  const policies = await queryDB(`
    SELECT count(*) as count FROM pg_policies WHERE schemaname = 'public'
  `);
  console.log(`🔐 RLS Policies: ${policies[0]?.count || 0}`);
}

async function backupSchema() {
  console.log('💾 BACKING UP DATABASE SCHEMA');
  console.log('==============================\n');
  
  const fs = await import('fs');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  const backup = {
    timestamp: new Date().toISOString(),
    project: PROJECT_REF,
    tables: await queryDB(`
      SELECT table_name, table_type FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `),
    columns: await queryDB(`
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' ORDER BY table_name, ordinal_position
    `),
    indexes: await queryDB(`
      SELECT tablename, indexname, indexdef FROM pg_indexes 
      WHERE schemaname = 'public' ORDER BY tablename
    `),
    policies: await queryDB(`
      SELECT tablename, policyname, permissive, roles, cmd
      FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename
    `)
  };
  
  fs.mkdirSync('backups', { recursive: true });
  const path = `backups/schema-${timestamp}.json`;
  fs.writeFileSync(path, JSON.stringify(backup, null, 2));
  
  console.log(`✅ Backup saved to: ${path}`);
  console.log(`   Tables: ${backup.tables.length}`);
  console.log(`   Columns: ${backup.columns.length}`);
  console.log(`   Indexes: ${backup.indexes.length}`);
  console.log(`   Policies: ${backup.policies.length}`);
}

async function generateTypes() {
  console.log('📝 GENERATING TYPESCRIPT TYPES');
  console.log('==============================\n');
  
  const fs = await import('fs');
  const data = await fetchAPI(`/projects/${PROJECT_REF}/types/typescript`);
  
  fs.mkdirSync('src/types', { recursive: true });
  fs.writeFileSync('src/types/database.types.ts', data.types);
  
  console.log('✅ Types saved to: src/types/database.types.ts');
  console.log(`   File size: ${(data.types.length / 1024).toFixed(2)} KB`);
}

async function showLogs() {
  console.log('📜 RECENT LOGS');
  console.log('==============\n');
  
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  try {
    const logs = await fetchAPI(
      `/projects/${PROJECT_REF}/analytics/endpoints/logs.all?iso_timestamp_start=${oneHourAgo.toISOString()}&iso_timestamp_end=${now.toISOString()}`
    );
    
    if (logs.result?.length) {
      logs.result.slice(0, 20).forEach(log => {
        console.log(`[${log.timestamp}] ${log.event_message || JSON.stringify(log)}`);
      });
    } else {
      console.log('No logs in the last hour');
    }
  } catch (error) {
    console.log('Could not fetch logs:', error.message);
  }
}

async function checkHealth() {
  console.log('🏥 SERVICE HEALTH CHECK');
  console.log('=======================\n');
  
  try {
    const health = await fetchAPI(`/projects/${PROJECT_REF}/health`);
    
    if (Array.isArray(health)) {
      health.forEach(service => {
        const status = service.healthy ? '✅' : '❌';
        console.log(`${status} ${service.name}: ${service.status || 'unknown'}`);
      });
    } else {
      console.log('Health check:', JSON.stringify(health, null, 2));
    }
  } catch (error) {
    // Fallback - check project status
    const project = await fetchAPI(`/projects/${PROJECT_REF}`);
    console.log(`Project Status: ${project.status}`);
    
    if (project.status === 'ACTIVE_HEALTHY') {
      console.log('✅ All services healthy');
    } else {
      console.log(`⚠️ Status: ${project.status}`);
    }
  }
}

// Main
async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  🏠 VungTauLand Supabase Dashboard     ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  try {
    switch (command) {
      case 'info':
        await showInfo();
        break;
      case 'stats':
        await showStats();
        break;
      case 'backup':
        await backupSchema();
        break;
      case 'types':
        await generateTypes();
        break;
      case 'logs':
        await showLogs();
        break;
      case 'health':
        await checkHealth();
        break;
      default:
        console.log('Available commands:');
        console.log('  info     - Show project info');
        console.log('  stats    - Show database statistics');
        console.log('  backup   - Backup database schema');
        console.log('  types    - Generate TypeScript types');
        console.log('  logs     - Show recent logs');
        console.log('  health   - Check service health');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
