# Hướng dẫn Cập nhật RLS Policies cho Admin

## ⚠️ QUAN TRỌNG: Phải chạy SQL này để admin có quyền CRUD

Hiện tại **BẤT KỲ user nào đã đăng nhập** cũng có thể thêm/sửa/xóa BĐS.  
Sau khi chạy SQL này, **CHỈ admin** mới có quyền CRUD.

---

## Cách thực hiện:

### Bước 1: Mở Supabase SQL Editor
1. Vào: https://supabase.com/dashboard/project/rxjsdoylkflzsxlyccqh/sql/new
2. Hoặc: Dashboard → SQL Editor → New query

### Bước 2: Copy toàn bộ SQL dưới đây và RUN

```sql
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

-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'properties';
```

### Bước 3: Kiểm tra kết quả
Sau khi RUN thành công, bạn sẽ thấy output cuối cùng hiển thị 4 policies:
- `Allow public read access` - SELECT cho mọi người
- `Admin can insert properties` - INSERT chỉ admin
- `Admin can update properties` - UPDATE chỉ admin
- `Admin can delete properties` - DELETE chỉ admin

---

## Kết quả mong đợi:

✅ **Admin** (admin@vungtauland.store):
- ✓ Xem danh sách BĐS
- ✓ Thêm BĐS mới
- ✓ Sửa BĐS
- ✓ Xóa BĐS

✅ **User thường**:
- ✓ Xem danh sách BĐS
- ✗ KHÔNG thể thêm/sửa/xóa

✅ **Khách (chưa đăng nhập)**:
- ✓ Xem danh sách BĐS
- ✗ KHÔNG thể thêm/sửa/xóa

---

## Test sau khi setup:

1. Đăng nhập với admin: `admin@vungtauland.store` / `admin2026`
2. Vào `/admin/properties/new`
3. Thử thêm 1 BĐS mới
4. Kiểm tra có thành công không

**Nếu gặp lỗi "new row violates row-level security policy"**:
- Có thể do function `is_admin()` không hoạt động đúng
- Kiểm tra lại user metadata có `role: 'admin'` không
- Hoặc email có đúng `admin@vungtauland.store` không
