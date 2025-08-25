#!/usr/bin/env node

/**
 * Test PostgreSQL Connection String
 * This script tests the connection string directly
 */

import { Client } from 'pg'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testConnection() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.log('❌ DATABASE_URL not found')
    return
  }

  console.log('🔍 Testing connection string...')
  console.log('URL:', databaseUrl.replace(/\/\/.*@/, '//***@').replace(/:[^:]*@/, ':***@'))

  try {
    // Parse the connection string
    const client = new Client({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    })

    console.log('✅ Client created successfully')
    console.log('🔄 Attempting to connect...')

    await client.connect()
    console.log('🎉 Successfully connected to PostgreSQL!')

    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time, version() as db_version')
    console.log('📊 Database Info:')
    console.log('  Current Time:', result.rows[0].current_time)
    console.log('  Version:', result.rows[0].db_version.split(' ')[0])

    await client.end()
    console.log('✅ Connection closed successfully')
  } catch (error) {
    console.log('❌ Connection failed:')
    console.log('Error:', error.message)

    if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('\n💡 This error means the hostname cannot be resolved')
      console.log('Possible causes:')
      console.log('1. Project reference is incorrect')
      console.log('2. Project is paused or suspended')
      console.log('3. Connection string format is wrong')
      console.log('\n🔧 Solutions:')
      console.log('1. Check your Supabase project dashboard')
      console.log('2. Copy the exact connection string from Settings > Database')
      console.log('3. Verify the project reference in the URL')
      console.log('4. Ensure the project is active (not paused)')
    }

    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Password authentication failed')
      console.log('Check your database password in .env.local')
    }
  }
}

// Run the test
testConnection().catch(console.error)
