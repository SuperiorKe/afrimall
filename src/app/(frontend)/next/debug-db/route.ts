import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Starting database diagnostic...')

    const results: any = {
      environment: {},
      connection: {},
      payload: {},
      collections: {},
      errors: [],
    }

    // Step 1: Check environment variables
    console.log('📊 Checking environment variables...')
    results.environment = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_exists: !!process.env.DATABASE_URL,
      POSTGRES_URL_exists: !!process.env.POSTGRES_URL,
      DATABASE_URI_exists: !!process.env.DATABASE_URI,
      VERCEL: process.env.VERCEL,
      NEXT_PHASE: process.env.NEXT_PHASE,
    }

    // Step 2: Try to initialize Payload
    console.log('🚀 Initializing Payload CMS...')
    let payload
    try {
      payload = await getPayload({ config })
      results.payload.initialized = true
      results.payload.adapter = payload.db.constructor.name
      console.log('✅ Payload CMS initialized successfully')
    } catch (error: any) {
      results.payload.initialized = false
      results.payload.error = error.message
      results.errors.push(`Payload initialization failed: ${error.message}`)
      console.log('❌ Payload CMS initialization failed:', error.message)
      return NextResponse.json(
        {
          success: false,
          message: 'Payload CMS initialization failed',
          results,
          error: error.message,
        },
        { status: 500 },
      )
    }

    // Step 3: Test basic database operations
    console.log('🔌 Testing basic database operations...')

    // Test 1: Try to create a simple user
    console.log('👤 Testing user creation...')
    try {
      const testUser = await payload.create({
        collection: 'users',
        data: {
          name: 'Debug Test User',
          email: 'debug-test@afrimall.com',
          role: 'admin',
          password: 'test123',
        },
      })

      results.collections.users = {
        create_success: true,
        user_id: testUser.id,
        message: 'User created successfully',
      }
      console.log('✅ User created successfully:', testUser.id)

      // Try to count users
      const userCount = await payload.count({ collection: 'users' })
      results.collections.users.count = userCount.totalDocs
      console.log('✅ User count:', userCount.totalDocs)

      // Clean up test user
      await payload.delete({
        collection: 'users',
        where: { id: { equals: testUser.id } },
      })
      results.collections.users.cleanup = 'success'
      console.log('✅ Test user cleaned up')
    } catch (error: any) {
      results.collections.users = {
        create_success: false,
        error: error.message,
        stack: error.stack,
      }
      results.errors.push(`User creation failed: ${error.message}`)
      console.log('❌ User creation failed:', error.message)
    }

    // Test 2: Try to create a simple category
    console.log('📂 Testing category creation...')
    try {
      const testCategory = await payload.create({
        collection: 'categories',
        data: {
          title: 'Debug Test Category',
          description: 'Test category for debugging',
          status: 'active',
        },
      })

      results.collections.categories = {
        create_success: true,
        category_id: testCategory.id,
        message: 'Category created successfully',
      }
      console.log('✅ Category created successfully:', testCategory.id)

      // Clean up test category
      await payload.delete({
        collection: 'categories',
        where: { id: { equals: testCategory.id } },
      })
      results.collections.categories.cleanup = 'success'
      console.log('✅ Test category cleaned up')
    } catch (error: any) {
      results.collections.categories = {
        create_success: false,
        error: error.message,
        stack: error.stack,
      }
      results.errors.push(`Category creation failed: ${error.message}`)
      console.log('❌ Category creation failed:', error.message)
    }

    // Test 3: Try to create a simple product
    console.log('🛍️ Testing product creation...')
    try {
      const testProduct = await payload.create({
        collection: 'products',
        data: {
          title: 'Debug Test Product',
          description: 'Test product for debugging',
          price: 9.99,
          status: 'active',
          sku: 'DEBUG-TEST-001',
          inventory: {
            trackQuantity: true,
            quantity: 10,
            allowBackorder: false,
            lowStockThreshold: 5,
          },
        },
      })

      results.collections.products = {
        create_success: true,
        product_id: testProduct.id,
        message: 'Product created successfully',
      }
      console.log('✅ Product created successfully:', testProduct.id)

      // Clean up test product
      await payload.delete({
        collection: 'products',
        where: { id: { equals: testProduct.id } },
      })
      results.collections.products.cleanup = 'success'
      console.log('✅ Test product cleaned up')
    } catch (error: any) {
      results.collections.products = {
        create_success: false,
        error: error.message,
        stack: error.stack,
      }
      results.errors.push(`Product creation failed: ${error.message}`)
      console.log('❌ Product creation failed:', error.message)
    }

    // Step 4: Summary
    const successfulTests = Object.values(results.collections).filter(
      (result: any) => result.create_success,
    )
    const failedTests = Object.values(results.collections).filter(
      (result: any) => !result.create_success,
    )

    console.log('📊 Diagnostic Summary:')
    console.log(`✅ Successful tests: ${successfulTests.length}`)
    console.log(`❌ Failed tests: ${failedTests.length}`)
    console.log(`🚨 Total errors: ${results.errors.length}`)

    if (results.errors.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Database diagnostic completed successfully - all tests passed!',
        results,
        summary: {
          successfulTests: successfulTests.length,
          failedTests: failedTests.length,
          totalErrors: results.errors.length,
        },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Database diagnostic found issues - some tests failed',
          results,
          summary: {
            successfulTests: successfulTests.length,
            failedTests: failedTests.length,
            totalErrors: results.errors.length,
          },
          errors: results.errors,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error('❌ Database diagnostic failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Database diagnostic failed',
        stack: error.stack,
        details: 'Check server logs for more information',
      },
      { status: 500 },
    )
  }
}
