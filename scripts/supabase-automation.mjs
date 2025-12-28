/**
 * Supabase Automation Script
 * Sử dụng Access Token để tự động hóa các tác vụ
 */

const SUPABASE_ACCESS_TOKEN = 'sbp_d9fd9f159ba3a08854384eedc801d9d3bc7d9c77';
const PROJECT_REF = 'rxjsdoylkflzsxlyccqh';
const API_BASE = 'https://api.supabase.com/v1';

const headers = {
  'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
  'Content-Type': 'application/json'
};

// 1. Generate TypeScript Types
async function generateTypes() {
  console.log('\n📝 Generating TypeScript types...');
  try {
    const response = await fetch(`${API_BASE}/projects/${PROJECT_REF}/types/typescript`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    console.log('✅ TypeScript types generated successfully!');
    return data.types;
  } catch (error) {
    console.error('❌ Error generating types:', error.message);
    return null;
  }
}

// 2. Get Project Info
async function getProjectInfo() {
  console.log('\n📊 Getting project info...');
  try {
    const response = await fetch(`${API_BASE}/projects/${PROJECT_REF}`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    console.log('✅ Project Info:');
    console.log(`   Name: ${data.name}`);
    console.log(`   Region: ${data.region}`);
    console.log(`   Status: ${data.status}`);
    console.log(`   Created: ${data.created_at}`);
    return data;
  } catch (error) {
    console.error('❌ Error getting project info:', error.message);
    return null;
  }
}

// 3. Get Auth Config
async function getAuthConfig() {
  console.log('\n🔐 Getting auth config...');
  try {
    const response = await fetch(`${API_BASE}/projects/${PROJECT_REF}/config/auth`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    console.log('✅ Auth Config:');
    console.log(`   Site URL: ${data.site_url}`);
    console.log(`   Email Enabled: ${data.external_email_enabled}`);
    console.log(`   Google Enabled: ${data.external_google_enabled}`);
    console.log(`   Facebook Enabled: ${data.external_facebook_enabled}`);
    console.log(`   MFA TOTP Enabled: ${data.mfa_totp_enroll_enabled}`);
    return data;
  } catch (error) {
    console.error('❌ Error getting auth config:', error.message);
    return null;
  }
}

// 4. Enable Google OAuth
async function enableGoogleOAuth(clientId, clientSecret) {
  console.log('\n🔑 Enabling Google OAuth...');
  try {
    const response = await fetch(`${API_BASE}/projects/${PROJECT_REF}/config/auth`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        external_google_enabled: true,
        external_google_client_id: clientId || '',
        external_google_secret: clientSecret || ''
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    console.log('✅ Google OAuth configuration updated!');
    console.log('   ⚠️ Note: You need to add Google OAuth credentials in Supabase Dashboard');
    return true;
  } catch (error) {
    console.error('❌ Error enabling Google OAuth:', error.message);
    return false;
  }
}

// 5. Get API Keys
async function getApiKeys() {
  console.log('\n🔑 Getting API keys...');
  try {
    const response = await fetch(`${API_BASE}/projects/${PROJECT_REF}/api-keys`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    console.log('✅ API Keys found:', data.length);
    data.forEach(key => {
      console.log(`   - ${key.name}: ${key.api_key?.substring(0, 20)}...`);
    });
    return data;
  } catch (error) {
    console.error('❌ Error getting API keys:', error.message);
    return null;
  }
}

// 6. List Edge Functions
async function listFunctions() {
  console.log('\n⚡ Listing Edge Functions...');
  try {
    const response = await fetch(`${API_BASE}/projects/${PROJECT_REF}/functions`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    if (data.length === 0) {
      console.log('   No Edge Functions deployed yet');
    } else {
      console.log('✅ Edge Functions:', data.length);
      data.forEach(fn => {
        console.log(`   - ${fn.name} (${fn.status})`);
      });
    }
    return data;
  } catch (error) {
    console.error('❌ Error listing functions:', error.message);
    return null;
  }
}

// 7. Get Storage Buckets
async function getStorageBuckets() {
  console.log('\n📦 Getting storage buckets...');
  try {
    const response = await fetch(`${API_BASE}/projects/${PROJECT_REF}/storage/buckets`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    if (data.length === 0) {
      console.log('   No storage buckets created yet');
    } else {
      console.log('✅ Storage Buckets:', data.length);
      data.forEach(bucket => {
        console.log(`   - ${bucket.name} (public: ${bucket.public})`);
      });
    }
    return data;
  } catch (error) {
    console.error('❌ Error getting storage buckets:', error.message);
    return null;
  }
}

// 8. Get Database Pooler Config
async function getPoolerConfig() {
  console.log('\n🔄 Getting database pooler config...');
  try {
    const response = await fetch(`${API_BASE}/projects/${PROJECT_REF}/config/database/pooler`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    console.log('✅ Pooler Config:');
    if (Array.isArray(data) && data.length > 0) {
      data.forEach(config => {
        console.log(`   - Type: ${config.database_type}`);
        console.log(`   - Pool Size: ${config.default_pool_size}`);
        console.log(`   - Pool Mode: ${config.pool_mode}`);
      });
    }
    return data;
  } catch (error) {
    console.error('❌ Error getting pooler config:', error.message);
    return null;
  }
}

// 9. Get Postgres Config
async function getPostgresConfig() {
  console.log('\n🐘 Getting Postgres config...');
  try {
    const response = await fetch(`${API_BASE}/projects/${PROJECT_REF}/config/database/postgres`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    console.log('✅ Postgres Config retrieved');
    return data;
  } catch (error) {
    console.error('❌ Error getting Postgres config:', error.message);
    return null;
  }
}

// 10. Get PostgREST Config
async function getPostgrestConfig() {
  console.log('\n🌐 Getting PostgREST config...');
  try {
    const response = await fetch(`${API_BASE}/projects/${PROJECT_REF}/postgrest`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    console.log('✅ PostgREST Config:');
    console.log(`   DB Schema: ${data.db_schema}`);
    console.log(`   Max Rows: ${data.max_rows}`);
    console.log(`   DB Pool: ${data.db_pool}`);
    return data;
  } catch (error) {
    console.error('❌ Error getting PostgREST config:', error.message);
    return null;
  }
}

// Main execution
async function main() {
  console.log('🚀 Supabase Automation Script');
  console.log('================================');
  console.log(`Project: ${PROJECT_REF}`);
  console.log(`Date: ${new Date().toISOString()}`);
  
  // Get project info first
  await getProjectInfo();
  
  // Get auth config
  await getAuthConfig();
  
  // Get API keys
  await getApiKeys();
  
  // List functions
  await listFunctions();
  
  // Get storage buckets
  await getStorageBuckets();
  
  // Get database configs
  await getPoolerConfig();
  await getPostgrestConfig();
  
  // Generate TypeScript types
  const types = await generateTypes();
  if (types) {
    // Save types to file
    const fs = await import('fs');
    fs.writeFileSync('src/types/database.types.ts', types);
    console.log('💾 Types saved to src/types/database.types.ts');
  }
  
  console.log('\n================================');
  console.log('✅ Automation complete!');
}

main().catch(console.error);
