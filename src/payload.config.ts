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

// Database configuration - Supabase PostgreSQL
const getDatabaseAdapter = () => {
  try {
    // Debug: Log all available database-related environment variables
    console.log('Environment check:')
    console.log('- NODE_ENV:', process.env.NODE_ENV)
    console.log('- POSTGRES_URL exists:', !!process.env.POSTGRES_URL)
    console.log('- SUPABASE_URL exists:', !!process.env.SUPABASE_URL)
    console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL)
    
    // Try multiple environment variable names for compatibility
    const databaseUrl = process.env.POSTGRES_URL || process.env.SUPABASE_URL || process.env.DATABASE_URL

    if (databaseUrl && databaseUrl.startsWith('postgresql://')) {
      console.log('✅ Using Supabase PostgreSQL database:', databaseUrl.substring(0, 50) + '...')
      // Supabase PostgreSQL for production
      return postgresAdapter({
        pool: {
          connectionString: databaseUrl,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        },
      })
    }

    // Fallback to SQLite for development if no Supabase connection
    console.warn('❌ No Supabase database URL found, falling back to SQLite for development')
    console.warn('Available env vars:', Object.keys(process.env).filter(key => key.includes('POSTGRES') || key.includes('SUPABASE') || key.includes('DATABASE')))
    return sqliteAdapter({
      client: {
        url: 'file:./afrimall.db',
      },
    })
  } catch (error) {
    console.warn('❌ Failed to initialize Supabase database adapter:', error)
    // Return SQLite fallback
    return sqliteAdapter({
      client: {
        url: 'file:./afrimall.db',
      },
    })
  }
}

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
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key-here',
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

})
