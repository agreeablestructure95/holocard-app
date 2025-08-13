@echo off
echo 🚀 HoloCard Deployment Preparation
echo ================================
echo.

echo 📋 Checking project structure...
if not exist "frontend\package.json" (
    echo ❌ Frontend not found!
    pause
    exit /b 1
)

if not exist "backend\package.json" (
    echo ❌ Backend not found!
    pause
    exit /b 1
)

echo ✅ Project structure verified
echo.

echo 📦 Installing dependencies...
echo Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend installation failed!
    pause
    exit /b 1
)

echo Installing backend dependencies...
cd ..\backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend installation failed!
    pause
    exit /b 1
)

cd ..

echo ✅ Dependencies installed
echo.

echo 🏗️ Building frontend for production...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

cd ..

echo ✅ Frontend built successfully!
echo.

echo 🎉 DEPLOYMENT READY!
echo ====================
echo.
echo Your app is ready for deployment:
echo.
echo 📂 Frontend build: frontend\dist (ready for Vercel/Netlify)
echo 📂 Backend code: backend (ready for Railway/Render)
echo.
echo 📋 Next steps:
echo 1. Follow the DEPLOYMENT.md guide
echo 2. Deploy backend to Railway
echo 3. Deploy frontend to Vercel  
echo 4. Update environment variables
echo 5. Test on your phone!
echo.
echo 🌐 Files ready for mobile deployment!
pause
