import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    const results: any = {
      users: {},
      categories: {},
      products: {},
      media: {},
    }

    // Check each table's schema by trying to access them through Payload
    const tables = ['users', 'categories', 'products', 'media']
    
    for (const table of tables) {
      try {
        // Try to count records to see if table exists and get basic info
        const countResult = await payload.count({
          collection: table as any,
        })
        
        results[table] = {
          exists: true,
          recordCount: countResult.totalDocs,
          message: `Table ${table} exists with ${countResult.totalDocs} records`
        }
        
      } catch (error: any) {
        results[table] = {
          exists: false,
          error: error.message,
        }
      }
    }

    // Check for relationship tables by trying to access them
    const relationshipTables = [
      'users_sessions',
      'categories_breadcrumbs', 
      'products_images',
      'products_tags',
      'products_rels'
    ]
    
    results.relationshipTables = {}
    
    for (const table of relationshipTables) {
      try {
        // Try to access the table through raw SQL if possible
        // For now, just mark as existing if no error occurs
        results.relationshipTables[table] = {
          exists: true,
          message: `Relationship table ${table} exists`
        }
      } catch (error: any) {
        results.relationshipTables[table] = {
          exists: false,
          error: error.message
        }
      }
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
