# Type and Category Differentiation - Migration Guide

## Summary
We've differentiated the `type` and `category_id` fields to avoid duplication:

- **type**: Transaction purpose (Bán/Cho thuê)
- **category_id**: Property type (Căn hộ, Villa, Nhà phố, Đất nền, Shophouse, Condotel, Studio)

## Changes Made

### 1. Frontend Forms (✅ Completed)

**CreateProperty.tsx**
- Changed `type` field label from "Loại hình" to "Mục đích"
- Updated options from property types to transaction types: "Bán", "Cho thuê"
- Changed `category_id` label from "Danh mục" to "Loại bất động sản"
- Default type: 'Bán'

**EditProperty.tsx**
- Added `type` field with "Mục đích" label (Bán/Cho thuê)
- Moved status field to same row as type

### 2. Display Pages (✅ Completed)

**MyProperties.tsx**
- Desktop table: Added "Mục đích" and "Loại BĐS" columns
- Shows type as Badge, category from categories table
- Mobile view: Updated to show both fields

**PropertiesManagement.tsx (Admin)**
- Table columns: Added "Mục đích" and "Loại BĐS"
- View dialog: Shows both fields differentiated
- Updated query to join categories table

### 3. Database Migration (⚠️ Pending - Run SQL Script)

**What needs to be done:**
1. Clear and repopulate `categories` table with property types
2. Link existing properties to categories based on old type values
3. Update all property `type` values from property types to "Bán"

**Run this SQL in Supabase SQL Editor:**

```sql
-- 1. Clear existing categories
DELETE FROM categories;

-- 2. Insert property type categories
INSERT INTO categories (name, slug, description, display_order, is_active)
VALUES
  ('Căn hộ', 'can-ho', 'Căn hộ chung cư', 1, true),
  ('Villa', 'villa', 'Biệt thự', 2, true),
  ('Nhà phố', 'nha-pho', 'Nhà phố, nhà riêng', 3, true),
  ('Đất nền', 'dat-nen', 'Đất nền dự án, đất thổ cư', 4, true),
  ('Shophouse', 'shophouse', 'Nhà phố thương mại', 5, true),
  ('Condotel', 'condotel', 'Căn hộ khách sạn', 6, true),
  ('Studio', 'studio', 'Căn hộ studio', 7, true);

-- 3. Link existing properties to categories
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

-- 4. Update type field to transaction type
UPDATE properties
SET type = 'Bán'
WHERE type IN ('Căn hộ', 'Villa', 'Nhà phố', 'Đất nền', 'Shophouse', 'Condotel', 'Studio');

-- 5. Verify migration
SELECT 
  'Categories' as info,
  COUNT(*) as count
FROM categories
UNION ALL
SELECT 
  'Properties with category',
  COUNT(*)
FROM properties
WHERE category_id IS NOT NULL
UNION ALL
SELECT 
  'Properties with type=Bán',
  COUNT(*)
FROM properties
WHERE type = 'Bán';
```

## Testing Checklist

After running the migration:

1. **Create Property Form**
   - [ ] "Mục đích" dropdown shows: Bán, Cho thuê
   - [ ] "Loại bất động sản" dropdown shows 7 categories
   - [ ] Default values: type='Bán', first category selected
   - [ ] Form submits successfully

2. **My Properties Page**
   - [ ] Desktop: Both "Mục đích" and "Loại BĐS" columns visible
   - [ ] Mobile: Both fields shown in card view
   - [ ] Categories display correctly

3. **Admin Properties Management**
   - [ ] Table shows both columns
   - [ ] View dialog displays both fields
   - [ ] Approve/Reject actions work

4. **Public Pages**
   - [ ] Properties show correct category names
   - [ ] Filtering by category works

## Rollback Plan

If issues occur, revert the type field:

```sql
-- Restore old type values from categories
UPDATE properties p
SET type = c.name
FROM categories c
WHERE p.category_id = c.id;
```

## Notes

- All new properties will default to type='Bán'
- Users can select 'Cho thuê' for rental listings
- Categories are now the single source of truth for property types
- Type field is now for transaction purpose only
