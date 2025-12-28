/**
 * Seed Database với dữ liệu mẫu cho VungTauLand
 * Fixed version - matching actual database schema
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rxjsdoylkflzsxlyccqh.supabase.co';
const SUPABASE_ACCESS_TOKEN = 'sbp_d9fd9f159ba3a08854384eedc801d9d3bc7d9c77';
const PROJECT_REF = 'rxjsdoylkflzsxlyccqh';

async function getServiceKey() {
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys?reveal=true`, {
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  const keys = await response.json();
  return keys.find(k => k.name === 'service_role')?.api_key;
}

// Categories matching schema
const categories = [
  { name: 'Căn hộ', slug: 'can-ho', icon: '🏢', description: 'Căn hộ chung cư, căn hộ dịch vụ tại Vũng Tàu', display_order: 1, is_active: true },
  { name: 'Nhà phố', slug: 'nha-pho', icon: '🏠', description: 'Nhà phố, nhà mặt tiền tại Vũng Tàu', display_order: 2, is_active: true },
  { name: 'Biệt thự', slug: 'biet-thu', icon: '🏡', description: 'Biệt thự, villa cao cấp tại Vũng Tàu', display_order: 3, is_active: true },
  { name: 'Đất nền', slug: 'dat-nen', icon: '🗺️', description: 'Đất nền, đất dự án tại Vũng Tàu', display_order: 4, is_active: true },
  { name: 'Nhà cho thuê', slug: 'nha-cho-thue', icon: '🔑', description: 'Nhà cho thuê ngắn hạn, dài hạn', display_order: 5, is_active: true },
  { name: 'Căn hộ cho thuê', slug: 'can-ho-cho-thue', icon: '🏨', description: 'Căn hộ cho thuê, homestay', display_order: 6, is_active: true },
  { name: 'Mặt bằng', slug: 'mat-bang', icon: '🏪', description: 'Mặt bằng kinh doanh, văn phòng', display_order: 7, is_active: true },
  { name: 'Khách sạn', slug: 'khach-san', icon: '🏨', description: 'Khách sạn, resort tại Vũng Tàu', display_order: 8, is_active: true },
];

// Property features
const propertyFeatures = [
  { name: 'View biển', icon: '🌊', category: 'view' },
  { name: 'Hồ bơi', icon: '🏊', category: 'amenity' },
  { name: 'Bãi đậu xe', icon: '🚗', category: 'amenity' },
  { name: 'An ninh 24/7', icon: '🔒', category: 'security' },
  { name: 'Thang máy', icon: '🛗', category: 'amenity' },
  { name: 'Gym', icon: '💪', category: 'amenity' },
  { name: 'BBQ', icon: '🍖', category: 'amenity' },
  { name: 'Sân vườn', icon: '🌳', category: 'outdoor' },
  { name: 'Gần biển', icon: '🏖️', category: 'location' },
  { name: 'Gần chợ', icon: '🛒', category: 'location' },
  { name: 'Gần trường học', icon: '🏫', category: 'location' },
  { name: 'Wifi miễn phí', icon: '📶', category: 'amenity' },
  { name: 'Điều hòa', icon: '❄️', category: 'amenity' },
  { name: 'Nội thất đầy đủ', icon: '🛋️', category: 'interior' },
  { name: 'Ban công', icon: '🌅', category: 'outdoor' },
];

// Properties matching actual schema
const properties = [
  {
    title: 'Căn hộ View Biển Vũng Tàu - Front Beach',
    location: 'Thùy Vân, Phường 2, Vũng Tàu',
    address_detail: '123 Thùy Vân',
    district: 'Thành phố Vũng Tàu',
    ward: 'Phường 2',
    type: 'apartment',
    price: 3500000000,
    area: 85,
    bedrooms: 2,
    bathrooms: 2,
    latitude: 10.3460,
    longitude: 107.0843,
    year_built: 2022,
    status: 'available',
    is_featured: true,
    furniture_status: 'full',
    legal_status: 'red_book',
    direction: 'east',
    description: `Căn hộ cao cấp view biển tuyệt đẹp tại Front Beach Vũng Tàu. 
    
Vị trí đắc địa ngay mặt tiền đường Thùy Vân, chỉ 50m đến bãi biển. Căn hộ được thiết kế hiện đại với nội thất cao cấp, view biển panorama 180 độ.

Tiện ích: Hồ bơi vô cực tầng thượng, Gym, spa đầy đủ, An ninh 24/7, Bãi đậu xe rộng rãi.

Phù hợp để ở hoặc đầu tư cho thuê với lợi nhuận cao.`,
    image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    features: ['View biển', 'Hồ bơi', 'Gym', 'An ninh 24/7', 'Thang máy', 'Ban công'],
    extra_images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    ]
  },
  {
    title: 'Biệt thự Nghỉ Dưỡng Bãi Sau - View Biển',
    location: 'Phan Chu Trinh, Phường 2, Vũng Tàu',
    address_detail: '45 Phan Chu Trinh',
    district: 'Thành phố Vũng Tàu',
    ward: 'Phường 2',
    type: 'villa',
    price: 15000000000,
    area: 350,
    bedrooms: 4,
    bathrooms: 5,
    latitude: 10.3432,
    longitude: 107.0901,
    year_built: 2021,
    status: 'available',
    is_featured: true,
    furniture_status: 'full',
    legal_status: 'red_book',
    direction: 'southeast',
    description: `Biệt thự nghỉ dưỡng cao cấp tại Bãi Sau Vũng Tàu với view biển tuyệt đẹp.

Thiết kế phong cách tropical hiện đại, sân vườn rộng rãi với hồ bơi riêng. Nội thất nhập khẩu châu Âu cao cấp.

Đặc điểm nổi bật: Diện tích sử dụng 350m2, Sân vườn và hồ bơi riêng, 4 phòng ngủ 5 phòng tắm, Garage 2 xe, Khu BBQ ngoài trời.

Phù hợp làm homestay hoặc nghỉ dưỡng gia đình.`,
    image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    features: ['View biển', 'Hồ bơi', 'Sân vườn', 'BBQ', 'Bãi đậu xe', 'Gần biển'],
    extra_images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    ]
  },
  {
    title: 'Nhà Phố Mặt Tiền Lê Hồng Phong',
    location: 'Lê Hồng Phong, Phường 4, Vũng Tàu',
    address_detail: '789 Lê Hồng Phong',
    district: 'Thành phố Vũng Tàu',
    ward: 'Phường 4',
    type: 'house',
    price: 8500000000,
    area: 320,
    bedrooms: 4,
    bathrooms: 4,
    latitude: 10.3521,
    longitude: 107.0789,
    year_built: 2020,
    status: 'available',
    is_featured: true,
    furniture_status: 'basic',
    legal_status: 'red_book',
    direction: 'south',
    total_floors: 4,
    description: `Nhà phố mặt tiền đường Lê Hồng Phong - trung tâm Vũng Tàu.

Vị trí đắc địa, phù hợp kinh doanh hoặc ở. Nhà 1 trệt 3 lầu, thiết kế hiện đại.

Chi tiết: Diện tích đất 100m2, Diện tích sử dụng 320m2, 4 phòng ngủ 4 phòng tắm, Sân thượng rộng, Mặt tiền 5m.

Pháp lý đầy đủ, sổ hồng riêng.`,
    image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    features: ['Gần chợ', 'Gần trường học', 'Bãi đậu xe', 'Ban công'],
    extra_images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
    ]
  },
  {
    title: 'Đất Nền Dự Án Phú Mỹ Gold City',
    location: 'Phú Mỹ Gold City, Phú Mỹ',
    address_detail: 'Lô A15, Phú Mỹ Gold City',
    district: 'Thị xã Phú Mỹ',
    ward: 'Phường Phú Mỹ',
    type: 'land',
    price: 1200000000,
    area: 100,
    bedrooms: 0,
    bathrooms: 0,
    latitude: 10.5435,
    longitude: 107.0621,
    year_built: null,
    status: 'available',
    is_featured: false,
    legal_status: 'red_book',
    description: `Đất nền dự án Phú Mỹ Gold City - Bà Rịa Vũng Tàu.

Vị trí: Cách Vũng Tàu 15 phút, ngay trung tâm thị xã Phú Mỹ.

Ưu điểm: Hạ tầng hoàn thiện, Pháp lý rõ ràng sổ riêng từng nền, Gần KCN Phú Mỹ Cái Mép, Tiềm năng tăng giá cao.

Thanh toán linh hoạt, hỗ trợ vay 70%.`,
    image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
    features: [],
    extra_images: [
      'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800',
    ]
  },
  {
    title: 'Căn Hộ Cho Thuê Ngắn Hạn - Bãi Trước',
    location: 'Quang Trung, Phường 1, Vũng Tàu',
    address_detail: '56 Quang Trung',
    district: 'Thành phố Vũng Tàu',
    ward: 'Phường 1',
    type: 'apartment',
    price: 15000000,
    area: 75,
    bedrooms: 2,
    bathrooms: 2,
    latitude: 10.3498,
    longitude: 107.0712,
    year_built: 2019,
    status: 'available',
    is_featured: true,
    furniture_status: 'full',
    description: `Căn hộ cho thuê ngắn hạn view Bãi Trước cực đẹp.

Phù hợp nghỉ dưỡng cuối tuần, du lịch gia đình. Đầy đủ nội thất cao cấp.

Tiện nghi: 2 phòng ngủ 2 phòng tắm, Bếp đầy đủ dụng cụ, Wifi tốc độ cao, Smart TV 55 inch, Máy giặt máy sấy.

Giá thuê từ 1.5 triệu/đêm, giảm giá cho thuê dài ngày.`,
    image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    features: ['View biển', 'Wifi miễn phí', 'Điều hòa', 'Nội thất đầy đủ', 'Gần biển'],
    extra_images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
    ]
  },
  {
    title: 'Mặt Bằng Kinh Doanh Đường Hoàng Hoa Thám',
    location: 'Hoàng Hoa Thám, Phường 2, Vũng Tàu',
    address_detail: '234 Hoàng Hoa Thám',
    district: 'Thành phố Vũng Tàu',
    ward: 'Phường 2',
    type: 'commercial',
    price: 45000000,
    area: 150,
    bedrooms: 0,
    bathrooms: 2,
    latitude: 10.3478,
    longitude: 107.0834,
    year_built: 2018,
    status: 'available',
    is_featured: false,
    description: `Cho thuê mặt bằng kinh doanh đẹp trên đường Hoàng Hoa Thám.

Vị trí đắc địa, lưu lượng khách qua lại cao. Phù hợp kinh doanh: Nhà hàng quán cafe, Shop thời trang, Showroom, Văn phòng công ty.

Diện tích 150m2, mặt tiền 8m. Có thể thuê riêng hoặc cả building.`,
    image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    features: ['Bãi đậu xe', 'Điều hòa', 'An ninh 24/7'],
    extra_images: [
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
    ]
  },
  {
    title: 'Căn Hộ The Sóng - 2PN View Biển',
    location: 'The Sóng, Thùy Vân, Phường 2, Vũng Tàu',
    address_detail: 'Tầng 15, Block A, The Sóng',
    district: 'Thành phố Vũng Tàu',
    ward: 'Phường 2',
    type: 'apartment',
    price: 4200000000,
    area: 72,
    bedrooms: 2,
    bathrooms: 2,
    latitude: 10.3445,
    longitude: 107.0856,
    year_built: 2023,
    status: 'available',
    is_featured: true,
    furniture_status: 'basic',
    floor_number: 15,
    direction: 'east',
    description: `Căn hộ The Sóng - dự án căn hộ cao cấp nhất Vũng Tàu.

Tọa lạc ngay bãi biển Thùy Vân, The Sóng mang đến trải nghiệm sống đẳng cấp.

Đặc điểm căn hộ: Diện tích 72m2, 2 phòng ngủ 2 phòng tắm, Ban công view biển, Nội thất hoàn thiện cơ bản.

Tiện ích dự án: Hồ bơi vô cực 400m2, Gym yoga spa, Sky bar tầng thượng, Bãi biển riêng.`,
    image_url: 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800',
    features: ['View biển', 'Hồ bơi', 'Gym', 'An ninh 24/7', 'Thang máy', 'Ban công', 'Gần biển'],
    extra_images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800',
    ]
  },
  {
    title: 'Nhà Phố 3 Tầng Khu Chí Linh',
    location: 'Khu Chí Linh, Phường Nguyễn An Ninh, Vũng Tàu',
    address_detail: '45 Đường số 5, Khu Chí Linh',
    district: 'Thành phố Vũng Tàu',
    ward: 'Phường Nguyễn An Ninh',
    type: 'house',
    price: 5800000000,
    area: 200,
    bedrooms: 3,
    bathrooms: 3,
    latitude: 10.3621,
    longitude: 107.0534,
    year_built: 2022,
    status: 'available',
    is_featured: false,
    furniture_status: 'full',
    legal_status: 'red_book',
    total_floors: 3,
    direction: 'north',
    description: `Bán nhà phố 3 tầng khu dân cư Chí Linh - khu vực an ninh, yên tĩnh.

Nhà mới xây 2022, thiết kế hiện đại, nội thất cao cấp.

Chi tiết: Diện tích đất 80m2 (4x20m), Diện tích sử dụng 200m2, 3 phòng ngủ + 1 phòng thờ, 3 phòng tắm, Sân thượng có mái che.

Khu vực: Gần chợ Chí Linh, Gần trường học các cấp, Gần bệnh viện, 10 phút đến biển.`,
    image_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
    features: ['Bãi đậu xe', 'Gần chợ', 'Gần trường học', 'An ninh 24/7'],
    extra_images: [
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
    ]
  },
  {
    title: 'Villa Biển Long Hải - 5 Phòng Ngủ',
    location: 'Bãi biển Long Hải, Long Điền',
    address_detail: 'Villa số 8, Bãi Long Hải',
    district: 'Huyện Long Điền',
    ward: 'Thị trấn Long Hải',
    type: 'villa',
    price: 22000000000,
    area: 500,
    bedrooms: 5,
    bathrooms: 6,
    latitude: 10.4123,
    longitude: 107.1456,
    year_built: 2020,
    status: 'available',
    is_featured: true,
    furniture_status: 'luxury',
    legal_status: 'red_book',
    direction: 'east',
    description: `Villa nghỉ dưỡng cao cấp tại Long Hải với bãi biển riêng.

Thiết kế resort style, không gian mở hòa quyện với thiên nhiên.

Chi tiết villa: Diện tích khuôn viên 500m2, Diện tích xây dựng 280m2, 5 phòng ngủ 6 phòng tắm, Hồ bơi riêng 50m2, Bãi biển riêng.

Ideal cho: Đầu tư cho thuê du lịch, Nghỉ dưỡng gia đình lớn, Tổ chức sự kiện nhỏ.`,
    image_url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800',
    features: ['View biển', 'Hồ bơi', 'Sân vườn', 'BBQ', 'Bãi đậu xe', 'Gần biển', 'Nội thất đầy đủ'],
    extra_images: [
      'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    ]
  },
  {
    title: 'Căn Hộ Studio Cho Thuê Tháng',
    location: 'Trần Phú, Phường 5, Vũng Tàu',
    address_detail: '12 Trần Phú',
    district: 'Thành phố Vũng Tàu',
    ward: 'Phường 5',
    type: 'apartment',
    price: 5000000,
    area: 30,
    bedrooms: 1,
    bathrooms: 1,
    latitude: 10.3534,
    longitude: 107.0767,
    year_built: 2021,
    status: 'available',
    is_featured: false,
    furniture_status: 'full',
    description: `Căn hộ studio đầy đủ tiện nghi cho thuê dài hạn.

Phù hợp cho: Người đi làm độc thân, Sinh viên, Couple.

Tiện nghi đầy đủ: Giường 1m6, Tủ quần áo, Bếp nhỏ gọn, Máy lạnh, Máy nước nóng, Wifi miễn phí.

Vị trí thuận tiện, gần trung tâm, gần biển.`,
    image_url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
    features: ['Wifi miễn phí', 'Điều hòa', 'Nội thất đầy đủ', 'Gần biển'],
    extra_images: [
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
    ]
  },
];

async function main() {
  console.log('🌱 SEED DATABASE - VungTauLand (Fixed)');
  console.log('======================================\n');
  
  console.log('🔑 Getting service key...');
  const serviceKey = await getServiceKey();
  if (!serviceKey) {
    console.error('❌ Could not get service key');
    return;
  }
  
  const supabase = createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  // 1. Seed Categories
  console.log('\n📁 Seeding categories...');
  for (const cat of categories) {
    const { data, error } = await supabase.from('categories').upsert(cat, { onConflict: 'slug' }).select();
    if (error) {
      console.log(`   ⚠️ ${cat.name}: ${error.message}`);
    } else {
      console.log(`   ✅ ${cat.name}`);
    }
  }
  
  // 2. Seed Property Features (insert, not upsert since no unique constraint)
  console.log('\n🏷️ Seeding property features...');
  // First check if features exist
  const { data: existingFeatures } = await supabase.from('property_features').select('name');
  const existingNames = new Set(existingFeatures?.map(f => f.name) || []);
  
  for (const feature of propertyFeatures) {
    if (existingNames.has(feature.name)) {
      console.log(`   ⏭️ ${feature.name} (exists)`);
      continue;
    }
    const { error } = await supabase.from('property_features').insert(feature);
    if (error) {
      console.log(`   ⚠️ ${feature.name}: ${error.message}`);
    } else {
      console.log(`   ✅ ${feature.name}`);
    }
  }
  
  // Get all features for mapping
  const { data: allFeatures } = await supabase.from('property_features').select('id, name');
  const featureMap = new Map(allFeatures?.map(f => [f.name, f.id]) || []);
  
  // Get category for mapping
  const { data: allCategories } = await supabase.from('categories').select('id, slug');
  const categoryMap = new Map(allCategories?.map(c => [c.slug, c.id]) || []);
  
  // 3. Seed Properties
  console.log('\n🏠 Seeding properties...');
  for (const prop of properties) {
    const { features, extra_images, ...propertyData } = prop;
    
    // Determine category based on type
    let categorySlug = 'can-ho';
    if (prop.type === 'house') categorySlug = 'nha-pho';
    else if (prop.type === 'villa') categorySlug = 'biet-thu';
    else if (prop.type === 'land') categorySlug = 'dat-nen';
    else if (prop.type === 'commercial') categorySlug = 'mat-bang';
    else if (prop.price < 50000000 && prop.type === 'apartment') categorySlug = 'can-ho-cho-thue';
    
    const categoryId = categoryMap.get(categorySlug);
    
    // Insert property
    const insertData = { 
      ...propertyData, 
      category_id: categoryId,
      approval_status: 'approved',
      published_at: new Date().toISOString()
    };
    
    const { data: insertedProp, error: propError } = await supabase
      .from('properties')
      .insert(insertData)
      .select()
      .single();
    
    if (propError) {
      console.log(`   ⚠️ ${prop.title}: ${propError.message}`);
      continue;
    }
    console.log(`   ✅ ${prop.title}`);
    
    // Insert extra images
    if (extra_images && insertedProp) {
      for (let i = 0; i < extra_images.length; i++) {
        await supabase.from('property_images').insert({
          property_id: insertedProp.id,
          image_url: extra_images[i],
          is_primary: false,
          display_order: i + 2
        });
      }
    }
    
    // Insert feature mappings
    if (features && insertedProp) {
      for (const featureName of features) {
        const featureId = featureMap.get(featureName);
        if (featureId) {
          await supabase.from('property_feature_mapping').insert({
            property_id: insertedProp.id,
            feature_id: featureId
          });
        }
      }
    }
  }
  
  // Summary
  console.log('\n📊 SUMMARY');
  console.log('==========');
  
  const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  const { count: propCount } = await supabase.from('properties').select('*', { count: 'exact', head: true });
  const { count: featCount } = await supabase.from('property_features').select('*', { count: 'exact', head: true });
  const { count: imgCount } = await supabase.from('property_images').select('*', { count: 'exact', head: true });
  
  console.log(`   Categories: ${catCount}`);
  console.log(`   Properties: ${propCount}`);
  console.log(`   Features: ${featCount}`);
  console.log(`   Images: ${imgCount}`);
  
  console.log('\n======================================');
  console.log('✅ Seed completed!');
}

main().catch(console.error);
