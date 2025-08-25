#!/usr/bin/env node

/**
 * Test Supabase Database Connection
 * Run this script to verify your Supabase connection string is valid
 */

import { postgresAdapter } from '@payloadcms/db-postgres'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testSupabaseConnection() {
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL not found in environment variables')
    console.log('Please create .env.local with your Supabase connection string')
    process.exit(1)
  }

  if (!databaseUrl.startsWith('postgresql://')) {
    console.log('❌ DATABASE_URL must start with postgresql://')
    console.log('Current value:', databaseUrl)
    process.exit(1)
  }

  console.log('🔍 Testing Supabase configuration...')
  console.log('Host:', databaseUrl.replace(/\/\/.*@/, '//***@').replace(/:[^:]*@/, ':***@'))

  try {
    // Test that we can create the adapter (this validates the connection string format)
    const adapter = postgresAdapter({
      pool: {
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false },
      },
    })

    console.log('✅ Successfully created PostgreSQL adapter!')
    console.log('📊 Adapter Info:')
    console.log('  Name:', adapter.name)
    console.log('  Allow ID on Create:', adapter.allowIDOnCreate)
    console.log('  Default ID Type:', adapter.defaultIDType)
    
    // Test that the adapter has the required methods
    if (typeof adapter.init === 'function') {
      console.log('  Init method: ✅ Available')
    } else {
      console.log('  Init method: ❌ Missing')
    }

    console.log('\n🎉 Supabase configuration test passed!')
    console.log('\n🔧 To test the actual database connection:')
    console.log('1. Run: npm run dev')
    console.log('2. Check the console logs for database connection messages')
    console.log('3. Look for "Connected to PostgreSQL" or similar messages')
    console.log('4. If you see SQLite messages, your DATABASE_URL is not being loaded')
    console.log('\n💡 Alternative: Run: npm run payload')
    console.log('   Then type: config:validate')
    
  } catch (error) {
    console.log('❌ Failed to create PostgreSQL adapter:')
    console.log('Error:', error.message)
    
    if (error.message.includes('Invalid connection string')) {
      console.log('\n💡 Possible solutions:')
      console.log('1. Check your DATABASE_URL format in .env.local')
      console.log('2. Verify your project reference in the URL')
      console.log('3. Ensure the password doesn\'t contain special characters')
    }
    
    if (error.message.includes('Cannot read properties of undefined')) {
      console.log('\n💡 This error suggests an issue with the adapter package')
      console.log('1. Check if @payloadcms/db-postgres is properly installed')
      console.log('2. Try running: npm install @payloadcms/db-postgres')
      console.log('3. Verify your package.json has the correct version')
    }
    
    process.exit(1)
  }
}

// Run the test
testSupabaseConnection().catch(console.error)
