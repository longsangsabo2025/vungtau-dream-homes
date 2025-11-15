import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.rxjsdoylkflzsxlyccqh:Acookingoil123@@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

console.log('🎲 TẠO MOCK DATA ĐẦY ĐỦ CHO TẤT CẢ CÁC BẢNG\n');
console.log('='.repeat(80) + '\n');

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function createMockData() {
  try {
    await client.connect();
    console.log('✅ Kết nối database thành công\n');

    // Lấy properties hiện có
    const propertiesResult = await client.query('SELECT * FROM properties ORDER BY created_at LIMIT 10');
    const properties = propertiesResult.rows;
    
    console.log(`📊 Đã có ${properties.length} properties trong database\n`);

    // 1. LẤY USERS TỪ AUTH.USERS
    console.log('👥 1. Lấy users từ auth.users...');
    
    const usersResult = await client.query('SELECT id FROM auth.users LIMIT 10');
    let users = usersResult.rows.map(u => u.id);
    
    console.log(`   ✅ Found ${users.length} users from auth.users\n`);
    
    // Tạo profiles cho users
    if (users.length > 0) {
      for (let i = 0; i < users.length; i++) {
        try {
          await client.query(`
            INSERT INTO profiles (id, full_name, phone, address, city, role)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO NOTHING
          `, [
            users[i],
            `User ${i + 1}`,
            `090${1000000 + i}`,
            `${i + 1} Đường ABC`,
            'Vũng Tàu',
            i === 0 ? 'agent' : 'user'
          ]);
        } catch (err) {
          // Skip
        }
      }
    }

    // 2. TẠO AGENTS
    console.log('🏢 2. Tạo agents...');
    const agents = [];
    
    for (let i = 0; i < 3; i++) {
      try {
        const agentResult = await client.query(`
          INSERT INTO agents (user_id, license_number, company_name, specialization, experience_years, rating, total_sales)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
        `, [
          users[i] || null,
          `LIC-VT-${2024000 + i}`,
          ['Vũng Tàu Land', 'Bà Rịa Properties', 'Dream Homes VT'][i],
          ['Villa', 'Căn hộ', 'Đất nền'][i],
          5 + i * 2,
          4.5 + (i * 0.2),
          20 + i * 10
        ]);
        agents.push(agentResult.rows[0].id);
      } catch (err) {
        console.log(`   ⚠️  Skip agent ${i + 1}: ${err.message}`);
      }
    }
    console.log(`   ✅ Created ${agents.length} agents\n`);

    // 3. CẬP NHẬT PROPERTIES với agent_id và category_id
    console.log('🏠 3. Cập nhật properties với agents & categories...');
    
    const categoryMap = {
      'Villa': await getCategoryId('villa'),
      'Căn hộ': await getCategoryId('can-ho'),
      'Nhà phố': await getCategoryId('nha-pho'),
      'Đất nền': await getCategoryId('dat-nen'),
      'Shophouse': await getCategoryId('shophouse'),
      'Condotel': await getCategoryId('condotel'),
      'Studio': await getCategoryId('studio')
    };

    for (let i = 0; i < properties.length; i++) {
      const prop = properties[i];
      const categoryId = categoryMap[prop.type] || categoryMap['Căn hộ'];
      const agentId = agents[i % agents.length];
      const ownerId = users[(i + 1) % users.length];

      await client.query(`
        UPDATE properties 
        SET 
          agent_id = $1,
          category_id = $2,
          owner_id = $3,
          district = $4,
          ward = $5,
          latitude = $6,
          longitude = $7,
          year_built = $8,
          floor_number = $9,
          parking_slots = $10,
          direction = $11,
          legal_status = $12,
          furniture_status = $13,
          is_featured = $14,
          is_verified = $15,
          published_at = NOW()
        WHERE id = $16
      `, [
        agentId,
        categoryId,
        ownerId,
        'Phường ' + (i % 5 + 1),
        'Xã ' + (i % 3 + 1),
        10.3 + (i * 0.01),
        107.0 + (i * 0.01),
        2015 + (i % 8),
        (i % 10) + 1,
        1 + (i % 3),
        ['Đông', 'Tây', 'Nam', 'Bắc'][i % 4],
        ['Sổ đỏ', 'Sổ hồng'][i % 2],
        ['Fully furnished', 'Semi furnished', 'Unfurnished'][i % 3],
        i < 3,
        true,
        prop.id
      ]);
    }
    console.log(`   ✅ Updated ${properties.length} properties\n`);

    // 4. TẠO PROPERTY IMAGES
    console.log('🖼️  4. Tạo property images...');
    let imageCount = 0;
    
    const sampleImages = [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'
    ];

    for (const prop of properties) {
      for (let j = 0; j < 5; j++) {
        await client.query(`
          INSERT INTO property_images (property_id, image_url, caption, display_order, is_primary)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          prop.id,
          sampleImages[j] + `?w=800&q=80&sig=${prop.id}-${j}`,
          `Hình ${j + 1} - ${prop.title}`,
          j,
          j === 0
        ]);
        imageCount++;
      }
    }
    console.log(`   ✅ Created ${imageCount} property images\n`);

    // 5. LIÊN KẾT PROPERTY FEATURES
    console.log('✨ 5. Liên kết property features...');
    
    const featuresResult = await client.query('SELECT id FROM property_features LIMIT 10');
    const features = featuresResult.rows;
    let featureMappingCount = 0;

    for (const prop of properties) {
      // Mỗi property có 3-6 features ngẫu nhiên
      const numFeatures = 3 + (Math.floor(Math.random() * 4));
      const selectedFeatures = features.slice(0, numFeatures);
      
      for (const feature of selectedFeatures) {
        try {
          await client.query(`
            INSERT INTO property_feature_mapping (property_id, feature_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `, [prop.id, feature.id]);
          featureMappingCount++;
        } catch (err) {
          // Skip duplicates
        }
      }
    }
    console.log(`   ✅ Created ${featureMappingCount} feature mappings\n`);

    // 6. TẠO FAVORITES
    console.log('❤️  6. Tạo favorites...');
    let favoritesCount = 0;
    
    for (let i = 0; i < users.length; i++) {
      const numFavorites = 2 + (i % 3);
      for (let j = 0; j < numFavorites && j < properties.length; j++) {
        try {
          await client.query(`
            INSERT INTO favorites (user_id, property_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `, [users[i], properties[j].id]);
          favoritesCount++;
        } catch (err) {
          // Skip
        }
      }
    }
    console.log(`   ✅ Created ${favoritesCount} favorites\n`);

    // 7. TẠO PROPERTY VIEWS
    console.log('👁️  7. Tạo property views...');
    let viewsCount = 0;
    
    for (const prop of properties) {
      const numViews = 10 + Math.floor(Math.random() * 50);
      for (let i = 0; i < numViews; i++) {
        await client.query(`
          INSERT INTO property_views (property_id, user_id, ip_address)
          VALUES ($1, $2, $3)
        `, [
          prop.id,
          i % 2 === 0 ? users[i % users.length] : null,
          `192.168.1.${100 + i}`
        ]);
        viewsCount++;
      }
    }
    
    // Update view_count
    for (const prop of properties) {
      const countResult = await client.query(
        'SELECT COUNT(*) as count FROM property_views WHERE property_id = $1',
        [prop.id]
      );
      await client.query(
        'UPDATE properties SET view_count = $1 WHERE id = $2',
        [countResult.rows[0].count, prop.id]
      );
    }
    
    console.log(`   ✅ Created ${viewsCount} property views\n`);

    // 8. TẠO INQUIRIES
    console.log('📧 8. Tạo inquiries...');
    let inquiriesCount = 0;
    
    const inquiryTypes = ['viewing', 'purchase', 'rent', 'info'];
    const statuses = ['new', 'contacted', 'scheduled', 'closed'];
    
    for (let i = 0; i < properties.length * 2; i++) {
      const prop = properties[i % properties.length];
      await client.query(`
        INSERT INTO inquiries (
          property_id, user_id, name, email, phone, message, 
          inquiry_type, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        prop.id,
        i % 3 === 0 ? users[i % users.length] : null,
        `Customer ${i + 1}`,
        `customer${i + 1}@example.com`,
        `091${1000000 + i}`,
        `Tôi quan tâm đến ${prop.title}. Xin vui lòng liên hệ lại.`,
        inquiryTypes[i % inquiryTypes.length],
        statuses[i % statuses.length]
      ]);
      inquiriesCount++;
    }
    console.log(`   ✅ Created ${inquiriesCount} inquiries\n`);

    // 9. TẠO REVIEWS
    console.log('⭐ 9. Tạo reviews...');
    let reviewsCount = 0;
    
    if (users.length > 0) {
      const reviewTitles = [
        'Tuyệt vời!',
        'Rất hài lòng',
        'Dịch vụ tốt',
        'Đáng giá tiền',
        'Hoàn hảo'
      ];
      
      const reviewComments = [
        'BĐS rất đẹp, vị trí thuận lợi, giá cả hợp lý.',
        'Nhân viên tư vấn nhiệt tình, chuyên nghiệp.',
        'Quy trình nhanh gọn, minh bạch.',
        'Chất lượng tốt, đúng như mô tả.',
        'Rất hài lòng với dịch vụ!'
      ];
      
      for (let i = 0; i < properties.length; i++) {
        const numReviews = 1 + (i % 3);
        for (let j = 0; j < numReviews && j < users.length; j++) {
          await client.query(`
            INSERT INTO reviews (
              property_id, user_id, rating, title, comment, is_verified, is_published
            )
            VALUES ($1, $2, $3, $4, $5, true, true)
          `, [
            properties[i].id,
            users[j % users.length],
            4 + Math.floor(Math.random() * 2), // 4-5 stars
            reviewTitles[j % reviewTitles.length],
            reviewComments[j % reviewComments.length]
          ]);
          reviewsCount++;
        }
      }
    }
    console.log(`   ✅ Created ${reviewsCount} reviews\n`);

    // 10. TẠO TRANSACTIONS
    console.log('💰 10. Tạo transactions...');
    let transactionsCount = 0;
    
    for (let i = 0; i < 5; i++) {
      const prop = properties[i];
      await client.query(`
        INSERT INTO transactions (
          property_id, buyer_id, seller_id, agent_id, 
          transaction_type, price, commission, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        prop.id,
        users[i % users.length],
        users[(i + 1) % users.length],
        agents[i % agents.length],
        i % 2 === 0 ? 'sale' : 'rent',
        prop.price,
        Math.floor(prop.price * 0.02), // 2% commission
        ['pending', 'confirmed', 'completed'][i % 3]
      ]);
      transactionsCount++;
    }
    console.log(`   ✅ Created ${transactionsCount} transactions\n`);

    // 11. TẠO NOTIFICATIONS
    console.log('🔔 11. Tạo notifications...');
    let notificationsCount = 0;
    
    for (const userId of users) {
      for (let i = 0; i < 3; i++) {
        await client.query(`
          INSERT INTO notifications (user_id, title, message, type, is_read)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          userId,
          ['Có BĐS mới phù hợp', 'Liên hệ mới', 'Giao dịch thành công'][i],
          ['Có 5 BĐS mới phù hợp với tìm kiếm của bạn', 'Bạn có 1 yêu cầu liên hệ mới', 'Giao dịch của bạn đã hoàn tất'][i],
          ['property', 'inquiry', 'transaction'][i],
          i === 2
        ]);
        notificationsCount++;
      }
    }
    console.log(`   ✅ Created ${notificationsCount} notifications\n`);

    console.log('='.repeat(80));
    console.log('\n🎉 HOÀN THÀNH TẠO MOCK DATA!\n');
    
    // Summary
    const summary = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM profiles) as profiles,
        (SELECT COUNT(*) FROM agents) as agents,
        (SELECT COUNT(*) FROM properties) as properties,
        (SELECT COUNT(*) FROM property_images) as images,
        (SELECT COUNT(*) FROM property_feature_mapping) as feature_mappings,
        (SELECT COUNT(*) FROM favorites) as favorites,
        (SELECT COUNT(*) FROM property_views) as views,
        (SELECT COUNT(*) FROM inquiries) as inquiries,
        (SELECT COUNT(*) FROM reviews) as reviews,
        (SELECT COUNT(*) FROM transactions) as transactions,
        (SELECT COUNT(*) FROM notifications) as notifications
    `);
    
    const data = summary.rows[0];
    console.log('📊 TỔNG KẾT:\n');
    console.log(`   👥 Profiles: ${data.profiles}`);
    console.log(`   🏢 Agents: ${data.agents}`);
    console.log(`   🏠 Properties: ${data.properties}`);
    console.log(`   🖼️  Property Images: ${data.images}`);
    console.log(`   ✨ Feature Mappings: ${data.feature_mappings}`);
    console.log(`   ❤️  Favorites: ${data.favorites}`);
    console.log(`   👁️  Property Views: ${data.views}`);
    console.log(`   📧 Inquiries: ${data.inquiries}`);
    console.log(`   ⭐ Reviews: ${data.reviews}`);
    console.log(`   💰 Transactions: ${data.transactions}`);
    console.log(`   🔔 Notifications: ${data.notifications}\n`);
    
    console.log('✅ Database đã có đầy đủ data với mối quan hệ giữa các bảng!');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ LỖI:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

async function getCategoryId(slug) {
  const result = await client.query('SELECT id FROM categories WHERE slug = $1', [slug]);
  return result.rows[0]?.id;
}

createMockData();
