#!/bin/bash

echo "🚀 Setting up Supabase for Afrimall..."
echo

echo "📝 Creating .env.local file..."
if [ ! -f .env.local ]; then
    cat > .env.local << 'EOF'
# Development Environment Variables
NODE_ENV=development

# Database Configuration (Supabase)
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres

# AWS S3 Configuration
AWS_S3_BUCKET=afrimall-storage
AWS_S3_REGION=us-east-1
AWS_S3_ACCESS_KEY_ID=your_access_key_here
AWS_S3_SECRET_ACCESS_KEY=your_secret_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Next.js Options
NODE_OPTIONS="--no-deprecation --no-experimental-strip-types"
EOF
    echo "✅ Created .env.local"
else
    echo "⚠️  .env.local already exists"
fi

echo
echo "📝 Creating .env.production file..."
if [ ! -f .env.production ]; then
    cat > .env.production << 'EOF'
# Production Environment Variables
NODE_ENV=production

# Database Configuration (Supabase)
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres

# AWS S3 Configuration
AWS_S3_BUCKET=afrimall-storage
AWS_S3_REGION=us-east-1
AWS_S3_ACCESS_KEY_ID=your_production_access_key_here
AWS_S3_SECRET_ACCESS_KEY=your_production_secret_key_here

# Stripe Configuration (Production Keys)
STRIPE_SECRET_KEY=sk_live_your_production_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret_here

# Next.js Options
NODE_OPTIONS="--no-deprecation --no-experimental-strip-types"
EOF
    echo "✅ Created .env.production"
else
    echo "⚠️  .env.production already exists"
fi

echo
echo "🔧 Next steps:"
echo "1. Edit .env.local and .env.production with your actual values"
echo "2. Replace [YOUR_PASSWORD] with your Supabase database password"
echo "3. Replace [YOUR_PROJECT_REF] with your Supabase project reference"
echo "4. Run: npm run test:supabase"
echo
echo "📚 See SUPABASE_SETUP_GUIDE.md for detailed instructions"
echo
