# Script kiểm tra DNS propagation
Write-Host "🔍 Checking DNS for vungtauland.store..." -ForegroundColor Cyan

# Check current DNS
Write-Host "`n📍 Current DNS Records:" -ForegroundColor Yellow
nslookup vungtauland.store

# Check if pointing to Vercel
Write-Host "`n✅ Expected Vercel IPs:" -ForegroundColor Green
Write-Host "   76.76.21.241"
Write-Host "   76.76.21.142" 
Write-Host "   76.76.21.164"

Write-Host "`n🌐 To fix DNS, configure in your domain registrar:" -ForegroundColor Magenta
Write-Host "   Type: A"
Write-Host "   Name: @" 
Write-Host "   Value: 76.76.21.241"
Write-Host "   TTL: 300"

Write-Host "`n⏱️  DNS changes take 5-15 minutes to propagate" -ForegroundColor Cyan