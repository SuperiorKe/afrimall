# 🚀 AfriMall S3 Deployment Checklist

Use this checklist to ensure your S3 image storage is properly configured and deployed.

## ✅ Pre-Deployment Checklist

### AWS Configuration
- [ ] S3 bucket created with unique name
- [ ] Bucket policy allows public read access
- [ ] CORS configuration added
- [ ] IAM user created with S3 permissions
- [ ] Access keys generated and saved securely

### Vercel Configuration
- [ ] Environment variables added to Vercel dashboard:
  - [ ] `AWS_S3_BUCKET`
  - [ ] `AWS_S3_REGION`
  - [ ] `AWS_S3_ACCESS_KEY_ID`
  - [ ] `AWS_S3_SECRET_ACCESS_KEY`
  - [ ] `AWS_CLOUDFRONT_DOMAIN` (optional)

### Code Configuration
- [ ] Payload configuration updated with S3 plugin
- [ ] Media collection configured for S3 storage
- [ ] S3 storage configuration file updated
- [ ] All TypeScript errors resolved

## 🚀 Deployment Steps

### 1. Deploy to Vercel
- [ ] Push changes to your repository
- [ ] Trigger deployment in Vercel dashboard
- [ ] Wait for deployment to complete
- [ ] Check deployment logs for errors

### 2. Test S3 Integration
- [ ] Access admin panel at `https://your-domain.com/admin`
- [ ] Navigate to Media collection
- [ ] Upload a test image
- [ ] Verify image appears in S3 bucket
- [ ] Check image URL is correct

### 3. Test Frontend Display
- [ ] Visit your website
- [ ] Check that images load correctly
- [ ] Test on different devices/screen sizes
- [ ] Verify image optimization is working

## 🔍 Post-Deployment Verification

### S3 Bucket Check
- [ ] Images are being uploaded to correct folder (`media/`)
- [ ] File permissions are correct
- [ ] Images are accessible via public URLs

### Performance Check
- [ ] Images load quickly
- [ ] Different image sizes are generated
- [ ] CloudFront is working (if configured)

### Error Monitoring
- [ ] Check Vercel function logs
- [ ] Monitor AWS CloudWatch logs
- [ ] Set up error alerts if needed

## 🚨 Rollback Plan

If something goes wrong:
1. [ ] Remove S3 environment variables from Vercel
2. [ ] Redeploy to use local storage
3. [ ] Fix issues in development
4. [ ] Re-deploy with corrected configuration

## 📊 Monitoring Setup

### AWS CloudWatch
- [ ] Set up billing alerts
- [ ] Monitor S3 request metrics
- [ ] Track CloudFront performance (if used)

### Vercel Analytics
- [ ] Monitor function execution times
- [ ] Track error rates
- [ ] Set up performance alerts

## 🎯 Success Criteria

Your S3 integration is successful when:
- [ ] Images upload successfully in admin panel
- [ ] Images display correctly on frontend
- [ ] Image URLs point to S3/CloudFront
- [ ] No errors in logs
- [ ] Performance is acceptable

## 📞 Next Steps

After successful deployment:
- [ ] Set up automated backups
- [ ] Configure image optimization settings
- [ ] Set up monitoring and alerting
- [ ] Document any custom configurations
- [ ] Train team on new image management workflow
