import { s3Storage } from '@payloadcms/storage-s3'

// AWS S3 Storage Configuration
export const s3StorageConfig = s3Storage({
  collections: {
    media: {
      prefix: 'media', // Folder prefix in S3 bucket
      generateFileURL: ({ filename, prefix }: { filename: string; prefix?: string }) => {
        // Generate public URL for files
        const bucket = process.env.AWS_S3_BUCKET
        const region = process.env.AWS_S3_REGION || 'us-east-1'
        const filePrefix = prefix || 'media'

        if (process.env.NODE_ENV === 'production') {
          // Production: Use CloudFront or S3 public URL
          return `https://${bucket}.s3.${region}.amazonaws.com/${filePrefix}/${filename}`
        } else {
          // Development: Use local storage
          return `/uploads/${filePrefix}/${filename}`
        }
      },
    },
  },
  bucket: process.env.AWS_S3_BUCKET || 'afrimall-storage',
  config: {
    endpoint: process.env.AWS_S3_ENDPOINT, // Optional: for custom endpoints
    region: process.env.AWS_S3_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY || '',
    },
  },
})

// Local storage fallback for development
export const localStorageConfig = {
  collections: {
    media: {
      prefix: 'media',
      generateFileURL: ({ filename, prefix }: { filename: string; prefix?: string }) => {
        const filePrefix = prefix || 'media'
        return `/uploads/${filePrefix}/${filename}`
      },
    },
  },
}

// Get storage configuration based on environment
export const getStorageConfig = () => {
  if (process.env.NODE_ENV === 'production' && process.env.AWS_S3_BUCKET) {
    return s3StorageConfig
  }

  return localStorageConfig
}
