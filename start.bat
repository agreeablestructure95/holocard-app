@echo off
echo 🚀 Starting HoloCard Application...
echo.

echo 📋 Checking requirements...
cd /d "%~dp0"

if not exist "backend\package.json" (
    echo ❌ Backend not found! Make sure you're in the correct directory.
    pause
    exit /b 1
)

if not exist "frontend\package.json" (
    echo ❌ Frontend not found! Make sure you're in the correct directory.  
    pause
    exit /b 1
)

echo ✅ Project structure validated

echo.
echo 🔧 Installing dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend dependency installation failed!
    pause
    exit /b 1
)

cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend dependency installation failed!
    pause
    exit /b 1
)

cd ..

echo.
echo 💾 Updating database schema...
cd backend
node src/scripts/updateDatabase.js
echo Database update completed

echo.
echo 🌟 Starting servers...
echo.
echo Backend will start on: http://localhost:5000
echo Frontend will start on: http://localhost:3000
echo.
echo ⚡ Starting backend server...
start "HoloCard Backend" cmd /k "cd /d %cd% && npm run dev"

timeout /t 3 /nobreak > nul

echo ⚡ Starting frontend server...
cd ..\frontend
start "HoloCard Frontend" cmd /k "cd /d %cd% && npm run dev"

echo.
echo ✅ Both servers are starting...
echo 📱 Open http://localhost:3000 to access the app
echo 🛠️ Check the console windows for any errors
echo.
pause
