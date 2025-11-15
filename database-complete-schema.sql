-- ============================================================================
-- VUNGTAU DREAM HOMES - COMPLETE DATABASE SCHEMA
-- Real Estate Management System
-- ============================================================================

-- 1. PROFILES TABLE (extends auth.users)
-- Thông tin chi tiết người dùng
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  bio TEXT,
  address TEXT,
  city VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user', -- user, agent, admin
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AGENTS TABLE
-- Nhân viên môi giới bất động sản
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  license_number VARCHAR(100),
  company_name VARCHAR(255),
  specialization VARCHAR(255), -- Villa, Apartment, Land, etc.
  experience_years INTEGER,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. CATEGORIES TABLE
-- Phân loại chi tiết properties
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. UPDATE PROPERTIES TABLE
-- Thêm các cột cần thiết vào bảng properties hiện tại
ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS address_detail TEXT,
  ADD COLUMN IF NOT EXISTS district VARCHAR(100),
  ADD COLUMN IF NOT EXISTS ward VARCHAR(100),
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
  ADD COLUMN IF NOT EXISTS year_built INTEGER,
  ADD COLUMN IF NOT EXISTS floor_number INTEGER,
  ADD COLUMN IF NOT EXISTS total_floors INTEGER,
  ADD COLUMN IF NOT EXISTS parking_slots INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS direction VARCHAR(50), -- Hướng nhà: Đông, Tây, Nam, Bắc
  ADD COLUMN IF NOT EXISTS legal_status VARCHAR(100), -- Sổ đỏ, sổ hồng, etc.
  ADD COLUMN IF NOT EXISTS furniture_status VARCHAR(50), -- Fully furnished, Unfurnished, etc.
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contact_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- 5. PROPERTY_IMAGES TABLE
-- Nhiều ảnh cho mỗi property
CREATE TABLE IF NOT EXISTS public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PROPERTY_FEATURES TABLE
-- Tiện ích của properties
CREATE TABLE IF NOT EXISTS public.property_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  category VARCHAR(50), -- Interior, Exterior, Amenities, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PROPERTY_FEATURE_MAPPING
-- Many-to-many relationship giữa properties và features
CREATE TABLE IF NOT EXISTS public.property_feature_mapping (
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  feature_id UUID REFERENCES public.property_features(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (property_id, feature_id)
);

-- 8. FAVORITES TABLE
-- Danh sách yêu thích của user
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- 9. PROPERTY_VIEWS TABLE
-- Tracking lượt xem chi tiết
CREATE TABLE IF NOT EXISTS public.property_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CONTACTS/INQUIRIES TABLE
-- Liên hệ từ khách hàng
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  inquiry_type VARCHAR(50), -- viewing, purchase, rent, info
  status VARCHAR(50) DEFAULT 'new', -- new, contacted, scheduled, closed
  agent_notes TEXT,
  contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. REVIEWS TABLE
-- Đánh giá properties và agents
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (property_id IS NOT NULL OR agent_id IS NOT NULL)
);

-- 12. TRANSACTIONS/BOOKINGS TABLE
-- Giao dịch mua/thuê
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  transaction_type VARCHAR(50) NOT NULL, -- sale, rent
  price BIGINT NOT NULL,
  commission BIGINT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  contract_url TEXT,
  signed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. NOTIFICATIONS TABLE
-- Thông báo cho users
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50), -- property, inquiry, transaction, system
  reference_id UUID, -- ID của property, inquiry, etc.
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. SAVED_SEARCHES TABLE
-- Lưu tìm kiếm của user
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  search_params JSONB NOT NULL, -- Store search criteria as JSON
  notify_new_matches BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_agent_id ON public.properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_category_id ON public.properties(category_id);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_location ON public.properties(location);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_is_featured ON public.properties(is_featured);

-- Property images indexes
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON public.property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_is_primary ON public.property_images(is_primary);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON public.favorites(property_id);

-- Property views indexes
CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON public.property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_viewed_at ON public.property_views(viewed_at DESC);

