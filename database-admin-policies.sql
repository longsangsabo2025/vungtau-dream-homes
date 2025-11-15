-- Supabase SQL Script - Admin RLS Policies
-- Cập nhật policies để chỉ admin mới có quyền CRUD

-- Xóa các policies cũ
DROP POLICY IF EXISTS "Allow authenticated insert" ON properties;
DROP POLICY IF EXISTS "Allow authenticated update" ON properties;
DROP POLICY IF EXISTS "Allow authenticated delete" ON properties;

-- Tạo function helper để check admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT 
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() ->> 'email') = 'admin@vungtauland.store'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: Chỉ admin mới được INSERT
CREATE POLICY "Admin can insert properties" ON properties
  FOR INSERT 
  WITH CHECK (is_admin());

-- Policy: Chỉ admin mới được UPDATE
CREATE POLICY "Admin can update properties" ON properties
  FOR UPDATE 
  USING (is_admin());

-- Policy: Chỉ admin mới được DELETE
CREATE POLICY "Admin can delete properties" ON properties
  FOR DELETE 
  USING (is_admin());

-- Policy: Tất cả mọi người đều có thể SELECT (đọc)
-- (Policy này đã tồn tại, không cần tạo lại)
-- CREATE POLICY "Allow public read access" ON properties
--   FOR SELECT USING (true);
