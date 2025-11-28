# 🚀 Production Deployment Checklist - Password Recovery Feature

## ✅ Pre-Deployment Checklist

### **1. Environment Variables**

Make sure these are set in your **production environment**:

```env
# Email / SendGrid (Production)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-production-sendgrid-api-key
SMTP_FROM=orders@afrimall.app

# Server URLs (IMPORTANT!)
SERVER_URL=https://afrimall.app
NEXT_PUBLIC_SERVER_URL=https://afrimall.app

# Database (Production - already set)
DATABASE_URL=postgresql://afrimall_admin:afrimallpassword@afrimall-db.c6jwck0iq6tw.us-east-1.rds.amazonaws.com:5432/store

# Payload CMS
PAYLOAD_SECRET=your-production-secret-key

# Stripe (if using)
STRIPE_SECRET_KEY=your-production-stripe-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-production-stripe-publishable-key
```

---

### **2. SendGrid Configuration**

Before deploying:

1. ✅ **Verify Sender Email**
   - Go to: SendGrid → Settings → Sender Authentication
   - Verify: `orders@afrimall.app` is verified
   - Or verify domain: `afrimall.app`

2. ✅ **Disable Click Tracking**
   - Go to: SendGrid → Settings → Tracking
   - Turn OFF: Click Tracking
   - Save changes

3. ✅ **Check Sending Limits**
   - Verify your SendGrid plan allows enough emails
   - Production typically needs higher limits

---

### **3. Test Build Locally**

Run these commands to test the production build:

```bash
# 1. Test TypeScript compilation
pnpm generate:types

# 2. Run linter
pnpm lint

# 3. Build for production
pnpm build

# 4. Test production build locally
pnpm start
```

If the build succeeds, you're ready to deploy! ✅

---

## 🧪 Testing Production Build Locally

### **After running `pnpm build` and `pnpm start`:**

1. **Test Password Recovery Flow:**
   ```
   Visit: http://localhost:3000/auth/forgot-password
   ```

2. **Request Password Reset:**
   - Enter a test email
   - Submit form
   - Check email inbox

3. **Verify Email Link:**
   - Check the reset link in email
   - Should be: `https://afrimall.app/auth/reset-password?token=...`
   - Or: `http://localhost:3000/...` (if SERVER_URL is localhost)

4. **Complete Password Reset:**
   - Click link
   - Enter new password
   - Verify redirect to login
   - Log in with new password

---

## 📦 Files to Commit

### **New Files:**
```bash
src/app/api/ecommerce/customers/forgot-password/route.ts
src/app/api/ecommerce/customers/reset-password/route.ts
src/app/(frontend)/auth/forgot-password/page.tsx
src/app/(frontend)/auth/reset-password/page.tsx
src/scripts/test-password-recovery.ts
docs/PASSWORD_RECOVERY_GUIDE.md
PRODUCTION_DEPLOYMENT_CHECKLIST.md
```

### **Modified Files:**
```bash
src/lib/email/email.ts
src/payload.config.ts
package.json
docs/EMAIL_SETUP_GUIDE.md
```

### **Documentation (Optional):**
```bash
PASSWORD_RECOVERY_IMPLEMENTATION.md
EMAIL_FIX_INSTRUCTIONS.md
SENDGRID_CLICK_TRACKING_FIX.md
CLICK_TRACKING_FIX_COMPLETE.md
FINAL_FIX_INSTRUCTIONS.md
```

---

## 🚀 Deployment Steps

### **Option 1: Vercel (Recommended)**

```bash
# 1. Commit all changes
git add .
git commit -m "feat: add password recovery flow with email notifications"

# 2. Push to main branch
git push origin main

# 3. Vercel will auto-deploy
# Check: https://vercel.com/dashboard
```

**After deployment:**
- ✅ Set environment variables in Vercel dashboard
- ✅ Verify deployment logs
- ✅ Test on production URL

---

### **Option 2: Manual Deployment**

```bash
# 1. Commit changes
git add .
git commit -m "feat: add password recovery flow with email notifications"

# 2. Push to repository
git push origin main

# 3. SSH to production server
ssh your-server

# 4. Pull changes
cd /path/to/afrimall
git pull origin main

# 5. Install dependencies
pnpm install

# 6. Build
pnpm build

# 7. Restart server
pm2 restart afrimall
# or
systemctl restart afrimall
```

