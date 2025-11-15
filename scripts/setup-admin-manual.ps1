$serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4anNkb3lsa2ZsenN4bHljY3FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA0MTMyMiwiZXhwIjoyMDc4NjE3MzIyfQ.R4o78VFAuz2mj_x9aEKRZgAIorTtOyCSEZVoeg7WUxA"
$projectRef = "rxjsdoylkflzsxlyccqh"

Write-Host "📋 HƯỚNG DẪN CẬP NHẬT RLS POLICIES CHO ADMIN" -ForegroundColor Cyan
Write-Host "=" -ForegroundColor Gray -NoNewline; Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host ""

Write-Host "Vì không thể kết nối trực tiếp database, bạn cần chạy SQL thủ công:" -ForegroundColor Yellow
Write-Host ""

Write-Host "BƯỚC 1: Mở Supabase SQL Editor" -ForegroundColor Green
Write-Host "   Đang mở browser..." -ForegroundColor Gray
Start-Process "https://supabase.com/dashboard/project/$projectRef/sql/new"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "BƯỚC 2: Copy toàn bộ SQL dưới đây" -ForegroundColor Green
Write-Host "=" -ForegroundColor Gray -NoNewline; Write-Host ("=" * 60) -ForegroundColor Gray

$sql = @"
-- Xóa các policies cũ
DROP POLICY IF EXISTS "Allow authenticated insert" ON properties;
DROP POLICY IF EXISTS "Allow authenticated update" ON properties;
DROP POLICY IF EXISTS "Allow authenticated delete" ON properties;

-- Tạo function helper để check admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS `$`$
BEGIN
  RETURN (
    SELECT 
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() ->> 'email') = 'admin@vungtauland.store'
  );
END;
`$`$ LANGUAGE plpgsql SECURITY DEFINER;

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
"@

Write-Host $sql -ForegroundColor White
Write-Host "=" -ForegroundColor Gray -NoNewline; Write-Host ("=" * 60) -ForegroundColor Gray

Write-Host ""
Write-Host "BƯỚC 3: Paste SQL vào editor và click RUN" -ForegroundColor Green
Write-Host ""

Write-Host "KẾT QUẢ MONG ĐỢI:" -ForegroundColor Cyan
Write-Host "   ✓ 3 policies cũ đã xóa" -ForegroundColor Green
Write-Host "   ✓ Function is_admin() được tạo" -ForegroundColor Green
Write-Host "   ✓ 3 policies mới cho admin" -ForegroundColor Green
Write-Host ""

Write-Host "SAU KHI CHẠY SQL:" -ForegroundColor Cyan
Write-Host "   ✓ Chỉ admin (admin@vungtauland.store) mới INSERT/UPDATE/DELETE" -ForegroundColor Green
Write-Host "   ✓ User thường chỉ SELECT (xem)" -ForegroundColor Green
Write-Host ""

# Copy SQL to clipboard
$sql | Set-Clipboard
Write-Host "✅ SQL đã được copy vào clipboard!" -ForegroundColor Green
Write-Host "   Bạn chỉ cần Paste (Ctrl+V) vào SQL Editor" -ForegroundColor Yellow
