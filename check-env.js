// Script to check environment variables and configuration
// Run this with: node check-env.js

console.log('🔍 Checking environment variables...\n')

const requiredVars = ['PAYLOAD_SECRET', 'DATABASE_URL', 'NODE_ENV']

const optionalVars = ['RATE_LIMIT_MAX_REQUESTS', 'RATE_LIMIT_WINDOW_MS']

console.log('📋 Required variables:')
requiredVars.forEach((varName) => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: ${varName === 'PAYLOAD_SECRET' ? '***SET***' : value}`)
  } else {
    console.log(`❌ ${varName}: NOT SET`)
  }
})

console.log('\n📋 Optional variables:')
optionalVars.forEach((varName) => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: ${value}`)
  } else {
    console.log(`⚠️  ${varName}: NOT SET (using defaults)`)
  }
})

console.log('\n🔧 Current configuration:')
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`)

if (process.env.DATABASE_URL) {
  const isPostgres = process.env.DATABASE_URL.startsWith('postgresql://')
  console.log(`Database: ${isPostgres ? 'PostgreSQL (Supabase)' : 'SQLite'}`)
} else {
  console.log('Database: SQLite (default)')
}

console.log('\n💡 Next steps:')
if (!process.env.PAYLOAD_SECRET) {
  console.log('1. Set PAYLOAD_SECRET environment variable')
}
if (!process.env.DATABASE_URL) {
  console.log('2. Set DATABASE_URL for production (optional for development)')
}
console.log('3. Run: node create-admin-user.js to create admin user')
console.log('4. Start your dev server: npm run dev')
console.log('5. Login to admin panel at /admin')
