#!/usr/bin/env node

/**
 * Deployment script for Afrimall with Supabase
 * This ensures the correct environment variables are used
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

console.log('🚀 Deploying Afrimall with Supabase...\n')

// Check if .env.local exists
const envLocalPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envLocalPath)) {
  console.log('❌ .env.local not found!')
  console.log('📝 Please create .env.local with your Supabase keys first:')
  console.log('   1. Copy env.production.new to .env.local')
  console.log('   2. Fill in your Supabase keys')
  console.log('   3. Run this script again\n')
  process.exit(1)
}

// Read and validate .env.local
const envContent = fs.readFileSync(envLocalPath, 'utf8')
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
]

const missingVars = requiredVars.filter((varName) => !envContent.includes(varName))

if (missingVars.length > 0) {
  console.log('❌ Missing required environment variables:')
  missingVars.forEach((varName) => console.log(`   - ${varName}`))
  console.log('\n📝 Please update your .env.local file and try again\n')
  process.exit(1)
}

console.log('✅ Environment variables validated')
console.log('✅ Supabase configuration ready')
console.log('✅ Database connection string configured\n')

// Check if we're in the right directory
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  if (packageJson.name !== 'afrimall') {
    throw new Error('Not in Afrimall project directory')
  }
} catch (error) {
  console.log('❌ Please run this script from the Afrimall project root directory\n')
  process.exit(1)
}

console.log('🔧 Starting deployment...\n')

try {
  // Build the project first
  console.log('📦 Building project...')
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ Build completed successfully\n')

  // Deploy to Vercel
  console.log('🚀 Deploying to Vercel...')
  execSync('vercel --prod', { stdio: 'inherit' })
  console.log('✅ Deployment completed successfully!\n')
} catch (error) {
  console.log('❌ Deployment failed:')
  console.log(error.message)
  console.log('\n💡 Troubleshooting tips:')
  console.log('1. Check your Supabase project is active')
  console.log('2. Verify database connection string')
  console.log('3. Ensure all environment variables are set')
  console.log('4. Try running: npm run dev (to test locally first)\n')
  process.exit(1)
}
