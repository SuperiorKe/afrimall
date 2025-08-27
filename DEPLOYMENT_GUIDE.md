# 🚀 Afrimall Deployment Guide

## **Pre-Deployment Checklist**

### ✅ **Environment Setup**
- [ ] Copy `env.template` to `.env.local` and fill in your actual values
- [ ] Ensure all Supabase keys are correct
- [ ] Verify Stripe keys are valid
- [ ] Set proper `NODE_ENV` for production

### ✅ **Database Preparation**
- [ ] Supabase project is running and accessible
- [ ] Database schema is properly migrated
- [ ] SSL connection is configured correctly

### ✅ **Security Review**
- [ ] All sensitive files are in `.gitignore`
- [ ] Environment variables are not committed to Git
- [ ] API keys are properly secured

## **Deployment Options**

### **Option 1: GitHub First (Recommended)**

```bash
# 1. Clean up any sensitive files
git status

# 2. Add and commit your changes
git add .
git commit -m "Fix database connection issues and build process"
git push origin main

# 3. Deploy from your hosting platform (Vercel/Netlify)
# - Connect your GitHub repository
# - Set environment variables in the hosting platform
# - Deploy automatically on push
```

### **Option 2: Direct Deploy**

```bash
# 1. Build the application
npm run build:safe

# 2. Upload the .next folder to your hosting platform
# 3. Set environment variables in your hosting platform
```

## **Environment Variables for Production**

Set these in your hosting platform:

```bash
NODE_ENV=production
PAYLOAD_SECRET=your_actual_payload_secret
NEXT_PUBLIC_SERVER_URL=https://your-domain.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL=postgresql://user:password@host:port/database
POSTGRES_URL=postgresql://user:password@host:port/database

# Stripe
STRIPE_SECRET_KEY=your_live_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_live_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Security
JWT_SECRET=your_jwt_secret
```

## **Post-Deployment Verification**

### **Health Checks**
- [ ] Application loads without errors
- [ ] Database connection is working
- [ ] Admin panel is accessible
- [ ] Product pages render correctly
- [ ] Cart functionality works
- [ ] Stripe integration is functional

### **Performance Monitoring**
- [ ] Page load times are acceptable
- [ ] Database queries are optimized
- [ ] Images are loading properly
- [ ] No console errors in browser

## **Troubleshooting**

### **Common Issues**

1. **Database Connection Failed**
   - Check Supabase service status
   - Verify connection string format
   - Ensure SSL is properly configured

2. **Build Fails**
   - Use `npm run build:safe` for local builds
   - Check environment variables are set
   - Verify all dependencies are installed

3. **Environment Variables Not Loading**
   - Restart your hosting platform
   - Check variable names match exactly
   - Ensure no typos in values

### **Support Commands**

```bash
# Test database connection
npm run test:supabase

# Check environment variables
npm run show:env

# Safe build
npm run build:safe

# Development server
npm run dev
```

## **Security Best Practices**

- 🔒 Never commit `.env*` files to Git
- 🔒 Use different API keys for development and production
- 🔒 Regularly rotate your secrets
- 🔒 Monitor your application logs for suspicious activity
- 🔒 Keep dependencies updated

## **Monitoring & Maintenance**

- Set up error tracking (Sentry recommended)
- Monitor database performance
- Track application metrics
- Regular security audits
- Backup your database regularly

---

**Need Help?** Check the troubleshooting section or review the error logs in your hosting platform.
