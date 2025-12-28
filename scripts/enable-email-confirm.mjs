// Enable email confirmation in Supabase
const SUPABASE_ACCESS_TOKEN = 'sbp_d9fd9f159ba3a08854384eedc801d9d3bc7d9c77';
const PROJECT_REF = 'rxjsdoylkflzsxlyccqh';

async function main() {
  console.log('🔧 Enabling email confirmation...\n');

  // Update auth config to require email confirmation
  const updateRes = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        MAILER_AUTOCONFIRM: false, // Require email confirmation
        MAILER_SECURE_EMAIL_CHANGE_ENABLED: true,
        MAILER_URLPATHS_CONFIRMATION: '/auth/confirm',
        MAILER_URLPATHS_EMAIL_CHANGE: '/auth/confirm',
        MAILER_URLPATHS_RECOVERY: '/auth/recovery',
      }),
    }
  );

  if (!updateRes.ok) {
    console.log('❌ Error:', await updateRes.text());
    return;
  }

  const result = await updateRes.json();
  console.log('✅ Email confirmation enabled!');
  console.log('\n📋 Updated settings:');
  console.log(`   MAILER_AUTOCONFIRM: ${result.MAILER_AUTOCONFIRM}`);
  
  console.log('\n⚠️ LƯU Ý:');
  console.log('   - Supabase free tier chỉ gửi được 4 email/giờ');
  console.log('   - Để gửi nhiều email hơn, cần cấu hình SMTP:');
  console.log('   1. Vào Supabase Dashboard > Project Settings > Auth');
  console.log('   2. Scroll xuống "SMTP Settings"');
  console.log('   3. Nhập thông tin SMTP (Gmail, SendGrid, Mailgun, etc.)');
  console.log('\n📧 Nếu dùng Gmail SMTP:');
  console.log('   - Host: smtp.gmail.com');
  console.log('   - Port: 587');
  console.log('   - User: your-email@gmail.com');
  console.log('   - Password: App Password (không phải mật khẩu thường)');
}

main().catch(console.error);
