// Check Supabase auth settings
const SUPABASE_ACCESS_TOKEN = 'sbp_d9fd9f159ba3a08854384eedc801d9d3bc7d9c77';
const PROJECT_REF = 'rxjsdoylkflzsxlyccqh';

async function main() {
  console.log('🔍 Checking Supabase auth configuration...\n');

  // Get project settings
  const configRes = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!configRes.ok) {
    console.log('❌ Cannot fetch auth config:', await configRes.text());
    return;
  }

  const config = await configRes.json();
  
  console.log('📧 Email Settings:');
  console.log(`   - SMTP Enabled: ${config.EXTERNAL_EMAIL_ENABLED || 'Not set'}`);
  console.log(`   - SMTP Host: ${config.SMTP_HOST || 'Not set'}`);
  console.log(`   - SMTP Port: ${config.SMTP_PORT || 'Not set'}`);
  console.log(`   - SMTP User: ${config.SMTP_USER || 'Not set'}`);
  console.log(`   - SMTP Admin Email: ${config.SMTP_ADMIN_EMAIL || 'Not set'}`);
  console.log(`   - SMTP Sender Name: ${config.SMTP_SENDER_NAME || 'Not set'}`);
  
  console.log('\n🔐 Auth Settings:');
  console.log(`   - Disable Signup: ${config.DISABLE_SIGNUP}`);
  console.log(`   - Double Confirm Changes: ${config.MAILER_AUTOCONFIRM}`);
  console.log(`   - Enable Confirmations: ${config.MAILER_SECURE_EMAIL_CHANGE_ENABLED}`);
  
  console.log('\n📋 Full config (partial):');
  const relevantKeys = [
    'MAILER_AUTOCONFIRM',
    'EXTERNAL_EMAIL_ENABLED', 
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'DISABLE_SIGNUP',
    'MAILER_URLPATHS_CONFIRMATION',
    'MAILER_SECURE_EMAIL_CHANGE_ENABLED'
  ];
  
  relevantKeys.forEach(key => {
    if (config[key] !== undefined) {
      console.log(`   ${key}: ${config[key]}`);
    }
  });
}

main().catch(console.error);
