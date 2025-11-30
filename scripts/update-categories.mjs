import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.xxukrggjyxyihwzjbtqq',
  password: 'Acookingoil123@@',
});

async function updateCategories() {
  try {
    await client.connect();
    console.log('✅ Connected to Supabase');

    // Delete existing categories (if any)
    await client.query('DELETE FROM categories');
    console.log('🗑️ Cleared existing categories');

    // Insert proper property type categories
    const categories = [
      { name: 'Căn hộ', slug: 'can-ho', description: 'Căn hộ chung cư', display_order: 1 },
      { name: 'Villa', slug: 'villa', description: 'Biệt thự', display_order: 2 },
      { name: 'Nhà phố', slug: 'nha-pho', description: 'Nhà phố, nhà riêng', display_order: 3 },
      { name: 'Đất nền', slug: 'dat-nen', description: 'Đất nền dự án, đất thổ cư', display_order: 4 },
      { name: 'Shophouse', slug: 'shophouse', description: 'Nhà phố thương mại', display_order: 5 },
      { name: 'Condotel', slug: 'condotel', description: 'Căn hộ khách sạn', display_order: 6 },
      { name: 'Studio', slug: 'studio', description: 'Căn hộ studio', display_order: 7 },
    ];

    for (const category of categories) {
      await client.query(
        `INSERT INTO categories (name, slug, description, display_order, is_active)
         VALUES ($1, $2, $3, $4, true)`,
        [category.name, category.slug, category.description, category.display_order]
      );
      console.log(`✅ Added category: ${category.name}`);
    }

    // Verify
    const result = await client.query('SELECT * FROM categories ORDER BY display_order');
    console.log('\n📋 Updated categories:');
    result.rows.forEach(row => {
      console.log(`  - ${row.name} (${row.slug}): ${row.description}`);
    });

    console.log('\n✨ Categories updated successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

updateCategories();
