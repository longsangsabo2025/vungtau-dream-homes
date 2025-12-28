// Setup avatars storage bucket and policies
const SUPABASE_ACCESS_TOKEN = 'sbp_d9fd9f159ba3a08854384eedc801d9d3bc7d9c77';
const PROJECT_REF = 'rxjsdoylkflzsxlyccqh';

async function runSQL(sql, description) {
  console.log(`📌 ${description}...`);
  
  try {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      if (error.includes('already exists') || error.includes('42710') || error.includes('duplicate')) {
        console.log(`   ⏭️ Already exists`);
        return { success: true, skipped: true };
      }
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    console.log(`   ✅ Success`);
    return { success: true };
  } catch (error) {
    if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
      console.log(`   ⏭️ Already exists`);
      return { success: true, skipped: true };
    }
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Setting up avatars storage bucket...\n');

  // 1. Check if bucket exists
  const checkBucket = await runSQL(`
    SELECT id, name, public FROM storage.buckets WHERE name = 'avatars';
  `, 'Check if avatars bucket exists');

  // 2. Create bucket if not exists
  await runSQL(`
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
    ON CONFLICT (id) DO UPDATE SET 
      public = true,
      file_size_limit = 2097152,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  `, 'Create/Update avatars bucket');

  // 3. Drop existing policies
  await runSQL(`
    DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
  `, 'Drop existing avatar policies');

  // 4. Create public read policy
  await runSQL(`
    CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');
  `, 'Create public read policy for avatars');

  // 5. Create upload policy - users can upload to their own folder
  await runSQL(`
    CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'avatars' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  `, 'Create upload policy for avatars');

  // 6. Create update policy
  await runSQL(`
    CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'avatars' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  `, 'Create update policy for avatars');

  // 7. Create delete policy
  await runSQL(`
    CREATE POLICY "Users can delete their own avatar"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'avatars' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  `, 'Create delete policy for avatars');

  // 8. Check policies
  const policies = await runSQL(`
    SELECT policyname FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname LIKE '%avatar%' OR policyname LIKE '%Avatar%';
  `, 'Verify avatar policies');

  console.log('\n✅ Avatar storage setup complete!');
  console.log('\n📋 Bucket: avatars (public)');
  console.log('📋 Max file size: 2MB');
  console.log('📋 Allowed types: jpeg, png, gif, webp');
}

main().catch(console.error);
