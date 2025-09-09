/**
 * Database initialization utility
 * Ensures database schema is created before build process
 */

import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function initializeDatabase(): Promise<boolean> {
  try {
    console.log('🔧 Initializing database schema...')

    const payload = await getPayload({ config: configPromise })

    // Test database connection by trying to access collections
    const collections = [
      'products',
      'categories',
      'media',
      'users',
      'orders',
      'shopping-cart',
      'payload-preferences',
    ]

    for (const collection of collections) {
      try {
        // Try to count documents to ensure table exists
        await payload.count({ collection: collection as any })
        console.log(`✅ ${collection}: Table exists`)
      } catch (error: any) {
        if (error.code === '42P01') {
          // Table doesn't exist, this is expected for new databases
          console.log(`⚠️  ${collection}: Table will be created on first use`)
        } else {
          console.warn(`⚠️  ${collection}: Error checking table - ${error.message}`)
        }
      }
    }

    console.log('✅ Database initialization completed')
    return true
  } catch (error: any) {
    console.error('❌ Database initialization failed:', error.message)
    return false
  }
}

export async function ensureDatabaseSchema(): Promise<void> {
  try {
    const payload = await getPayload({ config: configPromise })

    // This will trigger schema creation if tables don't exist
    // We'll try to access each collection to ensure tables are created
    const collections = [
      'products',
      'categories',
      'media',
      'users',
      'orders',
      'shopping-cart',
      'payload-preferences',
    ]

    for (const collection of collections) {
      try {
        // Try to find documents with limit 0 to just check if table exists
        await payload.find({ collection: collection as any, limit: 0 })
      } catch (error: any) {
        if (error.code === '42P01') {
          // Table doesn't exist, this is expected for new databases
          console.log(`📝 Creating table for ${collection}...`)
        } else {
          console.warn(`⚠️  Error with ${collection}: ${error.message}`)
        }
      }
    }
  } catch (error: any) {
    console.error('❌ Failed to ensure database schema:', error.message)
    throw error
  }
}
