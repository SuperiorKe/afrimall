import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting FORCED database initialization...')

    // Initialize Payload CMS
    const payload = await getPayload({
      config,
    })
    console.log('✅ Payload CMS initialized successfully')

    // Force schema creation by attempting to create actual documents
    console.log('🔧 FORCING database schema creation...')

    const results: any = {}

    // Force users table creation
    console.log('👤 FORCING users table creation...')
    try {
      const testUser = await payload.create({
        collection: 'users',
        data: {
          name: 'Test Admin User',
          email: 'test-admin@afrimall.com',
          role: 'admin',
          password: 'test123'
        }
      })
      results.users = { success: true, message: 'Users table created successfully', id: testUser.id }
      console.log('✅ Users table created successfully with test user')
      
      // Clean up test user
      await payload.delete({
        collection: 'users',
        where: { email: { equals: 'test-admin@afrimall.com' } }
      })
      console.log('✅ Test user cleaned up')
      
    } catch (error: any) {
      results.users = { success: false, error: error.message }
      console.log('❌ Failed to create users table:', error.message)
    }

    // Force categories table creation
    console.log('📂 FORCING categories table creation...')
    try {
      const testCategory = await payload.create({
        collection: 'categories',
        data: {
          name: 'Test Category',
          description: 'Test category for schema creation'
        }
      })
      results.categories = { success: true, message: 'Categories table created successfully', id: testCategory.id }
      console.log('✅ Categories table created successfully with test category')
      
      // Clean up test category
      await payload.delete({
        collection: 'categories',
        where: { name: { equals: 'Test Category' } }
      })
      console.log('✅ Test category cleaned up')
      
    } catch (error: any) {
      results.categories = { success: false, error: error.message }
      console.log('❌ Failed to create categories table:', error.message)
    }

    // Force products table creation
    console.log('🛍️ FORCING products table creation...')
    try {
      const testProduct = await payload.create({
        collection: 'products',
        data: {
          name: 'Test Product',
          description: 'Test product for schema creation',
          price: 9.99
        }
      })
      results.products = { success: true, message: 'Products table created successfully', id: testProduct.id }
      console.log('✅ Products table created successfully with test product')
      
      // Clean up test product
      await payload.delete({
        collection: 'products',
        where: { name: { equals: 'Test Product' } }
      })
      console.log('✅ Test product cleaned up')
      
    } catch (error: any) {
      results.products = { success: false, error: error.message }
      console.log('❌ Failed to create products table:', error.message)
    }

    // Force media table creation
    console.log('🌍 FORCING media table creation...')
    try {
      const testMedia = await payload.create({
        collection: 'media',
        data: {
          alt: 'Test media for schema creation'
        }
      })
      results.media = { success: true, message: 'Media table created successfully', id: testMedia.id }
      console.log('✅ Media table created successfully with test media')
      
      // Clean up test media
      await payload.delete({
        collection: 'media',
        where: { alt: { equals: 'Test media for schema creation' } }
      })
      console.log('✅ Test media cleaned up')
      
    } catch (error: any) {
      results.media = { success: false, error: error.message }
      console.log('❌ Failed to create media table:', error.message)
    }

    // Check overall success
    const successfulTables = Object.values(results).filter((result: any) => result.success)
    const failedTables = Object.values(results).filter((result: any) => !result.success)

    console.log('📊 FORCED Initialization Summary:')
    console.log(`✅ Successfully created: ${successfulTables.length} tables`)
    console.log(`❌ Failed to create: ${failedTables.length} tables`)

    if (failedTables.length === 0) {
      console.log('🎉 FORCED database initialization completed successfully!')
      return NextResponse.json({
        success: true,
        message: 'FORCED database initialization completed successfully! All tables now exist.',
        results,
        summary: {
          totalTables: Object.keys(results).length,
          successfulTables: successfulTables.length,
          failedTables: failedTables.length
        }
      })
    } else {
      console.log('⚠️ FORCED database initialization partially failed')
      return NextResponse.json({
        success: false,
        message: 'FORCED database initialization partially failed - some tables could not be created',
        results,
        summary: {
          totalTables: Object.keys(results).length,
          successfulTables: successfulTables.length,
          failedTables: failedTables.length
        },
        error: 'Some tables failed to create - check the results for details'
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ FORCED database initialization failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'FORCED database initialization failed',
        details: 'Check server logs for more information',
      },
      { status: 500 },
    )
  }
}
