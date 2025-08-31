import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Checking Payload CMS configuration...')
    
    // Show environment variables
    console.log('📊 Environment Variables:')
    console.log('  NODE_ENV:', process.env.NODE_ENV)
    console.log('  DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('  POSTGRES_URL exists:', !!process.env.POSTGRES_URL)
    console.log('  DATABASE_URI exists:', !!process.env.DATABASE_URI)
    console.log('  VERCEL:', process.env.VERCEL)
    console.log('  NEXT_PHASE:', process.env.NEXT_PHASE)
    
    // Calculate which adapter should be used
    const useSQLite = process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL
    const usePostgreSQL = !useSQLite
    
    console.log('🔧 Calculated Configuration:')
    console.log('  Should use SQLite:', useSQLite)
    console.log('  Should use PostgreSQL:', usePostgreSQL)
    
    // Try to initialize Payload CMS
    console.log('🚀 Initializing Payload CMS...')
    const payload = await getPayload({
      config,
    })
    console.log('✅ Payload CMS initialized successfully')
    
    // Check which adapter was actually used
    console.log('📡 Database Adapter Info:')
    console.log('  Adapter type:', payload.db.constructor.name)
    
    // Test database connection by trying to access a collection
    console.log('🔌 Testing database connection...')
    try {
      // Try to count users to test database connection
      const userCount = await payload.count({ collection: 'users' })
      console.log('✅ Database connection successful - users count:', userCount.totalDocs)
      
      return NextResponse.json({
        success: true,
        message: 'Configuration check completed',
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          DATABASE_URL: !!process.env.DATABASE_URL,
          POSTGRES_URL: !!process.env.POSTGRES_URL,
          DATABASE_URI: !!process.env.DATABASE_URI,
          VERCEL: process.env.VERCEL,
          NEXT_PHASE: process.env.NEXT_PHASE
        },
        configuration: {
          shouldUseSQLite: useSQLite,
          shouldUsePostgreSQL: usePostgreSQL,
          actualAdapter: payload.db.constructor.name
        },
        database: {
          connected: true,
          userCount: userCount.totalDocs,
          message: 'Database connection and query successful'
        }
      })
      
    } catch (error: any) {
      console.log('❌ Database connection failed:', error.message)
      
      return NextResponse.json({
        success: false,
        message: 'Configuration check completed but database connection failed',
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          DATABASE_URL: !!process.env.DATABASE_URL,
          POSTGRES_URL: !!process.env.POSTGRES_URL,
          DATABASE_URI: !!process.env.DATABASE_URI,
          VERCEL: process.env.VERCEL,
          NEXT_PHASE: process.env.NEXT_PHASE
        },
        configuration: {
          shouldUseSQLite: useSQLite,
          shouldUsePostgreSQL: usePostgreSQL,
          actualAdapter: payload.db.constructor.name
        },
        database: {
          connected: false,
          error: error.message,
          message: 'Database connection failed - check adapter configuration'
        }
      })
    }
    
  } catch (error: any) {
    console.error('❌ Configuration check failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Configuration check failed',
        details: 'Check server logs for more information'
      },
      { status: 500 }
    )
  }
}
