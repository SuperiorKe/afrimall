import { s3Storage } from '@payloadcms/storage-s3'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Customers } from './collections/Customers'
import { Media } from './collections/Media'
import { Orders } from './collections/Orders'

import { Products } from './collections/Products'
import { ProductVariants } from './collections/ProductVariants'
import { ShoppingCart } from './collections/ShoppingCart'
import { Users } from './collections/Users'
import { PayloadPreferences } from './collections/PayloadPreferences'
import { Footer } from './components/layout/Footer/config'
import { Header } from './components/layout/Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utils/helpers/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Database configuration - Amazon RDS PostgreSQL
// Simplified logic to ensure PostgreSQL is used in production

// Debug database configuration
const useSQLite = process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL
const usePostgreSQL = !useSQLite && process.env.DATABASE_URL

console.log('🔧 Database Configuration Debug:')
console.log('  NODE_ENV:', process.env.NODE_ENV)
console.log('  DATABASE_URL exists:', !!process.env.DATABASE_URL)
console.log('  Using SQLite:', useSQLite)
console.log('  Using PostgreSQL:', usePostgreSQL)

export default buildConfig({
  admin: {
    components: {
      // Admin components removed for e-commerce focus
    },
    // Custom admin branding
    meta: {
      titleSuffix: ' - Afrimall Admin',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    // Enable admin panel access
    disable: false,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db:
    // Use SQLite during build time or when no DATABASE_URL is provided
    useSQLite || !process.env.DATABASE_URL
      ? sqliteAdapter({
          client: {
            url: 'file:./afrimall.db',
          },
        })
      : postgresAdapter({
          pool: {
            connectionString:
              process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.DATABASE_URI,
            ssl: {
              rejectUnauthorized: false,
              checkServerIdentity: () => undefined,
            },
          },
        }),
  collections: [
    Media,
    Categories,
    Products,
    ProductVariants,
    Customers,
    Orders,
    ShoppingCart,
    Users,
    PayloadPreferences,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer], // Always include globals for proper TypeScript types
  plugins: [
    ...plugins,
    // S3 Storage for media uploads - only load if properly configured
    ...(process.env.AWS_S3_BUCKET &&
    process.env.AWS_S3_ACCESS_KEY_ID &&
    process.env.AWS_S3_SECRET_ACCESS_KEY
      ? [
          s3Storage({
            collections: {
              media: {
                prefix: 'media',
                generateFileURL: ({ filename, prefix }) => {
                  const bucket = process.env.AWS_S3_BUCKET
                  const region = process.env.AWS_S3_REGION || 'us-east-1'
                  const filePrefix = prefix || 'media'

                  // Use CloudFront if available, otherwise S3 public URL
                  if (process.env.AWS_CLOUDFRONT_DOMAIN) {
                    return `https://${process.env.AWS_CLOUDFRONT_DOMAIN}/${filePrefix}/${filename}`
                  }
                  return `https://${bucket}.s3.${region}.amazonaws.com/${filePrefix}/${filename}`
                },
              },
            },
            bucket: process.env.AWS_S3_BUCKET,
            config: {
              region: process.env.AWS_S3_REGION || 'us-east-1',
              credentials: {
                accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
              },
            },
          }),
        ]
      : []),
  ],
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key-here',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress:
          process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@afrimall.app',
        defaultFromName: 'AfriMall',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: parseInt(process.env.SMTP_PORT || '587') === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        },
      })
    : undefined,
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users with admin or super_admin roles to execute this endpoint
        if (!req.user || req.user.collection !== 'users') return false
        const userData = req.user as any
        return ['admin', 'super_admin'].includes(userData.role)
      },
    },
  },
  // Enhanced security configuration
  csrf: [
    'http://localhost:3000',
    'https://afrimall.vercel.app',
    'https://afrimall.app',
    'https://www.afrimall.app',
  ],
})
