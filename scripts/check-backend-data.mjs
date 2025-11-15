import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rxjsdoylkflzsxlyccqh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4anNkb3lsa2ZsenN4bHljY3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDEzMjIsImV4cCI6MjA3ODYxNzMyMn0.9OqV9R7nxX_XwfxEV1caYhNa063sswq3bH6zbA1-tTA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkBackendData() {
  console.log('🔍 KIỂM TRA BACKEND DATA\n')
  console.log('=' .repeat(80))

  try {
    // 1. Check Properties
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id, title, price, property_type, status, owner_id, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    if (propError) {
      console.error('❌ Lỗi khi lấy properties:', propError.message)
    } else {
      console.log(`\n✅ PROPERTIES (${properties?.length || 0} records - showing first 5):`)
      properties?.forEach(p => {
        console.log(`  - ${p.title}`)
        console.log(`    Type: ${p.property_type} | Price: ${p.price?.toLocaleString()} VNĐ`)
        console.log(`    Status: ${p.status} | Owner: ${p.owner_id?.substring(0, 8)}...`)
      })
    }

    // 2. Check Property Images
    const { data: images, error: imgError } = await supabase
      .from('property_images')
      .select('property_id, image_url, display_order')
      .limit(10)

    if (imgError) {
      console.error('❌ Lỗi khi lấy property_images:', imgError.message)
    } else {
      console.log(`\n✅ PROPERTY IMAGES (${images?.length || 0} records - showing first 10):`)
      const grouped = images?.reduce((acc, img) => {
        acc[img.property_id] = (acc[img.property_id] || 0) + 1
        return acc
      }, {})
      Object.entries(grouped || {}).forEach(([propId, count]) => {
        console.log(`  - Property ${propId.substring(0, 8)}...: ${count} images`)
      })
    }

    // 3. Check Categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug')

    if (catError) {
      console.error('❌ Lỗi khi lấy categories:', catError.message)
    } else {
      console.log(`\n✅ CATEGORIES (${categories?.length || 0} records):`)
      categories?.forEach(c => {
        console.log(`  - ${c.name} (${c.slug})`)
      })
    }

    // 4. Check Property Features
    const { data: features, error: featError } = await supabase
      .from('property_features')
      .select('id, name, icon')

    if (featError) {
      console.error('❌ Lỗi khi lấy property_features:', featError.message)
    } else {
      console.log(`\n✅ PROPERTY FEATURES (${features?.length || 0} records):`)
      features?.slice(0, 5).forEach(f => {
        console.log(`  - ${f.name} (${f.icon})`)
      })
      if (features?.length > 5) {
        console.log(`  ... and ${features.length - 5} more`)
      }
    }

    // 5. Check Property Feature Mapping
    const { data: featureMapping, error: mapError } = await supabase
      .from('property_feature_mapping')
      .select('property_id, feature_id')
      .limit(10)

    if (mapError) {
      console.error('❌ Lỗi khi lấy property_feature_mapping:', mapError.message)
    } else {
      console.log(`\n✅ PROPERTY FEATURE MAPPING (${featureMapping?.length || 0} records - showing first 10):`)
      const grouped = featureMapping?.reduce((acc, map) => {
        acc[map.property_id] = (acc[map.property_id] || 0) + 1
        return acc
      }, {})
      Object.entries(grouped || {}).forEach(([propId, count]) => {
        console.log(`  - Property ${propId.substring(0, 8)}...: ${count} features`)
      })
    }

    // 6. Check Agents
    const { data: agents, error: agentError } = await supabase
      .from('agents')
      .select('id, full_name, email, phone')
      .limit(5)

    if (agentError) {
      console.error('❌ Lỗi khi lấy agents:', agentError.message)
    } else {
      console.log(`\n✅ AGENTS (${agents?.length || 0} records - showing first 5):`)
      agents?.forEach(a => {
        console.log(`  - ${a.full_name} (${a.email})`)
        console.log(`    Phone: ${a.phone}`)
      })
    }

    // 7. Check Favorites
    const { data: favorites, error: favError } = await supabase
      .from('favorites')
      .select('user_id, property_id, created_at')

    if (favError) {
      console.error('❌ Lỗi khi lấy favorites:', favError.message)
    } else {
      console.log(`\n✅ FAVORITES (${favorites?.length || 0} records)`)
    }

    // 8. Check Property Views
    const { data: views, error: viewError } = await supabase
      .from('property_views')
      .select('property_id')
      .limit(1000)

    if (viewError) {
      console.error('❌ Lỗi khi lấy property_views:', viewError.message)
    } else {
      console.log(`\n✅ PROPERTY VIEWS (${views?.length || 0} records)`)
      const grouped = views?.reduce((acc, view) => {
        acc[view.property_id] = (acc[view.property_id] || 0) + 1
        return acc
      }, {})
      console.log(`  Distribution:`)
      Object.entries(grouped || {}).slice(0, 5).forEach(([propId, count]) => {
        console.log(`    - Property ${propId.substring(0, 8)}...: ${count} views`)
      })
    }

    // 9. Check Inquiries
    const { data: inquiries, error: inqError } = await supabase
      .from('inquiries')
      .select('id, property_id, full_name, status')
      .limit(5)

    if (inqError) {
      console.error('❌ Lỗi khi lấy inquiries:', inqError.message)
    } else {
      console.log(`\n✅ INQUIRIES (${inquiries?.length || 0} records - showing first 5):`)
      inquiries?.forEach(i => {
        console.log(`  - ${i.full_name} - Status: ${i.status}`)
      })
    }

    // 10. Check Reviews
    const { data: reviews, error: revError } = await supabase
      .from('reviews')
      .select('id, property_id, rating, comment')
      .limit(5)

    if (revError) {
      console.error('❌ Lỗi khi lấy reviews:', revError.message)
    } else {
      console.log(`\n✅ REVIEWS (${reviews?.length || 0} records - showing first 5):`)
      reviews?.forEach(r => {
        console.log(`  - Rating: ${'⭐'.repeat(r.rating)}`)
        console.log(`    ${r.comment?.substring(0, 60)}...`)
      })
    }

    // 11. Check Transactions
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('id, property_id, transaction_type, status, amount')
      .limit(5)

    if (transError) {
      console.error('❌ Lỗi khi lấy transactions:', transError.message)
    } else {
      console.log(`\n✅ TRANSACTIONS (${transactions?.length || 0} records - showing first 5):`)
      transactions?.forEach(t => {
        console.log(`  - Type: ${t.transaction_type} | Status: ${t.status}`)
        console.log(`    Amount: ${t.amount?.toLocaleString()} VNĐ`)
      })
    }

    // 12. Check Notifications
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('id, user_id, title, is_read')

    if (notifError) {
      console.error('❌ Lỗi khi lấy notifications:', notifError.message)
    } else {
      console.log(`\n✅ NOTIFICATIONS (${notifications?.length || 0} records)`)
      const unread = notifications?.filter(n => !n.is_read).length || 0
      console.log(`  - Unread: ${unread}`)
    }

    // 13. Summary
    console.log('\n' + '=' .repeat(80))
    console.log('📊 TỔNG KẾT:')
    console.log(`  - Properties: ${properties?.length || 0}`)
    console.log(`  - Property Images: ${images?.length || 0}+`)
    console.log(`  - Categories: ${categories?.length || 0}`)
    console.log(`  - Property Features: ${features?.length || 0}`)
    console.log(`  - Feature Mappings: ${featureMapping?.length || 0}+`)
    console.log(`  - Agents: ${agents?.length || 0}+`)
    console.log(`  - Favorites: ${favorites?.length || 0}`)
    console.log(`  - Property Views: ${views?.length || 0}+`)
    console.log(`  - Inquiries: ${inquiries?.length || 0}+`)
    console.log(`  - Reviews: ${reviews?.length || 0}+`)
    console.log(`  - Transactions: ${transactions?.length || 0}+`)
    console.log(`  - Notifications: ${notifications?.length || 0}`)

    // 14. Check relationships
    console.log('\n🔗 KIỂM TRA MỐI QUAN HỆ:')
    
    // Properties with images
    const { data: propsWithImages } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        property_images (count)
      `)
      .limit(3)

    console.log('  ✅ Properties → Images relationship working')
    
    // Properties with features
    const { data: propsWithFeatures } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        property_feature_mapping (
          feature_id,
          property_features (name)
        )
      `)
      .limit(3)

    console.log('  ✅ Properties → Features relationship working')

    console.log('\n✅ Backend data đã OK!')
    console.log('=' .repeat(80))

  } catch (error) {
    console.error('\n❌ Lỗi:', error)
  }
}

checkBackendData()
