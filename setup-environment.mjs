#!/usr/bin/env node

/**
 * Environment Setup Script for Afrimall
 * This script helps set up environment variables and test the configuration
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔧 Setting up Afrimall Environment...\n')

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env')
const envExists = fs.existsSync(envPath)

if (envExists) {
  console.log('✅ .env file already exists')
} else {
  console.log('❌ .env file not found')
  console.log('📝 Creating .env file...')
  
  const envContent = `# Environment Configuration for Afrimall E-commerce

# Node Environment
NODE_ENV=development

# Database Configuration
DATABASE_URL=file:./afrimall.db

# Stripe Configuration (Test Keys - Replace with your actual keys)
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Health Check Secret (for detailed health checks)
HEALTH_CHECK_SECRET=afrimall_health_check_2024

# PayloadCMS Configuration
PAYLOAD_SECRET=your_payload_secret_here
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Logging
LOG_LEVEL=debug
`
  
  try {
    fs.writeFileSync(envPath, envContent)
    console.log('✅ .env file created successfully')
  } catch (error) {
    console.log('❌ Failed to create .env file:', error.message)
    console.log('💡 Please create the .env file manually with the content above')
  }
}

console.log('\n📋 Required Environment Variables:')
console.log('   1. STRIPE_SECRET_KEY - Your Stripe secret key (starts with sk_test_)')
console.log('   2. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY - Your Stripe publishable key (starts with pk_test_)')
console.log('   3. STRIPE_WEBHOOK_SECRET - Your Stripe webhook secret (starts with whsec_)')
console.log('   4. PAYLOAD_SECRET - A random secret for PayloadCMS')
console.log('   5. DATABASE_URL - Database connection string (default: file:./afrimall.db)')

console.log('\n🔑 How to get Stripe keys:')
console.log('   1. Go to https://dashboard.stripe.com/test/apikeys')
console.log('   2. Copy your test secret key and publishable key')
console.log('   3. Update the .env file with your actual keys')

console.log('\n💡 After updating .env file:')
console.log('   1. Restart your development server: npm run dev')
console.log('   2. Run the test script: node test-checkout-integration.js')

console.log('\n⚠️  Important Notes:')
console.log('   - Never commit .env file to version control')
console.log('   - Use test keys for development, live keys for production')
console.log('   - Keep your secret keys secure')

if (!envExists) {
  console.log('\n📝 Next Steps:')
  console.log('   1. Edit the .env file with your actual Stripe keys')
  console.log('   2. Restart your development server')
  console.log('   3. Test the integration again')
} else {
  console.log('\n🔍 Current .env file content:')
  try {
    const currentEnv = fs.readFileSync(envPath, 'utf8')
    console.log(currentEnv)
  } catch (error) {
    console.log('❌ Could not read .env file:', error.message)
  }
}
