import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rxjsdoylkflzsxlyccqh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4anNkb3lsa2ZsenN4bHljY3FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA0MTMyMiwiZXhwIjoyMDc4NjE3MzIyfQ.R4o78VFAuz2mj_x9aEKRZgAIorTtOyCSEZVoeg7WUxA'
)

async function main() {
  console.log('=== Setting owner_id for properties ===\n')
  
  // Get first admin user to assign as owner
  const { data: admins } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('role', 'admin')
    .limit(1)
  
  if (!admins || admins.length === 0) {
    console.log('No admin found!')
    return
  }
  
  const admin = admins[0]
  console.log('Admin found:', admin.full_name, admin.email)
  console.log('Admin ID:', admin.id)
  
  // Update all properties without owner_id
  const { data, error } = await supabase
    .from('properties')
    .update({ owner_id: admin.id })
    .is('owner_id', null)
    .select('id, title')
  
  if (error) {
    console.log('Error updating:', error.message)
    return
  }
  
  console.log(`\n✅ Updated ${data?.length || 0} properties with owner_id`)
  data?.forEach(p => console.log(`  - ${p.title}`))
}

main()
