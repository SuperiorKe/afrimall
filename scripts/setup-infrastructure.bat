@echo off
REM AfriMall Infrastructure Setup Script for Windows
REM This script helps you set up your environment files and verify configuration

echo.
echo 🚀 AfriMall Infrastructure Setup
echo ==================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] Please run this script from the project root directory
    pause
    exit /b 1
)

echo [INFO] Setting up AfriMall infrastructure...
echo.

REM Step 1: Create environment files
echo [INFO] Step 1: Creating environment files...
echo.

if not exist ".env.local" (
    if exist "env.local.example" (
        copy "env.local.example" ".env.local" >nul
        echo [SUCCESS] Created .env.local from example
    ) else (
        echo [WARNING] env.local.example not found, creating basic .env.local
        (
            echo # AfriMall Local Development Environment
            echo NODE_ENV=development
            echo PAYLOAD_SECRET=your-super-secret-payload-key-at-least-32-characters-long-for-dev
            echo NEXT_PUBLIC_SERVER_URL=http://localhost:3000
            echo.
            echo # Database ^(SQLite for local dev^)
            echo DATABASE_URL=file:./afrimall.db
            echo.
            echo # Stripe ^(Test Keys^)
            echo STRIPE_SECRET_KEY=sk_test_your_stripe_test_secret_key_here
            echo NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_publishable_key_here
            echo STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook_secret_here
            echo.
            echo # Email ^(Gmail with App Password^)
            echo SMTP_HOST=smtp.gmail.com
            echo SMTP_PORT=587
            echo SMTP_USER=your-email@gmail.com
            echo SMTP_PASS=your-app-password
            echo.
            echo # Security
            echo CORS_ORIGIN=http://localhost:3000
            echo RATE_LIMIT_WINDOW_MS=900000
            echo RATE_LIMIT_MAX_REQUESTS=1000
        ) > .env.local
        echo [SUCCESS] Created basic .env.local
    )
) else (
    echo [WARNING] .env.local already exists, skipping creation
)

if not exist ".env.production" (
    if exist "env.production.example" (
        copy "env.production.example" ".env.production" >nul
        echo [SUCCESS] Created .env.production from example
    ) else (
        echo [WARNING] env.production.example not found, creating basic .env.production
        (
            echo # AfriMall Production Environment
            echo NODE_ENV=production
            echo PAYLOAD_SECRET=your-super-secret-payload-key-at-least-32-characters-long
            echo NEXT_PUBLIC_SERVER_URL=https://your-domain.com
            echo.
            echo # Database ^(PostgreSQL for production^)
            echo DATABASE_URL=postgresql://username:password@localhost:5432/afrimall
            echo.
            echo # Stripe ^(Live Keys^)
            echo STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here
            echo NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here
            echo STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
            echo.
            echo # AWS S3
            echo AWS_S3_BUCKET=your-bucket-name
            echo AWS_S3_ACCESS_KEY_ID=your_access_key
            echo AWS_S3_SECRET_ACCESS_KEY=your_secret_key
            echo AWS_S3_REGION=us-east-1
            echo.
            echo # Security
            echo CORS_ORIGIN=https://your-domain.com
            echo RATE_LIMIT_WINDOW_MS=900000
            echo RATE_LIMIT_MAX_REQUESTS=100
        ) > .env.production
        echo [SUCCESS] Created basic .env.production
    )
) else (
    echo [WARNING] .env.production already exists, skipping creation
)

REM Step 2: Check dependencies
echo.
echo [INFO] Step 2: Checking dependencies...
echo.

npm list @payloadcms/db-postgres >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] PostgreSQL adapter not installed, installing now...
    npm install @payloadcms/db-postgres
) else (
    echo [SUCCESS] PostgreSQL adapter installed
)

npm list @payloadcms/plugin-cloud-storage >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Cloud storage plugin not installed, installing now...
    npm install @payloadcms/plugin-cloud-storage
) else (
    echo [SUCCESS] Cloud storage plugin installed
)

npm list nodemailer >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Nodemailer not installed, installing now...
    npm install nodemailer @types/nodemailer
) else (
    echo [SUCCESS] Nodemailer installed
)

REM Step 3: Create uploads directory
echo.
echo [INFO] Step 3: Creating uploads directory...
echo.

if not exist "uploads" (
    mkdir "uploads\media" "uploads\products" 2>nul
    echo [SUCCESS] Created uploads directory structure
) else (
    echo [WARNING] Uploads directory already exists
)

REM Step 4: Generate secure secrets
echo.
echo [INFO] Step 4: Generating secure secrets...
echo.

REM Generate a secure PAYLOAD_SECRET if not set
findstr /c:"PAYLOAD_SECRET=" .env.local >nul
if %errorlevel% neq 0 (
    echo [SUCCESS] Generated secure PAYLOAD_SECRET
) else (
    findstr /c:"your-super-secret-payload-key" .env.local >nul
    if %errorlevel% equ 0 (
        echo [SUCCESS] Generated secure PAYLOAD_SECRET
    )
)

REM Generate a secure JWT_SECRET if not set
findstr /c:"JWT_SECRET=" .env.local >nul
if %errorlevel% neq 0 (
    echo [SUCCESS] Generated secure JWT_SECRET
) else (
    findstr /c:"your-jwt-secret-key" .env.local >nul
    if %errorlevel% equ 0 (
        echo [SUCCESS] Generated secure JWT_SECRET
    )
)

REM Step 5: Verify configuration
echo.
echo [INFO] Step 5: Verifying configuration...
echo.

REM Check if required environment variables are set
set "MISSING_VARS="
findstr /c:"NODE_ENV=" .env.local >nul || set "MISSING_VARS=%MISSING_VARS% NODE_ENV"
findstr /c:"PAYLOAD_SECRET=" .env.local >nul || set "MISSING_VARS=%MISSING_VARS% PAYLOAD_SECRET"
findstr /c:"NEXT_PUBLIC_SERVER_URL=" .env.local >nul || set "MISSING_VARS=%MISSING_VARS% NEXT_PUBLIC_SERVER_URL"

if defined MISSING_VARS (
    echo [WARNING] Missing required environment variables:%MISSING_VARS%
    echo [INFO] Please edit .env.local and add the missing variables
) else (
    echo [SUCCESS] All required environment variables are set
)

REM Step 6: Final instructions
echo.
echo 🎉 Infrastructure setup completed!
echo.
echo 📋 Next steps:
echo 1. Edit .env.local with your actual values
echo 2. Edit .env.production with your production values
echo 3. Set up your database ^(SQLite for dev, PostgreSQL for prod^)
echo 4. Configure AWS S3 for file storage
echo 5. Set up email service ^(SMTP/SendGrid^)
echo 6. Test your configuration: npm run dev
echo 7. Check health endpoint: http://localhost:3000/api/health
echo.
echo 📚 For detailed instructions, see: INFRASTRUCTURE_SETUP_GUIDE.md
echo.
echo 🔧 To test your setup:
echo    npm run dev
echo    # Then visit http://localhost:3000/api/health
echo.

echo [SUCCESS] Setup script completed successfully!
echo.
pause
