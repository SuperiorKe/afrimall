// Script to create the first admin user for Payload CMS
// Run this with: node create-admin-user.js

import { getPayload } from 'payload'
import config from './src/payload.config.ts'

async function createAdminUser() {
  try {
    console.log('🚀 Initializing Payload...')
    const payload = await getPayload({ config })

    console.log('🔍 Checking if admin user already exists...')
    const existingUser = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: 'admin@afrimall.com',
        },
      },
    })

    if (existingUser.totalDocs > 0) {
      console.log('✅ Admin user already exists:', existingUser.docs[0].email)
      return
    }

    console.log('👤 Creating admin user...')
    const adminUser = await payload.create({
      collection: 'users',
      data: {
        name: 'Admin User',
        email: 'admin@afrimall.com',
        role: 'super_admin',
        password: 'admin123', // Change this password!
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', adminUser.email)
    console.log('🔑 Role:', adminUser.role)
    console.log('⚠️  IMPORTANT: Change the password in the admin panel!')

    await payload.destroy()
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    process.exit(1)
  }
}

createAdminUser()
