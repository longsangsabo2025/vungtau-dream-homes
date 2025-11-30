-- Update categories table with property types (not transaction types)
-- Run this in Supabase SQL Editor

-- Clear existing categories
DELETE FROM categories;

-- Insert property type categories
-- These represent WHAT the property is (Căn hộ, Villa...), not the purpose (Bán/Cho thuê)
INSERT INTO categories (name, slug, description, display_order, is_active)
VALUES
  ('Căn hộ', 'can-ho', 'Căn hộ chung cư', 1, true),
  ('Villa', 'villa', 'Biệt thự', 2, true),
  ('Nhà phố', 'nha-pho', 'Nhà phố, nhà riêng', 3, true),
  ('Đất nền', 'dat-nen', 'Đất nền dự án, đất thổ cư', 4, true),
  ('Shophouse', 'shophouse', 'Nhà phố thương mại', 5, true),
  ('Condotel', 'condotel', 'Căn hộ khách sạn', 6, true),
  ('Studio', 'studio', 'Căn hộ studio', 7, true);

-- Update existing properties to link to categories
-- Map old "type" values (which were property types) to new category_id
UPDATE properties p
SET category_id = c.id
FROM categories c
WHERE p.category_id IS NULL
  AND (
    (p.type = 'Căn hộ' AND c.slug = 'can-ho') OR
    (p.type = 'Villa' AND c.slug = 'villa') OR
    (p.type = 'Nhà phố' AND c.slug = 'nha-pho') OR
    (p.type = 'Đất nền' AND c.slug = 'dat-nen') OR
    (p.type = 'Shophouse' AND c.slug = 'shophouse') OR
    (p.type = 'Condotel' AND c.slug = 'condotel') OR
    (p.type = 'Studio' AND c.slug = 'studio')
  );

-- Now update all "type" values to transaction types (Bán)
-- Since we don't have existing transaction type data, default all to 'Bán'
UPDATE properties
SET type = 'Bán'
WHERE type IN ('Căn hộ', 'Villa', 'Nhà phố', 'Đất nền', 'Shophouse', 'Condotel', 'Studio');

-- Verify results
SELECT 
  'Categories' as table_name,
  COUNT(*) as count
FROM categories
UNION ALL
SELECT 
  'Properties with category' as table_name,
  COUNT(*) as count
FROM properties
WHERE category_id IS NOT NULL
UNION ALL
SELECT 
  'Properties with Bán type' as table_name,
  COUNT(*) as count
FROM properties
WHERE type = 'Bán';
