#!/usr/bin/env node

/**
 * Safe Build Script for Afrimall
 * This script temporarily switches to SQLite mode to avoid database connection issues during build
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔧 Starting safe build process...\n')

// Check if we have the SQLite database
const dbPath = path.join(process.cwd(), 'afrimall.db')
if (!fs.existsSync(dbPath)) {
  console.log('❌ SQLite database not found. Creating empty database...')

  // Create an empty SQLite database file
  fs.writeFileSync(dbPath, '')
  console.log('✅ Empty SQLite database created')
}

// Backup current .env.local
const envLocalPath = path.join(process.cwd(), '.env.local')
const envLocalBackupPath = path.join(process.cwd(), '.env.local.backup')

if (fs.existsSync(envLocalPath)) {
  console.log('📋 Backing up current .env.local...')
  fs.copyFileSync(envLocalPath, envLocalBackupPath)
  console.log('✅ .env.local backed up')
}

// Create temporary build environment
const buildEnvPath = path.join(process.cwd(), '.env.build.temp')
const buildEnvContent = `# Temporary build environment
NODE_ENV=development
PAYLOAD_SECRET=your_payload_secret_here
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Force SQLite for build process
DATABASE_URL=file:./afrimall.db
DATABASE_URI=file:./afrimall.db

# Supabase Configuration (for runtime only)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=your_webhook_secret_here

# Build-specific flags
BUILD_MODE=true
SKIP_DATABASE_CONNECTION=true
`

console.log('📝 Creating temporary build environment...')
fs.writeFileSync(buildEnvPath, buildEnvContent)
console.log('✅ Temporary build environment created')

try {
  // Copy temporary env to .env.local for build
  fs.copyFileSync(buildEnvPath, envLocalPath)
  console.log('✅ Environment switched to build mode')

  console.log('\n🚀 Starting build process...')
  console.log('   This may take a few minutes...\n')

  // Run the build
  execSync('npm run build', {
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--no-deprecation' },
  })

  console.log('\n✅ Build completed successfully!')
} catch (error) {
  console.error('\n❌ Build failed:', error.message)
  process.exit(1)
} finally {
  // Cleanup: restore original .env.local
  console.log('\n🧹 Cleaning up...')

  if (fs.existsSync(envLocalBackupPath)) {
    fs.copyFileSync(envLocalBackupPath, envLocalPath)
    fs.unlinkSync(envLocalBackupPath)
    console.log('✅ Original .env.local restored')
  }

  // Remove temporary files
  if (fs.existsSync(buildEnvPath)) {
    fs.unlinkSync(buildEnvPath)
    console.log('✅ Temporary files cleaned up')
  }

  console.log('\n🎉 Build process completed!')
}
