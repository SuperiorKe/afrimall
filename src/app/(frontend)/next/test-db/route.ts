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
    
    // Test 2: Check if we can access the database directly
    console.log('🔧 Testing database access...')
    
    try {
      // This should trigger table creation if they don't exist
      const result = await payload.db.query('SELECT current_database(), current_user, version()')
      console.log('✅ Database query successful:', result)
    } catch (error: any) {
      console.log('❌ Database query failed:', error.message)
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: error.message,
        step: 'database_query'
      }, { status: 500 })
    }
    
    // Test 3: Check if tables exist
    console.log('📋 Checking existing tables...')
    try {
      const tablesResult = await payload.db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `)
      console.log('✅ Tables query successful:', tablesResult)
      
      const existingTables = tablesResult.rows?.map((row: any) => row.table_name) || []
      console.log('📊 Existing tables:', existingTables)
      
      return NextResponse.json({
        success: true,
        message: 'Database connection test completed',
        existingTables,
        databaseInfo: {
          connected: true,
          tablesCount: existingTables.length
        }
      })
      
    } catch (error: any) {
      console.log('❌ Tables query failed:', error.message)
      return NextResponse.json({
        success: false,
        error: 'Tables query failed',
        details: error.message,
        step: 'tables_query'
      }, { status: 500 })
    }
    
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
