#!/usr/bin/env node

/**
 * Show Raw Environment Variable
 * This script shows the exact value of DATABASE_URL
 */

import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

function showEnvRaw() {
  const databaseUrl = process.env.DATABASE_URL
  
  console.log('🔍 Raw DATABASE_URL value:')
  console.log('============================')
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL not found')
    return
  }
  
  console.log('Raw value:', databaseUrl)
  console.log('\n📊 Length:', databaseUrl.length)
  console.log('Contains @ symbols:', (databaseUrl.match(/@/g) || []).length)
  
  // Check for common issues
  if (databaseUrl.includes('@@')) {
    console.log('❌ ISSUE: Contains double @ symbols')
  }
  
  if (databaseUrl.includes('[YOUR-PASSWORD]')) {
    console.log('❌ ISSUE: Still contains [YOUR-PASSWORD] placeholder')
  }
  
  if (databaseUrl.includes('[YOUR_PROJECT_REF]')) {
    console.log('❌ ISSUE: Still contains [YOUR_PROJECT_REF] placeholder')
  }
  
  // Show the expected format
  console.log('\n✅ Expected format:')
  console.log('postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres')
  
  // Show what you should have
  console.log('\n💡 Your connection string should look like:')
  console.log('postgresql://postgres:your_actual_password@db.epmjjgjqfufmdpulceeg.supabase.co:5432/postgres')
}

// Run the function
showEnvRaw()
