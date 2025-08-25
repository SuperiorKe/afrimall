#!/usr/bin/env node

/**
 * Monitor Supabase Connection Status
 * This script helps troubleshoot database connection issues
 */

import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

function monitorSupabase() {
  const databaseUrl = process.env.DATABASE_URL
  
  console.log('🔍 Supabase Connection Monitor')
  console.log('===============================')
  
  if (!databaseUrl) {
    console.log('❌ CRITICAL: DATABASE_URL not found!')
    console.log('   Your app will use SQLite instead of Supabase')
    console.log('\n💡 Solution:')
    console.log('   1. Create .env.local file')
    console.log('   2. Add: DATABASE_URL=postgresql://postgres:password@db.ref.supabase.co:5432/postgres')
    return
  }
  
  if (!databaseUrl.startsWith('postgresql://')) {
    console.log('❌ CRITICAL: Invalid DATABASE_URL format!')
    console.log('   Must start with "postgresql://"')
    console.log('\n💡 Solution: Check your connection string format')
    return
  }
  
  console.log('✅ DATABASE_URL: Found and valid')
  console.log('✅ Format: PostgreSQL connection string')
  
  // Extract project reference for verification
  const projectRef = databaseUrl.match(/db\.([^.]+)\.supabase\.co/)?.[1]
  if (projectRef) {
    console.log(`✅ Project Reference: ${projectRef}`)
    console.log(`🔗 Supabase Dashboard: https://supabase.com/dashboard/project/${projectRef}`)
  }
  
  console.log('\n🚀 Next Steps:')
  console.log('1. Go to: http://localhost:3000/admin')
  console.log('2. Create your first admin user')
  console.log('3. Check Supabase dashboard for new tables')
  console.log('4. Look for database connection messages in your terminal')
  
  console.log('\n🔧 Troubleshooting Commands:')
  console.log('   npm run check:db          # Check database configuration')
  console.log('   npm run test:supabase     # Test Supabase adapter')
  console.log('   npm run dev               # Start app and watch logs')
  
  console.log('\n📊 Expected Behavior:')
  console.log('   ✅ App starts without database errors')
  console.log('   ✅ Admin panel loads at /admin')
  console.log('   ✅ Creating users/products works')
  console.log('   ✅ Data appears in Supabase dashboard')
  
  console.log('\n🚨 Common Issues:')
  console.log('   • Supabase project paused → Resume in dashboard')
  console.log('   • Wrong password → Check .env.local')
  console.log('   • IP blocked → Check Supabase settings')
  console.log('   • SSL errors → Already handled in config')
}

// Run the monitor
monitorSupabase()
