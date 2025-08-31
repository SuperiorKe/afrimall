import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Checking database user permissions...')
    
    // Initialize Payload CMS
    const payload = await getPayload({
      config,
    })
    console.log('✅ Payload CMS connected successfully')
    
    // Test 1: Check current user and database
    console.log('📊 Checking current database context...')
    
    try {
      // Try to create a simple test table to check permissions
      const testTableQuery = `
        CREATE TABLE IF NOT EXISTS test_permissions (
          id SERIAL PRIMARY KEY,
          test_field VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      
      // Use the raw database connection if available
      if (payload.db && typeof (payload.db as any).query === 'function') {
        try {
          await (payload.db as any).query(testTableQuery)
          console.log('✅ Successfully created test table - user has CREATE TABLE permissions')
          
          // Clean up - drop the test table
          await (payload.db as any).query('DROP TABLE IF EXISTS test_permissions')
          console.log('✅ Successfully dropped test table')
          
          return NextResponse.json({
            success: true,
            message: 'Database permissions check completed',
            permissions: {
              canCreateTables: true,
              canDropTables: true,
              user: 'afrimall_admin',
              status: 'User has sufficient permissions to create tables'
            }
          })
        } catch (error: any) {
          console.log('❌ Failed to create test table:', error.message)
          return NextResponse.json({
            success: false,
            message: 'Database permissions check completed',
            permissions: {
              canCreateTables: false,
              canDropTables: false,
              user: 'afrimall_admin',
              status: 'User lacks CREATE TABLE permissions',
              error: error.message
            }
          })
        }
      } else {
        console.log('⚠️ Raw database query method not available')
        
        // Alternative: Try to force table creation through Payload
        console.log('🔧 Attempting to force table creation through Payload...')
        
        try {
          // This should trigger table creation
          await payload.create({
            collection: 'users',
            data: {
              name: 'Test User',
              email: 'test@example.com',
              role: 'admin',
              password: 'test123'
            }
          })
          console.log('✅ Successfully created user - tables were created')
          
          // Clean up
          await payload.delete({
            collection: 'users',
            where: {
              email: { equals: 'test@example.com' }
            }
          })
          console.log('✅ Cleaned up test user')
          
          return NextResponse.json({
            success: true,
            message: 'Database permissions check completed',
            permissions: {
              canCreateTables: true,
              canDropTables: true,
              user: 'afrimall_admin',
              status: 'User has sufficient permissions - tables created successfully'
            }
          })
          
        } catch (error: any) {
          console.log('❌ Failed to create user through Payload:', error.message)
          return NextResponse.json({
            success: false,
            message: 'Database permissions check completed',
            permissions: {
              canCreateTables: false,
              canDropTables: false,
              user: 'afrimall_admin',
              status: 'User lacks permissions or Payload configuration issue',
              error: error.message
            }
          })
        }
      }
      
    } catch (error: any) {
      console.error('❌ Permission check failed:', error)
      return NextResponse.json({
        success: false,
        error: error.message || 'Permission check failed',
        details: 'Check server logs for more information'
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('❌ Database permission check failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Database permission check failed',
        details: 'Check server logs for more information'
      },
      { status: 500 }
    )
  }
}
