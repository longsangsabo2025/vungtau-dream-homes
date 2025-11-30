# ============================================================================
# VERIFICATION SCRIPT - Vungtau Dream Homes
# ============================================================================
# Run this script to verify all optimizations are in place
# ============================================================================

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "║         🔍 VUNGTAU DREAM HOMES - VERIFICATION SCRIPT        ║" -ForegroundColor Yellow
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$errors = 0
$warnings = 0

# ============================================================================
# 1. CHECK SECURITY
# ============================================================================
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "1️⃣  SECURITY CHECK" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "Running npm audit..." -ForegroundColor White
$auditResult = npm audit --json 2>$null | ConvertFrom-Json

if ($auditResult.metadata.vulnerabilities.total -eq 0) {
    Write-Host "✅ No vulnerabilities found" -ForegroundColor Green
} else {
    Write-Host "❌ Found $($auditResult.metadata.vulnerabilities.total) vulnerabilities" -ForegroundColor Red
    $errors++
}

# ============================================================================
# 2. CHECK DEPENDENCIES
# ============================================================================
Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "2️⃣  DEPENDENCIES CHECK" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

if (Test-Path "node_modules") {
    Write-Host "✅ node_modules exists" -ForegroundColor Green
    $packageCount = (Get-Content package.json | ConvertFrom-Json).dependencies.PSObject.Properties.Count
    Write-Host "   📦 $packageCount dependencies installed" -ForegroundColor White
} else {
    Write-Host "❌ node_modules not found - run 'npm install'" -ForegroundColor Red
    $errors++
}

# ============================================================================
# 3. CHECK BUILD
# ============================================================================
Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "3️⃣  BUILD CHECK" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "Running build..." -ForegroundColor White
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
    
    # Check bundle size
    if (Test-Path "dist/assets") {
        $jsFiles = Get-ChildItem "dist/assets/*.js" -ErrorAction SilentlyContinue
        if ($jsFiles) {
            $totalSize = ($jsFiles | Measure-Object -Property Length -Sum).Sum / 1KB
            Write-Host "   📊 Bundle size: $([math]::Round($totalSize, 2)) KB" -ForegroundColor White
            
            if ($totalSize -lt 1000) {
                Write-Host "   ✅ Within target (<1 MB)" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️  Bundle size exceeds 1 MB" -ForegroundColor Yellow
                $warnings++
            }
        }
    }
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    $errors++
}

# ============================================================================
# 4. CHECK CONFIGURATION FILES
# ============================================================================
Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "4️⃣  CONFIGURATION FILES CHECK" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

$configFiles = @(
    "vite.config.ts",
    "vitest.config.ts",
    "tsconfig.json",
    "package.json",
    ".env.local",
    ".gitignore"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file exists" -ForegroundColor Green
        
        # Check for node:path import in config files
        if ($file -like "*.config.ts") {
            $content = Get-Content $file -Raw
            if ($content -match "from\s+[\`"']node:path[\`"']") {
                Write-Host "   ✅ Using node:path import" -ForegroundColor Green
            } elseif ($content -match "from\s+[\`"']path[\`"']") {
                Write-Host "   ⚠️  Should use 'node:path' instead of 'path'" -ForegroundColor Yellow
                $warnings++
            }
        }
    } else {
        Write-Host "❌ $file not found" -ForegroundColor Red
        $errors++
    }
}

# ============================================================================
# 5. CHECK DOCUMENTATION
# ============================================================================
Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "5️⃣  DOCUMENTATION CHECK" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

$docs = @(
    "README.md",
    "OPTIMIZATION_GUIDE.md",
    "OPTIMIZATION_COMPLETE.md",
    "database-indexes.sql"
)

foreach ($doc in $docs) {
    if (Test-Path $doc) {
        Write-Host "✅ $doc exists" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $doc not found" -ForegroundColor Yellow
        $warnings++
    }
}

# ============================================================================
# 6. CHECK ENVIRONMENT VARIABLES
# ============================================================================
Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "6️⃣  ENVIRONMENT VARIABLES CHECK" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    
    $requiredVars = @(
        "VITE_SUPABASE_URL",
        "VITE_SUPABASE_ANON_KEY"
    )
    
    foreach ($var in $requiredVars) {
        if ($envContent -match $var) {
            Write-Host "✅ $var is set" -ForegroundColor Green
        } else {
            Write-Host "❌ $var is missing" -ForegroundColor Red
            $errors++
        }
    }
    
    # Check for service role key (should not be in client code)
    if ($envContent -match "SERVICE_ROLE_KEY") {
        Write-Host "⚠️  SERVICE_ROLE_KEY found - should only be used server-side" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "❌ .env.local not found" -ForegroundColor Red
    $errors++
}

# ============================================================================
# 7. CHECK GIT STATUS
# ============================================================================
Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "7️⃣  GIT STATUS CHECK" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

if (Test-Path ".git") {
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
    
    # Check gitignore
    if (Test-Path ".gitignore") {
        $gitignoreContent = Get-Content ".gitignore" -Raw
        
        $shouldIgnore = @("node_modules", ".env", ".env.local", "dist")
        foreach ($pattern in $shouldIgnore) {
            if ($gitignoreContent -match $pattern) {
                Write-Host "✅ .gitignore includes: $pattern" -ForegroundColor Green
            } else {
                Write-Host "⚠️  .gitignore missing: $pattern" -ForegroundColor Yellow
                $warnings++
            }
        }
    }
} else {
    Write-Host "⚠️  Not a git repository" -ForegroundColor Yellow
    $warnings++
}

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 VERIFICATION SUMMARY" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "🎉 ALL CHECKS PASSED!" -ForegroundColor Green -BackgroundColor DarkGreen
    Write-Host "`n✅ Project is PRODUCTION-READY" -ForegroundColor Green
} elseif ($errors -eq 0) {
    Write-Host "✅ All critical checks passed" -ForegroundColor Green
    Write-Host "⚠️  $warnings warning(s) found" -ForegroundColor Yellow
    Write-Host "`nProject is ready, but consider addressing warnings." -ForegroundColor White
} else {
    Write-Host "❌ $errors error(s) found" -ForegroundColor Red
    Write-Host "⚠️  $warnings warning(s) found" -ForegroundColor Yellow
    Write-Host "`nPlease fix errors before deploying." -ForegroundColor White
}

Write-Host "`n═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Return exit code
if ($errors -gt 0) {
    exit 1
} else {
    exit 0
}
