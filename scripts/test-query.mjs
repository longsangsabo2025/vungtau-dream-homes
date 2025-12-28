import { createClient } from '@supabase/supabase-js'

// Using ANON key like the frontend
const supabase = createClient(
  'https://rxjsdoylkflzsxlyccqh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4anNkb3lsa2ZsenN4bHljY3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDEzMjIsImV4cCI6MjA3ODYxNzMyMn0.9OqV9R7nxX_XwfxEV1caYhNa063sswq3bH6zbA1-tTA'
)

async function main() {
  console.log('Testing useProperty query...\n')
  
  // Test exact query from useProperty hook
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_images(id, image_url, is_primary, display_order),
      profiles:owner_id(id, full_name, avatar_url, phone, email)
    `)
    .limit(1)
    .single()
  
  if (error) {
    console.log('❌ ERROR:', error.message)
    console.log('Details:', error.details)
    console.log('Hint:', error.hint)
  } else {
    console.log('✅ Query works!')
    console.log('Property:', data.title)
    console.log('Owner:', data.profiles?.full_name || 'N/A')
  }
}

main()
