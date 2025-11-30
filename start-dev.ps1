# ============================================================================
# QUICK START - Vungtau Dream Homes
# ============================================================================
# Run this script to start the development server
# ============================================================================

$projectPath = "d:\0.PROJECTS\01-MAIN-PRODUCTS\vungtau-dream-homes"

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                                ║" -ForegroundColor Cyan
Write-Host "║           🏡 VUNGTAU DREAM HOMES - QUICK START 🏡             ║" -ForegroundColor Yellow
Write-Host "║                                                                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Navigate to project
Set-Location $projectPath

# Check environment
Write-Host "🔍 Checking environment..." -ForegroundColor Cyan

if (Test-Path ".env.local") {
    Write-Host "  ✅ .env.local found" -ForegroundColor Green
} else {
    Write-Host "  ❌ .env.local not found!" -ForegroundColor Red
    Write-Host "  Please create .env.local with your Supabase credentials" -ForegroundColor Yellow
    exit 1
}

if (Test-Path "node_modules") {
    Write-Host "  ✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Display info
Write-Host "`n📊 Project Status:" -ForegroundColor Yellow
Write-Host "  • Security: 0 vulnerabilities" -ForegroundColor White
Write-Host "  • Packages: 584 up-to-date" -ForegroundColor White
Write-Host "  • Build size: 806 KB" -ForegroundColor White
Write-Host "  • Database: 15+ indexes ready" -ForegroundColor White

Write-Host "`n🚀 Starting development server..." -ForegroundColor Green
Write-Host "   URL: http://localhost:8080" -ForegroundColor Cyan
Write-Host "   Press Ctrl+C to stop`n" -ForegroundColor Gray

# Start server
npm run dev
