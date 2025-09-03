import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting FORCED schema creation...')

    const payload = await getPayload({ config })
    console.log('✅ Payload CMS initialized successfully')

    const results: any = {}

    // The key insight: Payload CMS creates tables when you try to create documents
    // We need to create minimal documents for each collection to trigger schema creation

    // 1. Force users table creation
    console.log('👤 Forcing users table creation...')
    try {
      const testUser = await payload.create({
        collection: 'users',
        data: {
          name: 'Schema Init User',
          email: 'schema-init@afrimall.com',
          role: 'admin',
          password: 'temp123',
        },
      })

      results.users = {
        success: true,
        message: 'Users table created successfully',
        id: testUser.id,
      }
      console.log('✅ Users table created with ID:', testUser.id)

      // Clean up the test user
      await payload.delete({
        collection: 'users',
        where: { id: { equals: testUser.id } },
      })
      console.log('✅ Test user cleaned up')
    } catch (error: any) {
      results.users = {
        success: false,
        error: error.message,
      }
      console.log('❌ Users table creation failed:', error.message)
    }

    // 2. Force categories table creation
    console.log('📂 Forcing categories table creation...')
    try {
      const testCategory = await payload.create({
        collection: 'categories',
        data: {
          title: 'Schema Init Category',
          status: 'active',
        },
      })

      results.categories = {
        success: true,
        message: 'Categories table created successfully',
        id: testCategory.id,
      }
      console.log('✅ Categories table created with ID:', testCategory.id)

      // Clean up the test category
      await payload.delete({
        collection: 'categories',
        where: { id: { equals: testCategory.id } },
      })
      console.log('✅ Test category cleaned up')
    } catch (error: any) {
      results.categories = {
        success: false,
        error: error.message,
      }
      console.log('❌ Categories table creation failed:', error.message)
    }

    // 3. Force products table creation
    console.log('🛍️ Forcing products table creation...')
    try {
      const testProduct = await payload.create({
        collection: 'products',
        data: {
          title: 'Schema Init Product',
          description: 'Test product for schema creation',
          price: 9.99,
          status: 'active',
          sku: 'SCHEMA-INIT-001',
        },
      })

      results.products = {
        success: true,
        message: 'Products table created successfully',
        id: testProduct.id,
      }
      console.log('✅ Products table created with ID:', testProduct.id)

      // Clean up the test product
      await payload.delete({
        collection: 'products',
        where: { id: { equals: testProduct.id } },
      })
      console.log('✅ Test product cleaned up')
    } catch (error: any) {
      results.products = {
        success: false,
        error: error.message,
      }
      console.log('❌ Products table creation failed:', error.message)
    }

    // 4. Force media table creation
    console.log('🌍 Forcing media table creation...')
    try {
      const testMedia = await payload.create({
        collection: 'media',
        data: {
          alt: 'Schema init media',
        },
      })

      results.media = {
        success: true,
        message: 'Media table created successfully',
        id: testMedia.id,
      }
      console.log('✅ Media table created with ID:', testMedia.id)

      // Clean up the test media
      await payload.delete({
        collection: 'media',
        where: { id: { equals: testMedia.id } },
      })
      console.log('✅ Test media cleaned up')
    } catch (error: any) {
      results.media = {
        success: false,
        error: error.message,
      }
      console.log('❌ Media table creation failed:', error.message)
    }

    // Check overall success
    const successfulTables = Object.values(results).filter((result: any) => result.success)
    const failedTables = Object.values(results).filter((result: any) => !result.success)

    console.log('📊 Schema Creation Summary:')
    console.log(`✅ Successfully created: ${successfulTables.length} tables`)
    console.log(`❌ Failed to create: ${failedTables.length} tables`)

    if (failedTables.length === 0) {
      console.log('🎉 Schema creation completed successfully!')
      return NextResponse.json({
        success: true,
        message: 'Database schema created successfully! All tables are now ready.',
        results,
        summary: {
          totalTables: Object.keys(results).length,
          successfulTables: successfulTables.length,
          failedTables: failedTables.length,
        },
        nextSteps: [
          '1. Run the /next/seed endpoint to populate initial data',
          '2. Run the /next/create-admin endpoint to create your admin user',
          '3. Access the admin panel at /admin',
        ],
      })
    } else {
      console.log('⚠️ Schema creation partially failed')
      return NextResponse.json(
        {
          success: false,
          message: 'Schema creation partially failed - some tables could not be created',
          results,
          summary: {
            totalTables: Object.keys(results).length,
            successfulTables: successfulTables.length,
            failedTables: failedTables.length,
          },
          error: 'Some tables failed to create - check the results for details',
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error('❌ Schema creation failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Schema creation failed',
        details: 'Check server logs for more information',
      },
      { status: 500 },
    )
  }
}
