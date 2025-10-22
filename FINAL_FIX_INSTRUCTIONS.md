# 🔧 Final Fix for Password Reset Links

## 🔍 Root Cause Identified

The issue is that `NEXT_PUBLIC_SERVER_URL` **only works on the client-side** (browser). API routes run on the server and can't access `NEXT_PUBLIC_*` variables.

Your logs confirm this:
```
ERROR: Failed to create URL object from URL: , falling back to http://localhost
```

---

## ✅ Solution: Two Steps Required

### **Step 1: Add Server-Side Environment Variable**

#### **For Development:**
Add to your `.env.local`:

```env
# Server-side URL for API routes
SERVER_URL=http://localhost:3000

# Client-side URL for browser (keep existing)
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

#### **For Production:**
```env
# Server-side URL for API routes
SERVER_URL=https://afrimall.app

# Client-side URL for browser
NEXT_PUBLIC_SERVER_URL=https://afrimall.app
```

---

### **Step 2: Disable SendGrid Click Tracking**

Even with the code fix, SendGrid's **global settings** override individual email settings.

#### **Disable in SendGrid Dashboard:**

1. **Log in**: https://app.sendgrid.com
2. **Go to**: Settings → Tracking
3. **Find**: "Click Tracking" section
4. **Toggle OFF**: Click Tracking
5. **Click**: Save

**Screenshot guide:**
- Settings (left sidebar) 
- → Tracking 
- → Click Tracking (toggle to OFF)
- → Save Settings (bottom of page)

---

## 🚀 After Making These Changes

### **1. Restart Your Server**
```bash
# Stop with Ctrl+C, then:
pnpm dev
```

### **2. Request New Password Reset**
1. Visit: http://localhost:3000/auth/forgot-password
2. Enter: superiorwech@gmail.com
3. Submit

### **3. Check the New Email**

The reset link should now be:
```
✅ Development: http://localhost:3000/auth/reset-password?token=abc123...
✅ Production:  https://afrimall.app/auth/reset-password?token=abc123...
```

**NOT:**
```
❌ https://url5873.afrimall.app/ls/click?upn=...
```

---

## 🎯 Why Both Steps Are Needed

### **Code Fix (Already Applied):**
- Uses `SERVER_URL` instead of `NEXT_PUBLIC_SERVER_URL`
- Falls back to request headers if not set

### **SendGrid Dashboard:**
- Global tracking settings override code-level settings
- Must be disabled at account level for password emails

---

## 🔍 Verify It's Working

After changes, your server logs should show:
```
✅ No "Failed to create URL object" error
✅ "Password reset email sent successfully"
✅ Email contains direct link to your domain
```

When you click the email link:
```
✅ Opens directly to your app
✅ No SSL errors
✅ No tracking redirects
```

---

## 📝 Environment Variables Summary

### **Development (.env.local):**
```env
# Database
DATABASE_URL=postgresql://...

# Email / SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=orders@afrimall.app

# Server URLs (ADD THESE)
SERVER_URL=http://localhost:3000
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Payload
PAYLOAD_SECRET=your-secret-key
```

### **Production:**
```env
# Same as development but change URLs:
SERVER_URL=https://afrimall.app
NEXT_PUBLIC_SERVER_URL=https://afrimall.app
```

---

## 🚨 Important Notes

1. **`NEXT_PUBLIC_*` = Client-side only** (browser JavaScript)
2. **`SERVER_URL` = Server-side** (API routes, server components)
3. **Both are needed** for full functionality

---

## ✅ Testing Checklist

After applying both fixes:

- [ ] Added `SERVER_URL` to `.env.local`
- [ ] Restarted dev server
- [ ] Disabled click tracking in SendGrid dashboard
- [ ] Requested new password reset
- [ ] Received email
- [ ] Verified link is direct (not url5873.afrimall.app)
- [ ] Clicked link - no SSL errors
- [ ] Reset password successfully
- [ ] Logged in with new password

---

## 📞 If Still Not Working

### Check SendGrid Activity:
1. Log in to SendGrid
2. Go to: Activity → Activity Feed
3. Find your recent email
4. Check the actual URL in the "Event Details"

### Verify Environment Variable:
```bash
# In your project directory
echo $SERVER_URL
# Should show your URL
```

### Check Server Logs:
Look for:
- ✅ `Password reset email sent successfully`
- ❌ No "Failed to create URL object" error

---

**Status:** Ready to test after:
1. ✅ Adding `SERVER_URL` to `.env.local`
2. ✅ Disabling SendGrid click tracking
3. ✅ Restarting server

