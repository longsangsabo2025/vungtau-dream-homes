import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rxjsdoylkflzsxlyccqh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4anNkb3lsa2ZsenN4bHljY3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDEzMjIsImV4cCI6MjA3ODYxNzMyMn0.9OqV9R7nxX_XwfxEV1caYhNa063sswq3bH6zbA1-tTA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyBackendData() {
  console.log('✅ KIỂM TRA BACKEND DATA - FINAL CHECK\n')
  console.log('=' .repeat(80))

  try {
    // 1. Properties
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id, title, price, type, status, owner_id, view_count, is_featured')
      .order('created_at', { ascending: false })

    if (propError) throw propError
    
    console.log(`✅ PROPERTIES: ${properties.length} records`)
    properties.slice(0, 3).forEach(p => {
      console.log(`  📍 ${p.title}`)
      console.log(`     Loại: ${p.type} | Giá: ${p.price?.toLocaleString()} VNĐ`)
      console.log(`     Trạng thái: ${p.status} | Views: ${p.view_count} | Featured: ${p.is_featured ? '⭐' : '❌'}`)
    })
    console.log(`  ... và ${properties.length - 3} tin khác\n`)

    // 2. Property Images
    const { data: images } = await supabase
      .from('property_images')
      .select('property_id')

    console.log(`✅ PROPERTY IMAGES: ${images?.length || 0} records`)
    const imgByProp = images?.reduce((acc, img) => {
      acc[img.property_id] = (acc[img.property_id] || 0) + 1
      return acc
    }, {})
    console.log(`  Trung bình: ${(images?.length / properties.length).toFixed(1)} ảnh/tin\n`)

    // 3. Categories
    const { data: categories } = await supabase
      .from('categories')
      .select('name, slug')

    console.log(`✅ CATEGORIES: ${categories?.length || 0} records`)
    categories?.forEach(c => console.log(`  - ${c.name} (${c.slug})`))
    console.log()

    // 4. Property Features  
    const { data: features } = await supabase
      .from('property_features')
      .select('name, icon')

    console.log(`✅ PROPERTY FEATURES: ${features?.length || 0} records`)
    features?.slice(0, 7).forEach(f => console.log(`  - ${f.icon} ${f.name}`))
    if (features?.length > 7) console.log(`  ... và ${features.length - 7} tiện ích khác`)
    console.log()

    // 5. Property Feature Mapping
    const { data: featureMapping } = await supabase
      .from('property_feature_mapping')
      .select('property_id, feature_id')

    console.log(`✅ PROPERTY FEATURE MAPPING: ${featureMapping?.length || 0} records`)
    console.log(`  Trung bình: ${(featureMapping?.length / properties.length).toFixed(1)} tiện ích/tin\n`)

    // 6. Agents
    const { data: agents } = await supabase
      .from('agents')
      .select('user_id, license_number, company_name, experience_years, rating')

    console.log(`✅ AGENTS: ${agents?.length || 0} records`)
    agents?.slice(0, 3).forEach(a => {
      console.log(`  - License: ${a.license_number}`)
      console.log(`    Company: ${a.company_name} | Rating: ${a.rating}/5 | Exp: ${a.experience_years} năm`)
    })
    if (agents?.length > 3) console.log(`  ... và ${agents.length - 3} agents khác`)
    console.log()

    // 7. Property Views
    const { data: views } = await supabase
      .from('property_views')
      .select('property_id')

    console.log(`✅ PROPERTY VIEWS: ${views?.length || 0} records`)
    const viewsByProp = views?.reduce((acc, view) => {
      acc[view.property_id] = (acc[view.property_id] || 0) + 1
      return acc
    }, {})
    const topViewed = Object.entries(viewsByProp || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
    console.log('  Top 3 tin được xem nhiều nhất:')
    topViewed.forEach(([propId, count]) => {
      const prop = properties.find(p => p.id === propId)
      console.log(`    - ${prop?.title}: ${count} views`)
    })
    console.log()

    // 8. Inquiries
    const { data: inquiries } = await supabase
      .from('inquiries')
      .select('property_id, name, email, status, inquiry_type')

    console.log(`✅ INQUIRIES: ${inquiries?.length || 0} records`)
    const inqByStatus = inquiries?.reduce((acc, inq) => {
      acc[inq.status] = (acc[inq.status] || 0) + 1
      return acc
    }, {})
    console.log('  Phân bố theo trạng thái:')
    Object.entries(inqByStatus || {}).forEach(([status, count]) => {
      console.log(`    - ${status}: ${count}`)
    })
    console.log()

    // 9. Reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('property_id, rating, comment')

    console.log(`✅ REVIEWS: ${reviews?.length || 0} records`)
    const avgRating = reviews?.reduce((sum, r) => sum + r.rating, 0) / reviews?.length
    console.log(`  Đánh giá trung bình: ${avgRating?.toFixed(1)}/5 ⭐`)
    const ratingDist = reviews?.reduce((acc, r) => {
      acc[r.rating] = (acc[r.rating] || 0) + 1
      return acc
    }, {})
    console.log('  Phân bố:')
    for (let i = 5; i >= 1; i--) {
      const count = ratingDist?.[i] || 0
      const bar = '█'.repeat(Math.floor(count / 2))
      console.log(`    ${i}⭐: ${bar} ${count}`)
    }
    console.log()

    // 10. Transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('property_id, transaction_type, price, status')

    console.log(`✅ TRANSACTIONS: ${transactions?.length || 0} records`)
    const totalValue = transactions?.reduce((sum, t) => sum + (t.price || 0), 0)
    console.log(`  Tổng giá trị: ${totalValue?.toLocaleString()} VNĐ`)
    const txByType = transactions?.reduce((acc, tx) => {
      acc[tx.transaction_type] = (acc[tx.transaction_type] || 0) + 1
      return acc
    }, {})
    console.log('  Phân bố theo loại:')
    Object.entries(txByType || {}).forEach(([type, count]) => {
      console.log(`    - ${type}: ${count}`)
    })
    console.log()

    // 11. Favorites
    const { data: favorites } = await supabase
      .from('favorites')
      .select('user_id, property_id')

    console.log(`✅ FAVORITES: ${favorites?.length || 0} records\n`)

    // 12. Notifications
    const { data: notifications } = await supabase
      .from('notifications')
      .select('user_id, title, is_read')

    console.log(`✅ NOTIFICATIONS: ${notifications?.length || 0} records`)
    const unread = notifications?.filter(n => !n.is_read).length || 0
    console.log(`  Chưa đọc: ${unread} | Đã đọc: ${notifications?.length - unread}\n`)

    // 13. Profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name, phone')

    console.log(`✅ PROFILES: ${profiles?.length || 0} records\n`)

    // Final Summary
    console.log('=' .repeat(80))
    console.log('📊 TỔNG KẾT BACKEND DATA:')
    console.log('=' .repeat(80))
    console.log(`✅ Core Data:`)
    console.log(`   - ${properties.length} Properties với ${images?.length} ảnh`)
    console.log(`   - ${categories?.length} Categories và ${features?.length} Features`)
    console.log(`   - ${agents?.length} Agents đang hoạt động`)
    console.log()
    console.log(`✅ User Interactions:`)
    console.log(`   - ${views?.length} lượt xem`)
    console.log(`   - ${inquiries?.length} yêu cầu tư vấn`)
    console.log(`   - ${reviews?.length} đánh giá (${avgRating?.toFixed(1)}/5 ⭐)`)
    console.log(`   - ${favorites?.length} yêu thích`)
    console.log()
    console.log(`✅ Business Data:`)
    console.log(`   - ${transactions?.length} giao dịch`)
    console.log(`   - Tổng giá trị: ${totalValue?.toLocaleString()} VNĐ`)
    console.log()
    console.log(`✅ System:`)
    console.log(`   - ${profiles?.length} profiles`)
    console.log(`   - ${notifications?.length} notifications`)
    console.log()
    console.log('🎉 BACKEND DATA ĐÃ SẴN SÀNG ĐỂ SỬ DỤNG!')
    console.log('=' .repeat(80))

  } catch (error) {
    console.error('\n❌ Lỗi:', error.message)
  }
}

verifyBackendData()
