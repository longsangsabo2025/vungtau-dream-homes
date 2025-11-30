@echo off
title Vung Tau Dream Homes - Starting...
cd /d "%~dp0"

echo ========================================
echo   Vung Tau Dream Homes - Quick Launcher
echo ========================================
echo.

:: Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo Starting dev server on port 5175...
start "" npm run dev

:: Wait and open browser
timeout /t 3 /nobreak >nul
start http://localhost:5175

echo.
echo [OK] Vung Tau Dream Homes is running!
echo [OK] Browser opened at http://localhost:5175
echo.
echo Press any key to close this window...
pause >nul
