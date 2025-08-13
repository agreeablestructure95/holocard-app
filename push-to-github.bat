@echo off
echo 🚀 HoloCard GitHub Setup
echo ========================
echo.

echo 📋 Checking current directory...
if not exist "frontend\package.json" (
    echo ❌ Error: Run this from the holocard-app root directory!
    pause
    exit /b 1
)

echo ✅ In correct directory
echo.

echo 🔍 Checking git status...
git status 2>nul
if %errorlevel% neq 0 (
    echo 📁 Initializing git repository...
    git init
) else (
    echo ✅ Git repository already initialized
)

echo.
echo 🔒 Checking for sensitive files...
if exist "backend\.env" (
    echo ⚠️  WARNING: backend\.env exists - make sure it's in .gitignore
)
if exist "frontend\.env" (
    echo ⚠️  WARNING: frontend\.env exists - make sure it's in .gitignore  
)

echo.
echo 📦 Adding files to git...
git add .

echo.
echo 💬 Creating commit...
set /p commit_message="Enter commit message (or press Enter for default): "
if "%commit_message%"=="" set commit_message=HoloCard: AR Business Card App ready for deployment

git commit -m "%commit_message%"

echo.
echo 🌐 Ready to push to GitHub!
echo.
echo Next steps:
echo 1. Create a repository on GitHub.com
echo 2. Copy the repository URL (e.g., https://github.com/username/holocard-app.git)
echo 3. Run these commands:
echo.
echo    git remote add origin YOUR_GITHUB_URL
echo    git branch -M main  
echo    git push -u origin main
echo.
echo 📱 After pushing to GitHub, you can deploy to Vercel and Railway!
echo.
pause
