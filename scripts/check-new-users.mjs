// Check users created in last 24 hours
const SUPABASE_ACCESS_TOKEN = 'sbp_d9fd9f159ba3a08854384eedc801d9d3bc7d9c77';
const PROJECT_REF = 'rxjsdoylkflzsxlyccqh';

async function main() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `SELECT COUNT(*) as count FROM profiles WHERE created_at >= '${yesterday.toISOString()}'`
      }),
    }
  );
  const data = await res.json();
  console.log('Users in last 24h:', data[0]?.count);

  // Also get their details
  const res2 = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `SELECT full_name, email, created_at FROM profiles WHERE created_at >= '${yesterday.toISOString()}'`
      }),
    }
  );
  const data2 = await res2.json();
  console.log('Details:');
  data2.forEach(u => console.log(`  - ${u.full_name || 'N/A'} | ${u.email} | ${u.created_at}`));
}

main();
