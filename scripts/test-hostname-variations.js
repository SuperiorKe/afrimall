#!/usr/bin/env node

/**
 * Test Different Hostname Variations
 * This script tests various possible hostname formats
 */

import { Client } from 'pg'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testHostnameVariations() {
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL not found')
    return
  }

  console.log('🔍 Testing different hostname variations...')
  console.log('Original URL:', databaseUrl.replace(/\/\/.*@/, '//***@').replace(/:[^:]*@/, ':***@'))

  // Extract components from the original URL
  const match = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
  if (!match) {
    console.log('❌ Could not parse connection string')
    return
  }

  const [, user, password, hostname, port, database] = match
  console.log('\n📊 Parsed Components:')
  console.log('  User:', user)
  console.log('  Password:', '***' + password.slice(-4))
  console.log('  Hostname:', hostname)
  console.log('  Port:', port)
  console.log('  Database:', database)

  // Test different hostname variations
  const variations = [
    hostname,
    hostname.replace('.supabase.co', '.supabase.co'),
    hostname.replace('db.', ''),
    hostname.replace('.supabase.co', ''),
    hostname + '.supabase.co',
    'db.' + hostname.replace('db.', '') + '.supabase.co'
  ]

  console.log('\n🧪 Testing hostname variations...')
  
  for (const variation of variations) {
    if (variation === hostname) continue // Skip the original
    
    const testUrl = `postgresql://${user}:${password}@${variation}:${port}/${database}`
    console.log(`\n🔍 Testing: ${variation}`)
    
    try {
      const client = new Client({
        connectionString: testUrl,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000 // 5 second timeout
      })

      await client.connect()
      console.log(`✅ SUCCESS with: ${variation}`)
      
      // Test a query
      const result = await client.query('SELECT NOW() as current_time')
      console.log(`📊 Database time: ${result.rows[0].current_time}`)
      
      await client.end()
      
      console.log(`\n🎉 Found working hostname: ${variation}`)
      console.log(`💡 Update your .env.local with:`)
      console.log(`DATABASE_URL=postgresql://${user}:***@${variation}:${port}/${database}`)
      return
      
    } catch (error) {
      if (error.message.includes('getaddrinfo ENOTFOUND')) {
        console.log(`❌ Hostname not found: ${variation}`)
      } else if (error.message.includes('password authentication failed')) {
        console.log(`⚠️  Password auth failed: ${variation}`)
      } else {
        console.log(`❌ Other error: ${error.message}`)
      }
    }
  }

  console.log('\n❌ No working hostname variations found')
  console.log('\n💡 Troubleshooting steps:')
  console.log('1. Check if your Supabase project is active')
  console.log('2. Verify the project reference in your dashboard URL')
  console.log('3. Try creating a new Supabase project')
  console.log('4. Check if there are any IP restrictions')
}

// Run the test
testHostnameVariations().catch(console.error)
