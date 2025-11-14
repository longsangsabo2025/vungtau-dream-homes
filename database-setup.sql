-- Supabase SQL Script for Vungtau Dream Homes
-- This script creates the properties table and inserts sample data

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL,
  price BIGINT NOT NULL,
  location VARCHAR NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area INTEGER NOT NULL,
  image_url VARCHAR NOT NULL,
  description TEXT,
  type VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'Có sẵn',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to all users
CREATE POLICY "Allow public read access" ON properties
  FOR SELECT USING (true);

-- Create policy to allow insert for authenticated users (optional)
CREATE POLICY "Allow authenticated insert" ON properties
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow update for authenticated users (optional)
CREATE POLICY "Allow authenticated update" ON properties
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy to allow delete for authenticated users (optional)
CREATE POLICY "Allow authenticated delete" ON properties
  FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample data
INSERT INTO properties (title, price, location, bedrooms, bathrooms, area, image_url, description, type, status) VALUES
('Villa biển view tuyệt đẹp', 8500000000, 'Bãi Trước, Vũng Tàu', 4, 3, 250, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Villa sang trọng với view biển tuyệt đẹp, thiết kế hiện đại, đầy đủ nội thất cao cấp.', 'Villa', 'Có sẵn'),

('Căn hộ cao cấp The Sóng', 3200000000, 'Thùy Vân, Vũng Tàu', 2, 2, 85, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Căn hộ view biển tại dự án The Sóng, đầy đủ tiện ích, gần biển Thùy Vân.', 'Căn hộ', 'Hot'),

('Nhà phố trung tâm thành phố', 4500000000, 'Nguyễn Thái Học, Vũng Tàu', 3, 2, 120, 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Nhà phố 3 tầng tại trung tâm thành phố, gần chợ, trường học, tiện kinh doanh.', 'Nhà phố', 'Có sẵn'),

('Đất nền dự án Diamond City', 2100000000, 'Long Điền, Bà Rịa - Vũng Tàu', 0, 0, 100, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Đất nền sổ đỏ tại dự án Diamond City, pháp lý rõ ràng, hạ tầng hoàn thiện.', 'Đất nền', 'Nổi bật'),

('Biệt thự nghỉ dưỡng Hồ Tràm', 12000000000, 'Hồ Tràm, Xuyên Mộc', 5, 4, 350, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Biệt thự nghỉ dưỡng sang trọng tại Hồ Tràm, có hồ bơi riêng, vườn tận hưởng.', 'Biệt thự', 'Hot'),

('Shophouse mặt tiền biển', 6800000000, 'Bãi Sau, Vũng Tàu', 1, 1, 80, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Shophouse mặt tiền đường biển Bãi Sau, vị trí đắc địa để kinh doanh.', 'Shophouse', 'Có sẵn'),

('Căn hộ studio The Coastal', 1800000000, 'Bãi Trước, Vũng Tàu', 1, 1, 45, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Studio hiện đại tại The Coastal, view biển, đầy đủ nội thất, sẵn sàng ở ngay.', 'Studio', 'Nổi bật'),

('Nhà mặt tiền Lê Hồng Phong', 5500000000, 'Lê Hồng Phong, Vũng Tàu', 4, 3, 150, 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Nhà mặt tiền đường Lê Hồng Phong, 4 tầng, thích hợp kinh doanh và ở.', 'Nhà mặt tiền', 'Có sẵn'),

('Condotel Ocean Vista', 2800000000, 'Thùy Vân, Vũng Tàu', 1, 1, 55, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Condotel Ocean Vista với view biển 180°, cam kết lợi nhuận cho thuê.', 'Condotel', 'Hot'),

('Đất thổ cư Huyện Long Điền', 1500000000, 'Long Điền, Bà Rịa - Vũng Tàu', 0, 0, 150, 'https://images.unsplash.com/photo-1500076656116-558758c991c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Đất thổ cư 100% tại Long Điền, gần khu công nghiệp, tiềm năng phát triển cao.', 'Đất thổ cư', 'Có sẵn');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_properties_updated_at 
    BEFORE UPDATE ON properties 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();