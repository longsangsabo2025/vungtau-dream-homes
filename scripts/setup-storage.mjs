/**
 * Create Storage Buckets Script
 * Tạo các buckets lưu trữ hình ảnh và files
 */

const SUPABASE_ACCESS_TOKEN = 'sbp_d9fd9f159ba3a08854384eedc801d9d3bc7d9c77';
const PROJECT_REF = 'rxjsdoylkflzsxlyccqh';
const API_BASE = 'https://api.supabase.com/v1';

// Supabase storage API (khác với management API)
// Sử dụng Supabase client để tạo buckets

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rxjsdoylkflzsxlyccqh.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function getServiceRoleKey() {
  console.log('🔑 Getting service role key...');
  
  const headers = {
    'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  };
  
  const response = await fetch(`${API_BASE}/projects/${PROJECT_REF}/api-keys?reveal=true`, {
    headers
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  const keys = await response.json();
  const serviceKey = keys.find(k => k.name === 'service_role');
  return serviceKey?.api_key;
}

async function createBuckets(supabase) {
  const buckets = [
    {
      name: 'property-images',
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    },
    {
      name: 'avatars',
      public: true,
      fileSizeLimit: 2097152, // 2MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    },
    {
      name: 'documents',
      public: false,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    }
  ];
  
  for (const bucket of buckets) {
    console.log(`\n📦 Creating bucket: ${bucket.name}...`);
    
    const { data, error } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: bucket.fileSizeLimit,
      allowedMimeTypes: bucket.allowedMimeTypes
    });
    
    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`   ⚠️ Bucket "${bucket.name}" already exists`);
      } else {
        console.error(`   ❌ Error: ${error.message}`);
      }
    } else {
      console.log(`   ✅ Created: ${bucket.name} (public: ${bucket.public})`);
    }
  }
}

async function main() {
  console.log('🚀 Storage Buckets Setup');
  console.log('========================');
  console.log(`Project: ${PROJECT_REF}`);
  console.log(`Time: ${new Date().toISOString()}\n`);
  
  try {
    // Get service role key
    const serviceKey = await getServiceRoleKey();
    
    if (!serviceKey) {
      console.error('❌ Could not get service role key');
      return;
    }
    
    console.log('✅ Got service role key');
    
    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // List existing buckets
    console.log('\n📋 Checking existing buckets...');
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError.message);
    } else {
      if (existingBuckets.length === 0) {
        console.log('   No buckets exist yet');
      } else {
        console.log('   Existing buckets:');
        existingBuckets.forEach(b => {
          console.log(`   - ${b.name} (public: ${b.public})`);
        });
      }
    }
    
    // Create buckets
    await createBuckets(supabase);
    
    // List buckets after creation
    console.log('\n📋 Final bucket list:');
    const { data: finalBuckets } = await supabase.storage.listBuckets();
    if (finalBuckets) {
      finalBuckets.forEach(b => {
        console.log(`   - ${b.name} (public: ${b.public})`);
      });
    }
    
    console.log('\n========================');
    console.log('✅ Storage setup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main().catch(console.error);