-- Inquiries indexes
CREATE INDEX IF NOT EXISTS idx_inquiries_property_id ON public.inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON public.inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON public.reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_agent_id ON public.reviews(agent_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_property_id ON public.transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON public.transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- ============================================================================
-- TRIGGERS for updated_at
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_searches_updated_at BEFORE UPDATE ON public.saved_searches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_feature_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can do anything with profiles" ON public.profiles USING (is_admin());

-- Agents policies
CREATE POLICY "Agents are viewable by everyone" ON public.agents FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage agents" ON public.agents USING (is_admin());

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage categories" ON public.categories USING (is_admin());

-- Property images policies
CREATE POLICY "Property images are viewable by everyone" ON public.property_images FOR SELECT USING (true);
CREATE POLICY "Admin can manage property images" ON public.property_images USING (is_admin());

-- Property features policies
CREATE POLICY "Features are viewable by everyone" ON public.property_features FOR SELECT USING (true);
CREATE POLICY "Admin can manage features" ON public.property_features USING (is_admin());

-- Property feature mapping policies
CREATE POLICY "Feature mappings are viewable by everyone" ON public.property_feature_mapping FOR SELECT USING (true);
CREATE POLICY "Admin can manage feature mappings" ON public.property_feature_mapping USING (is_admin());

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- Property views policies (insert only for tracking)
CREATE POLICY "Anyone can insert property views" ON public.property_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can view all property views" ON public.property_views FOR SELECT USING (is_admin());

-- Inquiries policies
CREATE POLICY "Users can view own inquiries" ON public.inquiries FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Anyone can create inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can manage inquiries" ON public.inquiries USING (is_admin());

-- Reviews policies
CREATE POLICY "Published reviews are viewable by everyone" ON public.reviews FOR SELECT USING (is_published = true OR auth.uid() = user_id OR is_admin());
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage reviews" ON public.reviews USING (is_admin());

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR is_admin());
CREATE POLICY "Admin can manage transactions" ON public.transactions USING (is_admin());

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin can create notifications" ON public.notifications FOR INSERT WITH CHECK (is_admin());

-- Saved searches policies
CREATE POLICY "Users can view own saved searches" ON public.saved_searches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own saved searches" ON public.saved_searches USING (auth.uid() = user_id);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default categories
INSERT INTO public.categories (name, slug, description, icon, display_order) VALUES
  ('Căn hộ', 'can-ho', 'Căn hộ chung cư các loại', '🏢', 1),
  ('Villa', 'villa', 'Biệt thự cao cấp', '🏰', 2),
  ('Nhà phố', 'nha-pho', 'Nhà phố liền kề', '🏘️', 3),
  ('Đất nền', 'dat-nen', 'Đất nền dự án', '🗺️', 4),
  ('Shophouse', 'shophouse', 'Nhà phố thương mại', '🏪', 5),
  ('Condotel', 'condotel', 'Căn hộ khách sạn', '🏨', 6),
  ('Studio', 'studio', 'Căn hộ Studio', '🛏️', 7)
ON CONFLICT (slug) DO NOTHING;

-- Insert default property features
INSERT INTO public.property_features (name, icon, category) VALUES
  ('Hồ bơi', '🏊', 'Amenities'),
  ('Phòng gym', '💪', 'Amenities'),
  ('Sân vườn', '🌳', 'Exterior'),
  ('Ban công', '🪴', 'Interior'),
  ('Bãi đậu xe', '🚗', 'Exterior'),
  ('An ninh 24/7', '🔒', 'Amenities'),
  ('Thang máy', '🛗', 'Interior'),
  ('Điều hòa', '❄️', 'Interior'),
  ('Nóng lạnh', '🚿', 'Interior'),
  ('Bếp hiện đại', '🍳', 'Interior'),
  ('View biển', '🌊', 'Exterior'),
  ('View thành phố', '🏙️', 'Exterior'),
  ('Sân thượng', '🏖️', 'Exterior'),
  ('Phòng giặt', '🧺', 'Interior')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMPLETED!
-- ============================================================================
