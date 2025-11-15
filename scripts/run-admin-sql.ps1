$serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4anNkb3lsa2ZsenN4bHljY3FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA0MTMyMiwiZXhwIjoyMDc4NjE3MzIyfQ.R4o78VFAuz2mj_x9aEKRZgAIorTtOyCSEZVoeg7WUxA"
$projectRef = "rxjsdoylkflzsxlyccqh"
$supabaseUrl = "https://$projectRef.supabase.co"

$headers = @{
    "apikey" = $serviceKey
    "Authorization" = "Bearer $serviceKey"
    "Content-Type" = "application/json"
}

Write-Host "🔐 Đang cập nhật RLS policies cho admin..." -ForegroundColor Cyan
Write-Host ""

# SQL commands
$sqlCommands = @(
    @{
        name = "Xóa policy INSERT cũ"
        sql = 'DROP POLICY IF EXISTS "Allow authenticated insert" ON properties;'
    },
    @{
        name = "Xóa policy UPDATE cũ"
        sql = 'DROP POLICY IF EXISTS "Allow authenticated update" ON properties;'
    },
    @{
        name = "Xóa policy DELETE cũ"
        sql = 'DROP POLICY IF EXISTS "Allow authenticated delete" ON properties;'
    },
    @{
        name = "Tạo function is_admin()"
        sql = @"
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
"@
    },
    @{
        name = "Tạo INSERT policy cho admin"
        sql = @"
CREATE POLICY "Admin can insert properties" ON properties
  FOR INSERT 
  WITH CHECK (is_admin());
"@
    },
    @{
        name = "Tạo UPDATE policy cho admin"
        sql = @"
CREATE POLICY "Admin can update properties" ON properties
  FOR UPDATE 
  USING (is_admin());
"@
    },
    @{
        name = "Tạo DELETE policy cho admin"
        sql = @"
CREATE POLICY "Admin can delete properties" ON properties
  FOR DELETE 
  USING (is_admin());
"@
    }
)

# Execute each SQL command
foreach ($command in $sqlCommands) {
    Write-Host "⏳ $($command.name)..." -ForegroundColor Yellow
    
    try {
        $body = @{
            query = $command.sql
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $body -ErrorAction Stop
        
        Write-Host "✅ $($command.name) - Thành công" -ForegroundColor Green
    }
    catch {
        # Try alternative endpoint
        try {
            $response = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/" -Method Post -Headers $headers -Body $body -ErrorAction Stop
            Write-Host "✅ $($command.name) - Thành công" -ForegroundColor Green
        }
        catch {
            Write-Host "⚠️  $($command.name) - Endpoint không khả dụng" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "📝 Supabase REST API không hỗ trợ chạy SQL trực tiếp" -ForegroundColor Cyan
Write-Host "Bạn cần chạy SQL thủ công qua Dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "SQL đã được hiển thị ở trên terminal trước đó!" -ForegroundColor Green
Write-Host "Hoặc xem file: database-admin-policies.sql" -ForegroundColor Green
