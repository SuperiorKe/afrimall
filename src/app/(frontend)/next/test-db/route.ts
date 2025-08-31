import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test 1: Basic connection
    console.log('📡 Testing basic database connection...')
    const payload = await getPayload({
      config,
    })
    console.log('✅ Payload CMS connected successfully')
    
    // Test 2: Check if we can access collections (this should trigger table creation)
    console.log('🔧 Testing collection access...')
    
    try {
      // This should trigger table creation if they don't exist
      const usersResult = await payload.find({
        collection: 'users',
        limit: 1,
      })
      console.log('✅ Users collection access successful:', usersResult)
    } catch (error: any) {
      console.log('⚠️ Users collection access failed (expected during initialization):', error.message)
    }
    
    try {
      const categoriesResult = await payload.find({
        collection: 'categories',
        limit: 1,
      })
      console.log('✅ Categories collection access successful:', categoriesResult)
    } catch (error: any) {
      console.log('⚠️ Categories collection access failed (expected during initialization):', error.message)
    }
    
    try {
      const productsResult = await payload.find({
        collection: 'products',
        limit: 1,
      })
      console.log('✅ Products collection access successful:', productsResult)
    } catch (error: any) {
      console.log('⚠️ Products collection access failed (expected during initialization):', error.message)
    }
    
    // Test 3: Check if tables exist by trying to count documents
    console.log('📋 Checking collection document counts...')
    const collectionStatus: any = {}
    
    try {
      const usersCount = await payload.count({ collection: 'users' })
      collectionStatus.users = { exists: true, count: usersCount.totalDocs }
      console.log('✅ Users collection exists with', usersCount.totalDocs, 'documents')
    } catch (error: any) {
      collectionStatus.users = { exists: false, error: error.message }
      console.log('❌ Users collection does not exist or is not accessible')
    }
    
    try {
      const categoriesCount = await payload.count({ collection: 'categories' })
      collectionStatus.categories = { exists: true, count: categoriesCount.totalDocs }
      console.log('✅ Categories collection exists with', categoriesCount.totalDocs, 'documents')
    } catch (error: any) {
      collectionStatus.categories = { exists: false, error: error.message }
      console.log('❌ Categories collection does not exist or is not accessible')
    }
    
    try {
      const productsCount = await payload.count({ collection: 'products' })
      collectionStatus.products = { exists: true, count: productsCount.totalDocs }
      console.log('✅ Products collection exists with', productsCount.totalDocs, 'documents')
    } catch (error: any) {
      collectionStatus.products = { exists: false, error: error.message }
      console.log('❌ Products collection does not exist or is not accessible')
    }
    
    try {
      const mediaCount = await payload.count({ collection: 'media' })
      collectionStatus.media = { exists: true, count: mediaCount.totalDocs }
      console.log('✅ Media collection exists with', mediaCount.totalDocs, 'documents')
    } catch (error: any) {
      collectionStatus.media = { exists: false, error: error.message }
      console.log('❌ Media collection does not exist or is not accessible')
    }
    
    const existingCollections = Object.entries(collectionStatus).filter(([_, status]: [string, any]) => status.exists)
    const missingCollections = Object.entries(collectionStatus).filter(([_, status]: [string, any]) => !status.exists)
    
    console.log('📊 Collection Status Summary:')
    console.log('✅ Existing collections:', existingCollections.length)
    console.log('❌ Missing collections:', missingCollections.length)
    
    return NextResponse.json({
      success: true,
      message: 'Database connection test completed',
      collectionStatus,
      summary: {
        totalCollections: Object.keys(collectionStatus).length,
        existingCollections: existingCollections.length,
        missingCollections: missingCollections.length,
        connected: true
      }
    })
    
  } catch (error: any) {
    console.error('❌ Database connection test failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Database connection test failed',
        details: 'Check server logs for more information',
        step: 'payload_initialization'
      },
      { status: 500 }
    )
  }
}
