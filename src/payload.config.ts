// storage-adapter-import-placeholder
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { postgresAdapter } from '@payloadcms/db-postgres'

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
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Database configuration - supports both SQLite (dev) and PostgreSQL (prod)
const getDatabaseAdapter = () => {
  const databaseUrl = process.env.DATABASE_URL

  if (databaseUrl && databaseUrl.startsWith('postgresql://')) {
    // PostgreSQL for production (Supabase)
    return postgresAdapter({
      pool: {
        connectionString: databaseUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      },
    })
  }

  // SQLite for development (default)
  return sqliteAdapter({
    client: {
      url: databaseUrl || 'file:./afrimall.db',
    },
  })
}

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    // Custom admin branding
    meta: {
      titleSuffix: ' - Afrimall Admin',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
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
  db: getDatabaseAdapter(),
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
  globals: [Header, Footer],
  plugins: [
    ...plugins,
    // storage-adapter-placeholder
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
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
    'https://your-domain.com', // Replace with your actual domain
  ],
  // Rate limiting configuration
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  },
})
