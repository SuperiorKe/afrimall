import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

export async function POST(request: NextRequest) {
  let client: Client | null = null
  
  try {
    console.log('🔌 Testing raw database connection...')
    
    // Get database connection string from environment
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URI
    
    if (!databaseUrl) {
      return NextResponse.json({
        success: false,
        error: 'No database connection string found',
        environment: {
          DATABASE_URL: !!process.env.DATABASE_URL,
          POSTGRES_URL: !!process.env.POSTGRES_URL,
          DATABASE_URI: !!process.env.DATABASE_URI
        }
      }, { status: 500 })
    }
    
    console.log('📡 Database URL found, attempting connection...')
    
    // Create PostgreSQL client
    client = new Client({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    })
    
    // Connect to database
    await client.connect()
    console.log('✅ Raw database connection successful')
    
    // Test 1: Basic connection info
    console.log('📊 Getting database info...')
    const versionResult = await client.query('SELECT version(), current_database(), current_user')
    const dbInfo = {
      version: versionResult.rows[0]?.version,
      database: versionResult.rows[0]?.current_database,
      user: versionResult.rows[0]?.current_user
    }
    console.log('✅ Database info retrieved:', dbInfo)
    
    // Test 2: Check existing tables
    console.log('📋 Checking existing tables...')
    const tablesResult = await client.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    const existingTables = tablesResult.rows || []
    console.log('✅ Tables query successful, found:', existingTables.length, 'tables')
    
    // Test 3: Try to create a test table
    console.log('🔧 Testing table creation permissions...')
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS test_permissions (
          id SERIAL PRIMARY KEY,
          test_field VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      console.log('✅ Test table created successfully - user has CREATE TABLE permissions')
      
      // Clean up - drop the test table
      await client.query('DROP TABLE IF EXISTS test_permissions')
      console.log('✅ Test table dropped successfully')
      
      return NextResponse.json({
        success: true,
        message: 'Raw database connection test completed successfully',
        databaseInfo: dbInfo,
        existingTables: existingTables.map(row => ({ name: row.table_name, type: row.table_type })),
        permissions: {
          canCreateTables: true,
          canDropTables: true,
          message: 'User has sufficient database permissions'
        },
        summary: {
          connected: true,
          existingTablesCount: existingTables.length,
          permissionsOk: true
        }
      })
      
    } catch (error: any) {
      console.log('❌ Failed to create test table:', error.message)
      
      return NextResponse.json({
        success: false,
        message: 'Raw database connection test completed but table creation failed',
        databaseInfo: dbInfo,
        existingTables: existingTables.map(row => ({ name: row.table_name, type: row.table_type })),
        permissions: {
          canCreateTables: false,
          canDropTables: false,
          error: error.message,
          message: 'User lacks CREATE TABLE permissions'
        },
        summary: {
          connected: true,
          existingTablesCount: existingTables.length,
          permissionsOk: false
        }
      })
    }
    
  } catch (error: any) {
    console.error('❌ Raw database connection test failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Raw database connection test failed',
        details: 'Check server logs for more information'
      },
      { status: 500 }
    )
  } finally {
    // Always close the connection
    if (client) {
      try {
        await client.end()
        console.log('🔌 Database connection closed')
      } catch (closeError) {
        console.log('⚠️ Error closing database connection:', closeError)
      }
    }
  }
}
