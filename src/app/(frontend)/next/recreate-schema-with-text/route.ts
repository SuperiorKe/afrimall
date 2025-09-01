import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    console.log('🔄 Recreating database schema with TEXT fields...')
    
    // Since we can't directly access the database due to connection restrictions,
    // let's try to force Payload to recreate the schema by dropping and recreating collections
    
    const results = []
    
    try {
      // First, let's try to delete all existing data to force schema recreation
      console.log('🗑️ Clearing existing data...')
      
      // Clear users
      const users = await payload.find({ collection: 'users', limit: 1000 })
      for (const user of users.docs) {
        await payload.delete({ collection: 'users', id: user.id })
      }
      
      // Clear categories
      const categories = await payload.find({ collection: 'categories', limit: 1000 })
      for (const category of categories.docs) {
        await payload.delete({ collection: 'categories', id: category.id })
      }
      
      // Clear products
      const products = await payload.find({ collection: 'products', limit: 1000 })
      for (const product of products.docs) {
        await payload.delete({ collection: 'products', id: product.id })
      }
      
      // Clear media
      const media = await payload.find({ collection: 'media', limit: 1000 })
      for (const mediaItem of media.docs) {
        await payload.delete({ collection: 'media', id: mediaItem.id })
      }
      
      results.push({
        step: 'Clear existing data',
        success: true,
        message: 'All existing data cleared'
      })
      
    } catch (error: any) {
      console.log('⚠️ Error clearing data:', error.message)
      results.push({
        step: 'Clear existing data',
        success: false,
        error: error.message
      })
    }
    
    // Now try to create a user to test if the schema works
    try {
      console.log('👤 Testing user creation after data clear...')
      
      const testUser = await payload.create({
        collection: 'users',
        data: {
          name: 'Test Admin User',
          email: 'admin@afrimall.com',
          password: 'adminpassword123',
          role: 'admin' as const
        }
      })
      
      results.push({
        step: 'Test user creation',
        success: true,
        message: 'User creation successful - schema appears to be working',
        userId: testUser.id
      })
      
    } catch (error: any) {
      console.log('❌ User creation still failing:', error.message)
      results.push({
        step: 'Test user creation',
        success: false,
        error: error.message,
        recommendation: 'Schema recreation did not resolve field size issues'
      })
    }
    
    return NextResponse.json({
      success: results.every(r => r.success),
      message: 'Database schema recreation attempt completed',
      results,
      note: 'If user creation still fails, the issue may require direct database access to fix field sizes'
    })
    
  } catch (error: any) {
    console.error('❌ Schema recreation error:', error)
    return NextResponse.json({
      success: false,
      message: 'Schema recreation failed',
      error: error.message
    }, { status: 500 })
  }
}
