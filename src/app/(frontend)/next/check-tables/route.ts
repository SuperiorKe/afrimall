import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

export async function POST(request: NextRequest) {
  let client: Client | null = null
  
  try {
    console.log('🔍 Checking what tables actually exist in the database...')
    
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URI
    
    if (!databaseUrl) {
      return NextResponse.json({
        success: false,
        error: 'No database connection string found'
      }, { status: 500 })
    }
    
    client = new Client({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    })
    
    await client.connect()
    console.log('✅ Database connection successful')
    
    // Get all tables in the database
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    const existingTables = tablesResult.rows.map(row => row.table_name)
    console.log('📋 Existing tables:', existingTables)
    
    // Get detailed structure of each table
    const tableStructures: any = {}
    
    for (const tableName of existingTables) {
      try {
        const structureResult = await client.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = $1 AND table_schema = 'public'
          ORDER BY ordinal_position
        `, [tableName])
        
        tableStructures[tableName] = {
          columns: structureResult.rows,
          columnCount: structureResult.rows.length
        }
        
        console.log(`📊 Table ${tableName}: ${structureResult.rows.length} columns`)
        
      } catch (error: any) {
        tableStructures[tableName] = {
          error: error.message,
          columns: []
        }
        console.log(`❌ Error getting structure for ${tableName}:`, error.message)
      }
    }
    
    // Check if Payload CMS expected tables exist
    const expectedTables = [
      'users', 'users_sessions', 
      'categories', 'categories_breadcrumbs',
      'products', 'products_images', 'products_tags', 'products_rels',
      'media', 'product_categories'
    ]
    
    const missingTables = expectedTables.filter(table => !existingTables.includes(table))
    const extraTables = existingTables.filter(table => !expectedTables.includes(table))
    
    console.log('📊 Table Analysis Summary:')
    console.log(`✅ Expected tables found: ${expectedTables.length - missingTables.length}`)
    console.log(`❌ Missing expected tables: ${missingTables.length}`)
    console.log(`🔍 Extra tables found: ${extraTables.length}`)
    
    return NextResponse.json({
      success: true,
      message: 'Database table analysis completed',
      analysis: {
        existingTables,
        expectedTables,
        missingTables,
        extraTables,
        tableStructures
      },
      summary: {
        totalExistingTables: existingTables.length,
        totalExpectedTables: expectedTables.length,
        missingExpectedTables: missingTables.length,
        extraTablesFound: extraTables.length
      }
    })
    
  } catch (error: any) {
    console.error('❌ Table analysis failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Table analysis failed',
        details: 'Check server logs for more information'
      },
      { status: 500 }
    )
  } finally {
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
