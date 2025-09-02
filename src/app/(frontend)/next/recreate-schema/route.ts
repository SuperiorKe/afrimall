import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // The best approach is to drop all tables and let Payload recreate them properly
    // This will ensure all ID fields are UUID/TEXT as expected
    
    const results: any = {}
    const tables = ['users', 'categories', 'products', 'media']
    const relationshipTables = [
      'users_sessions',
      'categories_breadcrumbs', 
      'products_images',
      'products_tags',
      'products_rels'
    ]
    
    // First, try to access each table to see current state
    for (const table of tables) {
      try {
        const countResult = await payload.count({
          collection: table as any,
        })
        
        results[table] = {
          exists: true,
          recordCount: countResult.totalDocs,
          needsRecreation: true,
          message: `Table ${table} exists with ${countResult.totalDocs} records. Needs recreation for proper UUID support.`
        }
        
      } catch (error: any) {
        results[table] = {
          exists: false,
          error: error.message,
          needsRecreation: false,
          message: `Table ${table} does not exist or has schema issues.`
        }
      }
    }
    
    // The solution is to manually drop and recreate tables with proper schema
    // Since we can't access raw SQL through Payload's adapter, we'll provide instructions
    
    return NextResponse.json({
      success: true,
      message: 'Schema analysis completed. Manual database recreation required.',
      results,
      instructions: {
        problem: 'Tables were created with INTEGER ID fields, but Payload CMS expects UUID/TEXT fields',
        solution: 'Drop all tables and let Payload recreate them automatically',
        steps: [
          '1. Connect to your RDS database using pgAdmin or psql',
          '2. Drop all existing tables: DROP TABLE IF EXISTS users, categories, products, media, users_sessions, categories_breadcrumbs, products_images, products_tags, products_rels CASCADE;',
          '3. Redeploy the application - Payload will automatically create tables with correct schema',
          '4. Run the seed endpoint to populate initial data',
          '5. Create admin user using the create-admin endpoint'
        ],
        alternative: 'Or use the manual-schema endpoint to recreate tables with proper UUID fields'
      },
      summary: {
        totalTables: tables.length,
        existingTables: tables.filter(table => results[table].exists).length,
        tablesNeedingRecreation: tables.filter(table => results[table].needsRecreation).length,
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
