# 🚀 AfriMall Infrastructure Setup Guide

## 📋 Overview

This guide will walk you through setting up the complete infrastructure for your AfriMall e-commerce platform, including environment configuration, database setup, file storage, email services, and security configurations.

## 🎯 What We're Setting Up Today

- ✅ Environment Configuration (Local & Production)
- ✅ Database Setup (SQLite → PostgreSQL/Supabase)
- ✅ AWS S3 File Storage
- ✅ Email Service (SMTP/SendGrid)
- ✅ Security & CORS Configuration
- ✅ Health Monitoring & Testing

---

## 🔧 STEP 1: Environment Setup

### 1.1 Create Local Environment File

```bash
# Copy the example file
cp env.local.example .env.local

# Edit .env.local with your actual values
```

**Required Variables for Local Development:**
```bash
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
```

### 1.2 Create Production Environment File

```bash
# Copy the example file
cp env.production.example .env.production

# Edit .env.production with your actual production values
```

**Required Variables for Production:**
```bash
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
```

---

## 🗄️ STEP 2: Database Configuration

### 2.1 Local Development (SQLite)

Your project is already configured to use SQLite for local development. The database file `afrimall.db` will be created automatically.

### 2.2 Production Database (Supabase/PostgreSQL)

#### Option A: Supabase (Recommended)

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up and create a new project

2. **Get Connection String**
   - Go to Settings → Database
   - Copy the connection string
   - Format: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`

3. **Update Environment**
   ```bash
   # In .env.production
   DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   ```

#### Option B: Local PostgreSQL

1. **Install PostgreSQL**
   ```bash
   # Windows (using Chocolatey)
   choco install postgresql

   # Or download from postgresql.org
   ```

2. **Create Database**
   ```sql
   CREATE DATABASE afrimall;
   CREATE USER afrimall_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE afrimall TO afrimall_user;
   ```

3. **Update Environment**
   ```bash
   DATABASE_URL=postgresql://afrimall_user:your_password@localhost:5432/afrimall
   ```

### 2.3 Test Database Connection

```bash
# Start your development server
npm run dev

# Test the health endpoint
curl http://localhost:3000/api/health
```

---

## ☁️ STEP 3: AWS S3 File Storage

### 3.1 Create S3 Bucket

1. **AWS Console Setup**
   - Go to [AWS S3 Console](https://console.aws.amazon.com/s3/)
   - Create a new bucket: `afrimall-storage`
   - Choose your region (e.g., `us-east-1`)

2. **Bucket Configuration**
   - **Block Public Access**: Keep enabled for security
   - **Versioning**: Enable for file recovery
   - **Server-side encryption**: Enable (AES-256)

3. **IAM User Setup**
   - Go to [IAM Console](https://console.aws.amazon.com/iam/)
   - Create a new user: `afrimall-s3-user`
   - Attach policy: `AmazonS3FullAccess` (or create custom policy)

4. **Get Access Keys**
   - Generate access key and secret access key
   - Save them securely

### 3.2 Update Environment Variables

```bash
# In .env.production
AWS_S3_BUCKET=afrimall-storage
AWS_S3_ACCESS_KEY_ID=your_access_key
AWS_S3_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_REGION=us-east-1
```

### 3.3 Test S3 Integration

1. **Upload a test image** through your admin panel
2. **Check S3 bucket** to see if files are uploaded
3. **Verify URLs** are generated correctly

---

## 📧 STEP 4: Email Service Configuration

### 4.1 Gmail SMTP Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"

3. **Update Environment**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

### 4.2 SendGrid Alternative

1. **Create SendGrid Account**
   - Go to [sendgrid.com](https://sendgrid.com)
   - Sign up and verify your domain

2. **Get API Key**
   - Go to Settings → API Keys
   - Create new API key with "Mail Send" permissions

3. **Update Environment**
   ```bash
   SENDGRID_API_KEY=your_sendgrid_api_key
   ```

### 4.3 Test Email Service

```bash
# Test endpoint (you'll need to create this)
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com"}'
```

---

## 🔒 STEP 5: Security & CORS Configuration

### 5.1 Security Headers

The middleware (`src/middleware.ts`) automatically adds:
- ✅ CORS headers
- ✅ Security headers (XSS, CSRF, etc.)
- ✅ Content Security Policy
- ✅ Rate limiting

### 5.2 CORS Configuration

```bash
# Local development
CORS_ORIGIN=http://localhost:3000

# Production
CORS_ORIGIN=https://your-domain.com
```

### 5.3 Rate Limiting

```bash
# Configure rate limiting
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100    # Max requests per window
```

---

## 🧪 STEP 6: Testing & Verification

### 6.1 Health Check Endpoint

```bash
# Basic health check
GET /api/health

# Detailed health check (requires auth in production)
POST /api/health
Authorization: Bearer your-health-check-secret
```

### 6.2 Database Connection Test

```bash
# Test database connectivity
npm run dev
# Check console for database connection logs
```

### 6.3 File Upload Test

1. **Go to admin panel** (`/admin`)
2. **Upload a test image** to Media collection
3. **Check if file appears** in S3 bucket (production) or local storage (dev)

---

## 🚀 STEP 7: Production Deployment

### 7.1 Environment Variables

Ensure all production environment variables are set in your deployment platform (Vercel, Netlify, etc.)

### 7.2 Database Migration

```bash
# If migrating from SQLite to PostgreSQL
# 1. Export data from SQLite
# 2. Import to PostgreSQL
# 3. Update DATABASE_URL
# 4. Restart application
```

### 7.3 SSL/HTTPS

- ✅ Ensure your domain has SSL certificate
- ✅ Update `NEXT_PUBLIC_SERVER_URL` to use `https://`
- ✅ Verify Stripe webhooks use HTTPS

---

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check `DATABASE_URL` format
   - Verify database is running
   - Check firewall settings

2. **S3 Upload Failed**
   - Verify AWS credentials
   - Check bucket permissions
   - Ensure bucket exists

3. **Email Not Sending**
   - Check SMTP credentials
   - Verify Gmail app password
   - Check firewall/ISP blocking

4. **CORS Errors**
   - Verify `CORS_ORIGIN` setting
   - Check middleware configuration
   - Ensure domain matches exactly

### Debug Commands

```bash
# Check environment variables
node -e "console.log(process.env.NODE_ENV)"

# Test database connection
curl http://localhost:3000/api/health

# Check logs
npm run dev
# Look for error messages in console
```

---

## 📚 Next Steps

After completing this setup:

1. **Test all functionality** locally
2. **Deploy to staging** environment
3. **Run integration tests**
4. **Deploy to production**
5. **Monitor health endpoints**
6. **Set up monitoring** (Sentry, etc.)

---

## 🆘 Need Help?

- Check the console logs for detailed error messages
- Verify all environment variables are set correctly
- Test each service individually
- Use the health check endpoint to diagnose issues

---

**🎉 Congratulations!** Your AfriMall infrastructure is now properly configured and ready for production use.
