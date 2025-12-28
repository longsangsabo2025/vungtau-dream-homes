import fs from 'fs';
import https from 'https';

const TOKEN = 'sbp_d9fd9f159ba3a08854384eedc801d9d3bc7d9c77';
const PROJECT_REF = 'rxjsdoylkflzsxlyccqh';

// Read email templates
const confirmTemplate = fs.readFileSync('./supabase/email-templates/confirm-signup.html', 'utf8');
const resetTemplate = fs.readFileSync('./supabase/email-templates/reset-password.html', 'utf8');
const magicLinkTemplate = fs.readFileSync('./supabase/email-templates/magic-link.html', 'utf8');
const inviteTemplate = fs.readFileSync('./supabase/email-templates/invite-user.html', 'utf8');

const authConfig = {
  site_url: 'https://vungtauland.com',
  uri_allow_list: 'http://localhost:5175,http://localhost:5176,https://vungtauland.com,https://*.vercel.app',
  mailer_subjects_confirmation: '🏠 Xác nhận email - Chào mừng đến VungTauLand!',
  mailer_subjects_recovery: '🔐 Đặt lại mật khẩu - VungTauLand',
  mailer_subjects_magic_link: '✨ Đăng nhập nhanh - VungTauLand',
  mailer_subjects_invite: '🎁 Bạn được mời tham gia VungTauLand!',
  mailer_templates_confirmation: confirmTemplate,
  mailer_templates_recovery: resetTemplate,
  mailer_templates_magic_link: magicLinkTemplate,
  mailer_templates_invite: inviteTemplate
};

const data = JSON.stringify(authConfig);

const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: `/v1/projects/${PROJECT_REF}/config/auth`,
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('🚀 Updating Supabase Auth Config...');
console.log('=====================================');

const req = https.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ SUCCESS! Auth config updated.');
      const result = JSON.parse(responseData);
      console.log('\n📧 Email Subjects:');
      console.log('   Confirmation:', result.mailer_subjects_confirmation);
      console.log('   Recovery:', result.mailer_subjects_recovery);
      console.log('   Magic Link:', result.mailer_subjects_magic_link);
      console.log('   Invite:', result.mailer_subjects_invite);
      console.log('\n🌐 Site URL:', result.site_url);
      console.log('🔗 Allowed URIs:', result.uri_allow_list);
      console.log('\n✅ Email templates uploaded successfully!');
    } else {
      console.log('❌ ERROR:', res.statusCode);
      console.log(responseData);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request failed:', e.message);
});

req.write(data);
req.end();
