import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xxukrggjyxyihwzjbtqq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4dWtyZ2dqeXh5aWh3empidHFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mjk2NjA2NCwiZXhwIjoyMDU4NTQyMDY0fQ.UmvNX4uCb5NG9-2qo-JuE9qWbXNUg7Kb8QmvZGWj3Fc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateCategories() {
  try {
    console.log('🔄 Updating categories...');

    // Delete existing categories
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError && deleteError.code !== 'PGRST116') {
      console.error('❌ Error deleting categories:', deleteError);
    } else {
      console.log('🗑️ Cleared existing categories');
    }

    // Insert proper property type categories
    const categories = [
      { name: 'Căn hộ', slug: 'can-ho', description: 'Căn hộ chung cư', display_order: 1, is_active: true },
      { name: 'Villa', slug: 'villa', description: 'Biệt thự', display_order: 2, is_active: true },
      { name: 'Nhà phố', slug: 'nha-pho', description: 'Nhà phố, nhà riêng', display_order: 3, is_active: true },
      { name: 'Đất nền', slug: 'dat-nen', description: 'Đất nền dự án, đất thổ cư', display_order: 4, is_active: true },
      { name: 'Shophouse', slug: 'shophouse', description: 'Nhà phố thương mại', display_order: 5, is_active: true },
      { name: 'Condotel', slug: 'condotel', description: 'Căn hộ khách sạn', display_order: 6, is_active: true },
      { name: 'Studio', slug: 'studio', description: 'Căn hộ studio', display_order: 7, is_active: true },
    ];

    const { data, error: insertError } = await supabase
      .from('categories')
      .insert(categories)
      .select();

    if (insertError) {
      console.error('❌ Error inserting categories:', insertError);
      return;
    }

    console.log('\n✅ Added categories:');
    data?.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug}): ${cat.description}`);
    });

    // Verify
    const { data: allCategories, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .order('display_order');

    if (fetchError) {
      console.error('❌ Error fetching categories:', fetchError);
      return;
    }

    console.log('\n📋 Total categories in database:', allCategories?.length);
    console.log('\n✨ Categories updated successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateCategories();
