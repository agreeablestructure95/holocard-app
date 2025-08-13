# HoloCard Application Startup Script
Write-Host "🚀 Starting HoloCard Application..." -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "backend\package.json") -or -not (Test-Path "frontend\package.json")) {
    Write-Host "❌ Error: Cannot find backend or frontend directories!" -ForegroundColor Red
    Write-Host "Make sure you're running this script from the holocard-app root directory." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Project structure validated" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "🔧 Installing dependencies..." -ForegroundColor Cyan

Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend dependency installation failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location ..\frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend dependency installation failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "💾 Updating database schema..." -ForegroundColor Cyan
Set-Location backend
node src/scripts/updateDatabase.js
Write-Host "Database update completed" -ForegroundColor Green

Write-Host ""
Write-Host "🌟 Starting servers..." -ForegroundColor Magenta
Write-Host ""
Write-Host "Backend will start on: http://localhost:5000" -ForegroundColor Yellow
Write-Host "Frontend will start on: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""

# Start backend in new window
Write-Host "⚡ Starting backend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"

# Wait a moment
Start-Sleep -Seconds 3

# Start frontend in new window
Write-Host "⚡ Starting frontend server..." -ForegroundColor Cyan
Set-Location ..\frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"

Set-Location ..

Write-Host ""
Write-Host "✅ Both servers are starting in separate windows..." -ForegroundColor Green
Write-Host "📱 Open http://localhost:3000 to access the app" -ForegroundColor White -BackgroundColor Blue
Write-Host "🛠️ Check the console windows for any errors" -ForegroundColor Yellow
Write-Host ""

# Instructions
Write-Host "🔧 TROUBLESHOOTING:" -ForegroundColor Magenta
Write-Host "• If image upload fails: Check Cloudinary credentials in backend\.env" -ForegroundColor Gray
Write-Host "• If login fails: Check Google OAuth credentials in backend\.env" -ForegroundColor Gray
Write-Host "• If database errors: Check DATABASE_URL in backend\.env" -ForegroundColor Gray
Write-Host "• For CORS errors: Ensure backend runs on port 5000" -ForegroundColor Gray

Read-Host "Press Enter to close this window"
