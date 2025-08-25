#!/usr/bin/env node

/**
 * Check which database type is being used
 * This script shows which database adapter will be selected
 */

import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

function checkDatabaseType() {
  const databaseUrl = process.env.DATABASE_URL
  const nodeEnv = process.env.NODE_ENV || 'development'
  
  console.log('🔍 Checking database configuration...')
  console.log('Environment:', nodeEnv)
  
  if (databaseUrl) {
    console.log('✅ DATABASE_URL found:', databaseUrl.replace(/\/\/.*@/, '//***@').replace(/:[^:]*@/, ':***@'))
    
    if (databaseUrl.startsWith('postgresql://')) {
      console.log('🎯 Database Type: PostgreSQL (Supabase)')
      console.log('📊 Adapter: @payloadcms/db-postgres')
    } else {
      console.log('⚠️  Database Type: Unknown (not PostgreSQL)')
      console.log('📊 Adapter: Will fall back to SQLite')
    }
  } else {
    console.log('❌ DATABASE_URL not found')
    console.log('📊 Adapter: SQLite (default)')
  }
  
  console.log('\n💡 Database Selection Logic:')
  console.log('1. If DATABASE_URL starts with "postgresql://" → PostgreSQL')
  console.log('2. If DATABASE_URL is missing or invalid → SQLite')
  console.log('3. Environment (NODE_ENV) affects SSL settings only')
  
  if (databaseUrl && databaseUrl.startsWith('postgresql://')) {
    console.log('\n🎉 Your app will use Supabase PostgreSQL!')
    console.log('   Run: npm run dev')
    console.log('   Look for PostgreSQL connection messages in the logs')
  } else {
    console.log('\n⚠️  Your app will use SQLite (local database)')
    console.log('   To use Supabase:')
    console.log('   1. Create .env.local with DATABASE_URL')
    console.log('   2. Set DATABASE_URL=postgresql://postgres:password@db.ref.supabase.co:5432/postgres')
  }
}

// Run the check
checkDatabaseType()
