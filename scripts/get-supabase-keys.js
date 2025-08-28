#!/usr/bin/env node

/**
 * Script to help get Supabase keys for the new project
 * Run this after setting up your new Supabase project
 */

console.log('🔑 Getting Supabase Keys for New Project')
console.log('=========================================\n')

console.log('📋 Steps to get your Supabase keys:')
console.log('1. Go to: https://supabase.com/dashboard/project/weerluqbditoutsfzdzi')
console.log('2. Navigate to Settings > API')
console.log('3. Copy the following values:\n')

console.log('   Project URL:')
console.log('   ✅ https://weerluqbditoutsfzdzi.supabase.co\n')

console.log('   anon public key:')
console.log('   🔑 Copy the "anon public" key (starts with "eyJ...")')
console.log('   📝 This goes in: NEXT_PUBLIC_SUPABASE_ANON_KEY\n')

console.log('   service_role key:')
console.log('   🔑 Copy the "service_role" key (starts with "eyJ...")')
console.log('   📝 This goes in: SUPABASE_SERVICE_ROLE_KEY\n')

console.log('4. Update your .env.local file with these values')
console.log('5. Or copy env.production.new to .env.local and fill in the keys\n')

console.log('🔧 Database Connection String:')
console.log(
  '✅ postgresql://postgres:iesdzXAH1bFGPX9M@db.weerluqbditoutsfzdzi.supabase.co:5432/postgres',
)
console.log('📝 This is already set in your environment files\n')

console.log('🚀 After updating the keys:')
console.log('1. Test locally: npm run dev')
console.log('2. Deploy to Vercel: vercel --prod')
console.log('3. The build should now succeed!\n')

console.log('💡 If you still get connection errors:')
console.log('1. Check that your Supabase project is active')
console.log('2. Verify the database password is correct')
console.log('3. Ensure the project reference "weerluqbditoutsfzdzi" matches your dashboard')
