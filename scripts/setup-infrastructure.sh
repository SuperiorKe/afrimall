#!/bin/bash

# AfriMall Infrastructure Setup Script
# This script helps you set up your environment files and verify configuration

set -e

echo "🚀 AfriMall Infrastructure Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Setting up AfriMall infrastructure..."

# Step 1: Create environment files
print_status "Step 1: Creating environment files..."

if [ ! -f ".env.local" ]; then
    if [ -f "env.local.example" ]; then
        cp env.local.example .env.local
        print_success "Created .env.local from example"
    else
        print_warning "env.local.example not found, creating basic .env.local"
        cat > .env.local << EOF
# AfriMall Local Development Environment
NODE_ENV=development
PAYLOAD_SECRET=your-super-secret-payload-key-at-least-32-characters-long-for-dev
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Database (SQLite for local dev)
DATABASE_URL=file:./afrimall.db

# Stripe (Test Keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_test_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook_secret_here

# Email (Gmail with App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
EOF
        print_success "Created basic .env.local"
    fi
else
    print_warning ".env.local already exists, skipping creation"
fi

if [ ! -f ".env.production" ]; then
    if [ -f "env.production.example" ]; then
        cp env.production.example .env.production
        print_success "Created .env.production from example"
    else
        print_warning "env.production.example not found, creating basic .env.production"
        cat > .env.production << EOF
# AfriMall Production Environment
NODE_ENV=production
PAYLOAD_SECRET=your-super-secret-payload-key-at-least-32-characters-long
NEXT_PUBLIC_SERVER_URL=https://your-domain.com

# Database (PostgreSQL for production)
DATABASE_URL=postgresql://username:password@localhost:5432/afrimall

# Stripe (Live Keys)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# AWS S3
AWS_S3_BUCKET=your-bucket-name
AWS_S3_ACCESS_KEY_ID=your_access_key
AWS_S3_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_REGION=us-east-1

# Security
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
        print_success "Created basic .env.production"
    fi
else
    print_warning ".env.production already exists, skipping creation"
fi

# Step 2: Check dependencies
print_status "Step 2: Checking dependencies..."

if npm list @payloadcms/db-postgres > /dev/null 2>&1; then
    print_success "PostgreSQL adapter installed"
else
    print_warning "PostgreSQL adapter not installed, installing now..."
    npm install @payloadcms/db-postgres
fi

if npm list @payloadcms/plugin-cloud-storage > /dev/null 2>&1; then
    print_success "Cloud storage plugin installed"
else
    print_warning "Cloud storage plugin not installed, installing now..."
    npm install @payloadcms/plugin-cloud-storage
fi

if npm list nodemailer > /dev/null 2>&1; then
    print_success "Nodemailer installed"
else
    print_warning "Nodemailer not installed, installing now..."
    npm install nodemailer @types/nodemailer
fi

# Step 3: Create uploads directory
print_status "Step 3: Creating uploads directory..."

if [ ! -d "uploads" ]; then
    mkdir -p uploads/media uploads/products
    print_success "Created uploads directory structure"
else
    print_warning "Uploads directory already exists"
fi

# Step 4: Generate secure secrets
print_status "Step 4: Generating secure secrets..."

# Generate a secure PAYLOAD_SECRET if not set
if ! grep -q "PAYLOAD_SECRET=" .env.local || grep -q "your-super-secret-payload-key" .env.local; then
    SECRET=$(openssl rand -base64 32 2>/dev/null || echo "fallback-secret-key-$(date +%s)")
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/PAYLOAD_SECRET=.*/PAYLOAD_SECRET=$SECRET/" .env.local
    else
        # Linux
        sed -i "s/PAYLOAD_SECRET=.*/PAYLOAD_SECRET=$SECRET/" .env.local
    fi
    print_success "Generated secure PAYLOAD_SECRET"
fi

# Generate a secure JWT_SECRET if not set
if ! grep -q "JWT_SECRET=" .env.local || grep -q "your-jwt-secret-key" .env.local; then
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "jwt-secret-key-$(date +%s)")
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env.local
    else
        # Linux
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env.local
    fi
    print_success "Generated secure JWT_SECRET"
fi

# Step 5: Verify configuration
print_status "Step 5: Verifying configuration..."

# Check if required environment variables are set
REQUIRED_VARS=("NODE_ENV" "PAYLOAD_SECRET" "NEXT_PUBLIC_SERVER_URL")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" .env.local; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    print_success "All required environment variables are set"
else
    print_warning "Missing required environment variables: ${MISSING_VARS[*]}"
    print_status "Please edit .env.local and add the missing variables"
fi

# Step 6: Final instructions
echo ""
echo "🎉 Infrastructure setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env.local with your actual values"
echo "2. Edit .env.production with your production values"
echo "3. Set up your database (SQLite for dev, PostgreSQL for prod)"
echo "4. Configure AWS S3 for file storage"
echo "5. Set up email service (SMTP/SendGrid)"
echo "6. Test your configuration: npm run dev"
echo "7. Check health endpoint: http://localhost:3000/api/health"
echo ""
echo "📚 For detailed instructions, see: INFRASTRUCTURE_SETUP_GUIDE.md"
echo ""
echo "🔧 To test your setup:"
echo "   npm run dev"
echo "   # Then visit http://localhost:3000/api/health"
echo ""

print_success "Setup script completed successfully!"
