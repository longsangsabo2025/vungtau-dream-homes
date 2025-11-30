-- Add new fields to properties table for dynamic form
-- Run this in Supabase SQL Editor

-- Add road_width column (for land, shophouse)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS road_width DECIMAL(5,2);

COMMENT ON COLUMN properties.road_width IS 'Độ rộng mặt tiền đường (m)';

-- Add land_area column (for villa, land)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS land_area DECIMAL(10,2);

COMMENT ON COLUMN properties.land_area IS 'Diện tích đất (m²), khác với area nếu có';

-- Add number_of_floors column (for villa, shophouse, nhà phố)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS number_of_floors INTEGER;

COMMENT ON COLUMN properties.number_of_floors IS 'Số tầng của ngôi nhà';

-- Update existing furniture_status values to Vietnamese
UPDATE properties
SET furniture_status = CASE
  WHEN furniture_status = 'Unfurnished' THEN 'Chưa có nội thất'
  WHEN furniture_status = 'Basic' THEN 'Nội thất cơ bản'
  WHEN furniture_status = 'Furnished' THEN 'Nội thất đầy đủ'
  WHEN furniture_status = 'Luxury' THEN 'Nội thất cao cấp'
  ELSE furniture_status
END
WHERE furniture_status IN ('Unfurnished', 'Basic', 'Furnished', 'Luxury');

-- Verify new columns
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'properties'
  AND column_name IN ('road_width', 'land_area', 'number_of_floors')
ORDER BY column_name;
