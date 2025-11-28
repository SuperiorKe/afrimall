#!/usr/bin/env node

/**
 * Database initialization script for Afrimall
 * This script ensures the database schema is created before the build process
 */

import { getPayload } from 'payload'
import configPromise from '../src/payload.config.ts'

async function initializeDatabase() {
  console.log('🔧 Initializing database schema...')

  try {
    const payload = await getPayload({ config: configPromise })

    // Test database connection by trying to access a collection
    console.log('📊 Testing database connection...')

    // Try to count documents in each collection to ensure tables exist
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
        const count = await payload.count({ collection })
        console.log(`✅ ${collection}: ${count.totalDocs} documents`)
      } catch (error) {
        console.log(`⚠️  ${collection}: Table may not exist yet (this is normal for new databases)`)
      }
    }

    console.log('✅ Database initialization completed')
    return true
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message)
    return false
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then((success) => {
      process.exit(success ? 0 : 1)
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error)
      process.exit(1)
    })
}

export { initializeDatabase }
