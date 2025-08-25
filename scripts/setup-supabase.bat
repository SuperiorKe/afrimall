@echo off
echo 🚀 Setting up Supabase for Afrimall...
echo.

echo 📝 Creating .env.local file...
if not exist .env.local (
    echo # Development Environment Variables > .env.local
    echo NODE_ENV=development >> .env.local
    echo. >> .env.local
    echo # Database Configuration (Supabase) >> .env.local
    echo DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres >> .env.local
    echo. >> .env.local
    echo # AWS S3 Configuration >> .env.local
    echo AWS_S3_BUCKET=afrimall-storage >> .env.local
    echo AWS_S3_REGION=us-east-1 >> .env.local
    echo AWS_S3_ACCESS_KEY_ID=your_access_key_here >> .env.local
    echo AWS_S3_SECRET_ACCESS_KEY=your_secret_key_here >> .env.local
    echo. >> .env.local
    echo # Stripe Configuration >> .env.local
    echo STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here >> .env.local
    echo NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here >> .env.local
    echo STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here >> .env.local
    echo. >> .env.local
    echo # Next.js Options >> .env.local
    echo NODE_OPTIONS=--no-deprecation --no-experimental-strip-types >> .env.local
    echo ✅ Created .env.local
) else (
    echo ⚠️  .env.local already exists
)

echo.
echo 📝 Creating .env.production file...
if not exist .env.production (
    echo # Production Environment Variables > .env.production
    echo NODE_ENV=production >> .env.production
    echo. >> .env.production
    echo # Database Configuration (Supabase) >> .env.production
    echo DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres >> .env.production
    echo. >> .env.production
    echo # AWS S3 Configuration >> .env.production
    echo AWS_S3_BUCKET=afrimall-storage >> .env.production
    echo AWS_S3_REGION=us-east-1 >> .env.production
    echo AWS_S3_ACCESS_KEY_ID=your_production_access_key_here >> .env.production
    echo AWS_S3_SECRET_ACCESS_KEY=your_production_secret_key_here >> .env.production
    echo. >> .env.production
    echo # Stripe Configuration (Production Keys) >> .env.production
    echo STRIPE_SECRET_KEY=sk_live_your_production_secret_key_here >> .env.production
    echo NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_publishable_key_here >> .env.production
    echo STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret_here >> .env.production
    echo. >> .env.production
    echo # Next.js Options >> .env.production
    echo NODE_OPTIONS=--no-deprecation --no-experimental-strip-types >> .env.production
    echo ✅ Created .env.production
) else (
    echo ⚠️  .env.production already exists
)

echo.
echo 🔧 Next steps:
echo 1. Edit .env.local and .env.production with your actual values
echo 2. Replace [YOUR_PASSWORD] with your Supabase database password
echo 3. Replace [YOUR_PROJECT_REF] with your Supabase project reference
echo 4. Run: npm run test:supabase
echo.
echo 📚 See SUPABASE_SETUP_GUIDE.md for detailed instructions
echo.
pause
