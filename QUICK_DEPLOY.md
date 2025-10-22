# 🚀 Quick Deploy to Production

## 📋 Pre-Deployment Steps

### **1. Add Environment Variable**

Add this to your production environment (Vercel dashboard or `.env.production`):

```env
SERVER_URL=https://afrimall.app
```

### **2. Disable SendGrid Click Tracking**

1. Go to: https://app.sendgrid.com
2. Settings → Tracking → Turn OFF "Click Tracking"
3. Save

---

## 🏗️ Build & Deploy Commands

### **Test Build Locally:**

```bash
# 1. Generate types
npm run generate:types

# 2. Build for production
npm run build

# 3. Test production build
npm start
```

### **Deploy to Production:**

```bash
# 1. Stage all changes
git add .

# 2. Commit
git commit -m "feat: add password recovery flow with email notifications"

# 3. Push to production
git push origin main
```

---

## ✅ After Deployment

### **Test in Production:**

1. Visit: `https://afrimall.app/auth/forgot-password`
2. Enter email and request reset
3. Check email inbox
4. Verify link is: `https://afrimall.app/auth/reset-password?token=...`
5. Click link and reset password
6. Log in with new password

---

## 📦 What's Being Deployed

### **New Features:**
✅ Password recovery flow  
✅ Email notifications  
✅ Beautiful email templates  
✅ Security best practices  

### **Files Changed:**
- 4 new API/frontend pages
- Email service updates
- Payload CMS email config
- Documentation

---

## 🔧 If Build Fails

Check the error message and:
1. Fix TypeScript errors
2. Fix linter warnings
3. Run `npm run build` again

---

## 🎯 Quick Commands Reference

```bash
# Install new dependency (if needed)
npm install

# Generate types
npm run generate:types

# Build
npm run build

# Test production build
npm start

# Deploy (auto-deploy if using Vercel)
git push origin main
```

---

**Ready to deploy when:**
- ✅ `SERVER_URL` added to production env
- ✅ SendGrid click tracking disabled
- ✅ `npm run build` succeeds
- ✅ Git changes committed

---

**Need help?** Check `PRODUCTION_DEPLOYMENT_CHECKLIST.md` for detailed instructions.

