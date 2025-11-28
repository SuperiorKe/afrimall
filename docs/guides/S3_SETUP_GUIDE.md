# 🚀 AfriMall S3 Image Storage Setup Guide

This guide will walk you through setting up AWS S3 for image storage in your AfriMall project.

## 📋 Prerequisites

- AWS Account with billing enabled
- Vercel account with your project deployed
- Access to your project's Vercel dashboard

## 🎯 Step-by-Step Implementation

### Step 1: Create AWS S3 Bucket

1. **Log into AWS Console**
   - Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
   - Click "Create bucket"

2. **Bucket Configuration**
   ```
   Bucket name: afrimall-media-storage (must be globally unique)
   Region: us-east-1 (or your preferred region)
   Object Ownership: ACLs disabled (recommended)
   Block Public Access: Uncheck "Block all public access"
   ```

3. **Bucket Policy for Public Read Access**
   - Go to your bucket → Permissions → Bucket Policy
   - Add this policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::afrimall-media-storage/*"
       }
     ]
   }
   ```

4. **CORS Configuration**
   - Go to your bucket → Permissions → CORS
   - Add this configuration:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

### Step 2: Set Up AWS IAM User

1. **Create IAM User**
   - Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
   - Users → Create user
   - Username: `afrimall-s3-user`
   - Select "Programmatic access"

2. **Attach S3 Policy**
   - Go to Users → afrimall-s3-user → Permissions
   - Add permissions → Create policy
   - Use this JSON:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::afrimall-media-storage",
           "arn:aws:s3:::afrimall-media-storage/*"
         ]
       }
     ]
   }
   ```

3. **Generate Access Keys**
   - Go to Users → afrimall-s3-user → Security credentials
   - Create access key
   - Save the Access Key ID and Secret Access Key securely

### Step 3: Configure Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Go to Settings → Environment Variables

2. **Add these variables:**
   ```
   AWS_S3_BUCKET=afrimall-media-storage
   AWS_S3_REGION=us-east-1
   AWS_S3_ACCESS_KEY_ID=your_access_key_here
   AWS_S3_SECRET_ACCESS_KEY=your_secret_key_here
   ```

3. **Redeploy your application**
   - Trigger a new deployment to apply the environment variables

### Step 4: Test the Integration

1. **Access Admin Panel**
   - Go to `https://your-domain.com/admin`
   - Log in with your admin credentials

2. **Upload Test Image**
   - Navigate to Media collection
   - Upload a test image
   - Verify it appears in your S3 bucket

3. **Check Image URLs**
   - View the uploaded image details
   - Ensure the URL points to your S3 bucket

## 🔧 Optional: CloudFront CDN Setup

For better performance and global distribution:

### Step 1: Create CloudFront Distribution

1. **Go to CloudFront Console**
   - Navigate to [AWS CloudFront](https://console.aws.amazon.com/cloudfront/)

2. **Create Distribution**
   ```
   Origin Domain: afrimall-media-storage.s3.amazonaws.com
   Origin Path: /media
   Viewer Protocol Policy: Redirect HTTP to HTTPS
   Allowed HTTP Methods: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   ```

3. **Configure Caching**
   ```
   Default TTL: 86400 (1 day)
   Maximum TTL: 31536000 (1 year)
   ```

### Step 2: Update Environment Variables

Add this to your Vercel environment variables:
```
AWS_CLOUDFRONT_DOMAIN=your_cloudfront_domain_here
```

## 🚨 Troubleshooting

### Common Issues

1. **Images not uploading**
   - Check AWS credentials are correct
   - Verify S3 bucket permissions
   - Check Vercel environment variables

2. **Images not displaying**
   - Verify bucket policy allows public read
   - Check CORS configuration
   - Ensure image URLs are correct

3. **403 Forbidden errors**
   - Check IAM user permissions
   - Verify bucket policy
   - Ensure access keys are valid

### Debug Steps

1. **Check Vercel logs**
   - Go to Vercel dashboard → Functions → View logs

2. **Test S3 access**
   - Use AWS CLI to test bucket access
   - Verify credentials work

3. **Check environment variables**
   - Ensure all required variables are set
   - Verify no typos in variable names

## 📊 Cost Optimization

### S3 Storage Classes
- **Standard**: For frequently accessed images
- **Standard-IA**: For less frequently accessed images
- **Glacier**: For archival images

### CloudFront Optimization
- Enable compression
- Set appropriate cache headers
- Use appropriate TTL values

## 🔒 Security Best Practices

1. **IAM Permissions**
   - Use least privilege principle
   - Rotate access keys regularly
   - Monitor access logs

2. **S3 Security**
   - Enable versioning for important files
   - Set up lifecycle policies
   - Monitor access patterns

3. **CloudFront Security**
   - Use HTTPS only
   - Set up WAF if needed
   - Monitor for unusual traffic

## 📈 Monitoring

### CloudWatch Metrics
- Monitor S3 request metrics
- Set up billing alerts
- Track CloudFront performance

### Application Monitoring
- Monitor image upload success rates
- Track page load times
- Set up error alerts

## 🎉 Success!

Once configured, your AfriMall project will:
- ✅ Store images in AWS S3
- ✅ Serve images via CloudFront (if configured)
- ✅ Handle image uploads in the admin panel
- ✅ Display images on the frontend
- ✅ Automatically resize images for different screen sizes

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review AWS CloudWatch logs
3. Check Vercel function logs
4. Verify all environment variables are set correctly
