import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting database initialization...')

    // Initialize Payload CMS
    const payload = await getPayload({
      config,
    })

    console.log('✅ Payload CMS initialized successfully')

    // Force database schema creation by attempting to access collections
    console.log('🔧 Creating database schema...')

    const tableStatus: any = {}

    // Test users table
    try {
      await payload.find({
        collection: 'users',
        limit: 1,
      })
      tableStatus.users = { created: true, message: 'Users table schema created' }
      console.log('✅ Users table schema created')
    } catch (error: any) {
      tableStatus.users = { created: false, error: error.message }
      console.log('❌ Users table access failed:', error.message)
    }

    // Test categories table
    try {
      await payload.find({
        collection: 'categories',
        limit: 1,
      })
      tableStatus.categories = { created: true, message: 'Categories table schema created' }
      console.log('✅ Categories table schema created')
    } catch (error: any) {
      tableStatus.categories = { created: false, error: error.message }
      console.log('❌ Categories table access failed:', error.message)
    }

    // Test products table
    try {
      await payload.find({
        collection: 'products',
        limit: 1,
      })
      tableStatus.products = { created: true, message: 'Products table schema created' }
      console.log('✅ Products table schema created')
    } catch (error: any) {
      tableStatus.products = { created: false, error: error.message }
      console.log('❌ Products table access failed:', error.message)
    }

    // Test media table
    try {
      await payload.find({
        collection: 'media',
        limit: 1,
      })
      tableStatus.media = { created: true, message: 'Media table schema created' }
      console.log('✅ Media table schema created')
    } catch (error: any) {
      tableStatus.media = { created: false, error: error.message }
      console.log('❌ Media table access failed:', error.message)
    }

    // Check overall success
    const successfulTables = Object.values(tableStatus).filter((status: any) => status.created)
    const failedTables = Object.values(tableStatus).filter((status: any) => !status.created)
    const allTablesCreated = failedTables.length === 0

    console.log('📊 Table Creation Summary:')
    console.log(`✅ Successfully created: ${successfulTables.length} tables`)
    console.log(`❌ Failed to create: ${failedTables.length} tables`)

    if (allTablesCreated) {
      console.log('🎉 Database initialization completed successfully!')
      return NextResponse.json({
        success: true,
        message: 'Database initialization completed successfully! All tables now exist.',
        tableStatus,
        summary: {
          totalTables: Object.keys(tableStatus).length,
          successfulTables: successfulTables.length,
          failedTables: failedTables.length
        }
      })
    } else {
      console.log('⚠️ Database initialization partially failed - some tables could not be created')
      return NextResponse.json({
        success: false,
        message: 'Database initialization partially failed - some tables could not be created',
        tableStatus,
        summary: {
          totalTables: Object.keys(tableStatus).length,
          successfulTables: successfulTables.length,
          failedTables: failedTables.length
        },
        error: 'Some tables failed to create - check the tableStatus for details'
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ Database initialization failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Database initialization failed',
        details: 'Check server logs for more information',
      },
      { status: 500 },
    )
  }
}
