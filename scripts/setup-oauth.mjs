/**
 * Setup OAuth Providers (Google, Facebook)
 * Cấu hình cho phép đăng nhập bằng mạng xã hội
 * 
 * HƯỚNG DẪN:
 * 1. Tạo Google OAuth credentials tại: https://console.cloud.google.com/apis/credentials
 * 2. Tạo Facebook App tại: https://developers.facebook.com/apps/
 * 3. Điền CLIENT_ID và SECRET vào file .env
 * 4. Chạy script này để cấu hình
 */

const SUPABASE_ACCESS_TOKEN = 'sbp_d9fd9f159ba3a08854384eedc801d9d3bc7d9c77';
const PROJECT_REF = 'rxjsdoylkflzsxlyccqh';
const API_BASE = 'https://api.supabase.com/v1';

const headers = {
  'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
  'Content-Type': 'application/json'
};

// Cấu hình OAuth - Bạn cần thay thế bằng credentials thật
const oauthConfig = {
  // Google OAuth
  // Tạo tại: https://console.cloud.google.com/apis/credentials
  google: {
    enabled: false, // Set to true khi có credentials
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
  },
  
  // Facebook OAuth
  // Tạo tại: https://developers.facebook.com/apps/
  facebook: {
    enabled: false, // Set to true khi có credentials
    clientId: process.env.FACEBOOK_CLIENT_ID || '',
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || ''
  },
  
  // Additional redirect URLs
  redirectUrls: [
    'https://vungtauland.store',
    'http://localhost:5173',
    'http://localhost:8080'
  ]
};

async function getCurrentAuthConfig() {
  console.log('📋 Getting current auth config...');
  
  const response = await fetch(`${API_BASE}/projects/${PROJECT_REF}/config/auth`, {
    headers
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return response.json();
}

async function updateAuthConfig(config) {
  console.log('🔧 Updating auth config...');
  
  const response = await fetch(`${API_BASE}/projects/${PROJECT_REF}/config/auth`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(config)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return response.json();
}

async function main() {
  console.log('🚀 OAuth Configuration Script');
  console.log('==============================');
  console.log(`Project: ${PROJECT_REF}`);
  console.log(`Time: ${new Date().toISOString()}\n`);
  
  try {
    // Get current config
    const currentConfig = await getCurrentAuthConfig();
    
    console.log('📊 Current OAuth Status:');
    console.log(`   Google: ${currentConfig.external_google_enabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   Facebook: ${currentConfig.external_facebook_enabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   Apple: ${currentConfig.external_apple_enabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   GitHub: ${currentConfig.external_github_enabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   Discord: ${currentConfig.external_discord_enabled ? '✅ Enabled' : '❌ Disabled'}`);
    
    // Update with redirect URLs
    const updatePayload = {
      uri_allow_list: oauthConfig.redirectUrls.join(','),
      // Cấu hình bổ sung cho auth (without SMTP-dependent settings)
      mailer_autoconfirm: false,
      sms_autoconfirm: false,
      security_refresh_token_reuse_interval: 10,
      refresh_token_rotation_enabled: true,
    };
    
    // Thêm Google nếu có credentials
    if (oauthConfig.google.enabled && oauthConfig.google.clientId) {
      updatePayload.external_google_enabled = true;
      updatePayload.external_google_client_id = oauthConfig.google.clientId;
      updatePayload.external_google_secret = oauthConfig.google.clientSecret;
    }
    
    // Thêm Facebook nếu có credentials
    if (oauthConfig.facebook.enabled && oauthConfig.facebook.clientId) {
      updatePayload.external_facebook_enabled = true;
      updatePayload.external_facebook_client_id = oauthConfig.facebook.clientId;
      updatePayload.external_facebook_secret = oauthConfig.facebook.clientSecret;
    }
    
    // Update config
    await updateAuthConfig(updatePayload);
    
    console.log('\n✅ Auth configuration updated!');
    console.log('\n📝 Redirect URLs configured:');
    oauthConfig.redirectUrls.forEach(url => {
      console.log(`   - ${url}`);
    });
    
    // Instructions
    console.log('\n' + '='.repeat(50));
    console.log('📚 HƯỚNG DẪN CẤU HÌNH OAUTH');
    console.log('='.repeat(50));
    
    console.log('\n🔷 GOOGLE OAUTH:');
    console.log('1. Truy cập: https://console.cloud.google.com/apis/credentials');
    console.log('2. Tạo OAuth 2.0 Client ID');
    console.log('3. Thêm Authorized redirect URIs:');
    console.log(`   https://rxjsdoylkflzsxlyccqh.supabase.co/auth/v1/callback`);
    console.log('4. Copy Client ID và Client Secret');
    console.log('5. Vào Supabase Dashboard > Authentication > Providers > Google');
    console.log('6. Enable và paste credentials');
    
    console.log('\n🔷 FACEBOOK OAUTH:');
    console.log('1. Truy cập: https://developers.facebook.com/apps/');
    console.log('2. Tạo App mới hoặc chọn app có sẵn');
    console.log('3. Vào Settings > Basic để lấy App ID và Secret');
    console.log('4. Vào Facebook Login > Settings, thêm:');
    console.log(`   https://rxjsdoylkflzsxlyccqh.supabase.co/auth/v1/callback`);
    console.log('5. Vào Supabase Dashboard > Authentication > Providers > Facebook');
    console.log('6. Enable và paste credentials');
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Script completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main().catch(console.error);
