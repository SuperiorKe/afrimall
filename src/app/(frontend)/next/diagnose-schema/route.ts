import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // Get the database adapter to access raw queries
    const db = payload.db
    
    const results: any = {
      users: {},
      categories: {},
      products: {},
      media: {},
    }

    // Check each table's schema
    const tables = ['users', 'categories', 'products', 'media']
    
    for (const table of tables) {
      try {
        // Get column information for each table
        const columnQuery = `
          SELECT 
            column_name, 
            data_type, 
            character_maximum_length,
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_name = $1 
          ORDER BY ordinal_position
        `
        
        const columns = await db.query(columnQuery, [table])
        
        results[table] = {
          exists: true,
          columns: columns.rows,
          idColumn: columns.rows.find((col: any) => col.column_name === 'id'),
        }
        
        // Check if there are any records
        const countQuery = `SELECT COUNT(*) as count FROM "${table}"`
        const countResult = await db.query(countQuery)
        results[table].recordCount = parseInt(countResult.rows[0].count)
        
      } catch (error: any) {
        results[table] = {
          exists: false,
          error: error.message,
        }
      }
    }

    // Check for any relationship tables
    try {
      const relTablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name LIKE '%_rels' 
        OR table_name LIKE '%_breadcrumbs'
        OR table_name LIKE '%_images'
        OR table_name LIKE '%_tags'
        OR table_name LIKE '%_sessions'
      `
      const relTables = await db.query(relTablesQuery)
      results.relationshipTables = relTables.rows.map((row: any) => row.table_name)
    } catch (error: any) {
      results.relationshipTables = { error: error.message }
    }

    return NextResponse.json({
      success: true,
      message: 'Database schema analysis completed',
      results,
      summary: {
        totalTables: tables.length,
        existingTables: tables.filter(table => results[table].exists).length,
        tablesWithIntegerIds: tables.filter(table => 
          results[table].exists && 
          results[table].idColumn && 
          results[table].idColumn.data_type === 'integer'
        ),
        tablesWithTextIds: tables.filter(table => 
          results[table].exists && 
          results[table].idColumn && 
          (results[table].idColumn.data_type === 'text' || results[table].idColumn.data_type === 'character varying')
        ),
      },
    })
  } catch (error: any) {
    console.error('Error analyzing schema:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to analyze database schema',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
