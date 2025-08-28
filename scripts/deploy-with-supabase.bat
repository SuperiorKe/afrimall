@echo off
echo 🚀 Deploying Afrimall with Supabase...
echo.

REM Check if .env.local exists
if not exist .env.local (
    echo ❌ .env.local not found!
    echo 📝 Please create .env.local with your Supabase keys first:
    echo    1. Copy env.production.new to .env.local
    echo    2. Fill in your Supabase keys
    echo    3. Run this script again
    echo.
    pause
    exit /b 1
)

echo ✅ Environment file found
echo ✅ Starting deployment...
echo.

REM Build the project
echo 📦 Building project...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    echo 💡 Check your environment variables and try again
    pause
    exit /b 1
)

echo ✅ Build completed successfully!
echo.

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
call vercel --prod
if %errorlevel% neq 0 (
    echo ❌ Deployment failed!
    echo 💡 Check your Vercel configuration and try again
    pause
    exit /b 1
)

echo ✅ Deployment completed successfully!
echo.
pause