---

## 🔍 Post-Deployment Verification

### **1. Check Production Environment Variables**

If using Vercel:
1. Go to: Project Settings → Environment Variables
2. Verify all variables are set
3. Especially check:
   - ✅ `SERVER_URL=https://afrimall.app`
   - ✅ `SMTP_HOST=smtp.sendgrid.net`
   - ✅ `SMTP_PASS=your-sendgrid-api-key`

### **2. Test Password Recovery in Production**

1. Visit: `https://afrimall.app/auth/forgot-password`
2. Enter a test email
3. Check email inbox
4. Verify link points to: `https://afrimall.app/auth/reset-password?token=...`
5. Click link (should work without SSL errors)
6. Reset password
7. Log in with new password

### **3. Monitor Logs**

Check your production logs for:
```
✅ Email service initialized successfully
✅ Password reset email sent successfully
❌ No "Failed to create URL object" errors
❌ No SendGrid tracking domains
```

### **4. Check SendGrid Activity**

1. Go to: SendGrid → Activity
2. Verify emails are being sent
3. Check delivery status
4. Verify no tracking links

---

## 📊 What Was Built

### **Features Implemented:**
✅ Secure token-based password reset  
✅ Email notifications via SendGrid  
✅ Beautiful HTML email templates  
✅ 1-hour token expiration  
✅ User-friendly frontend pages  
✅ Complete API endpoints  
✅ Dark mode support  
✅ Mobile responsive design  
✅ Comprehensive error handling  
✅ Security best practices  

### **Security Features:**
✅ Cryptographically secure tokens (32-byte)  
✅ Time-limited validity (1 hour)  
✅ Single-use tokens  
✅ Password validation (min 8 chars)  
✅ No information leakage  
✅ Comprehensive logging  
✅ No click tracking  

---

## 🎯 Git Commit Message

```bash
git commit -m "feat: add complete password recovery flow

- Add forgot password API endpoint with token generation
- Add reset password API endpoint with token validation
- Add beautiful email templates with AfriMall branding
- Add user-friendly frontend pages (forgot/reset password)
- Configure Payload CMS email adapter with nodemailer
- Disable SendGrid click tracking for security
- Add comprehensive documentation and test scripts
- Implement 1-hour token expiration
- Add server-side URL detection for API routes

Security features:
- Cryptographically secure tokens
- Single-use tokens with expiration
- Generic success messages (privacy protection)
- Comprehensive logging for monitoring

Closes: #[issue-number] (if applicable)
"
```

---

## 🚨 Production Environment Variables Required

Add these to your production environment (Vercel/Server):

```env
# Critical for password recovery
SERVER_URL=https://afrimall.app
NEXT_PUBLIC_SERVER_URL=https://afrimall.app

# SendGrid (already have these)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=orders@afrimall.app

# Database (already set)
DATABASE_URL=postgresql://...

# Payload CMS (already set)
PAYLOAD_SECRET=your-secret-key
```

---

## ✅ Final Checklist

Before pushing to production:

- [ ] All TypeScript errors resolved
- [ ] Linter passes (`pnpm lint`)
- [ ] Production build succeeds (`pnpm build`)
- [ ] Tested locally with production build
- [ ] SendGrid click tracking disabled
- [ ] Sender email verified in SendGrid
- [ ] Environment variables documented
- [ ] Production environment variables ready
- [ ] Git commit with clear message
- [ ] Tested complete password recovery flow
- [ ] Documentation up to date

---

## 📞 Rollback Plan (If Needed)

If something goes wrong in production:

```bash
# Revert to previous version
git revert HEAD
git push origin main

# Or rollback in Vercel
# Go to: Deployments → Previous Deployment → Promote to Production
```

The password recovery feature is **isolated** and won't break existing functionality if there are issues.

---

## 🎉 Success Metrics

After deployment, monitor:
- ✅ Password reset requests per day
- ✅ Email delivery success rate (SendGrid dashboard)
- ✅ Successful password resets
- ✅ Failed token validations (expired/invalid)
- ✅ Customer support tickets (should decrease)

---

**Status:** 📋 **Ready for Production Deployment**

Follow the steps above to test the build and deploy to production safely!

