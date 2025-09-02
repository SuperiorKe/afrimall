import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const db = payload.db
    
    const results: any = {}
    const tables = ['users', 'categories', 'products', 'media']
    
    for (const table of tables) {
      try {
        // First, check the current ID column type
        const checkQuery = `
          SELECT data_type 
          FROM information_schema.columns 
          WHERE table_name = $1 AND column_name = 'id'
        `
        const currentType = await db.query(checkQuery, [table])
        
        if (currentType.rows.length > 0 && currentType.rows[0].data_type === 'integer') {
          // Need to convert from INTEGER to TEXT
          console.log(`Converting ${table}.id from INTEGER to TEXT`)
          
          // Step 1: Add a new temporary column
          await db.query(`ALTER TABLE "${table}" ADD COLUMN "id_temp" TEXT`)
          
          // Step 2: Copy existing data (convert integers to strings)
          await db.query(`UPDATE "${table}" SET "id_temp" = "id"::TEXT`)
          
          // Step 3: Drop the old id column
          await db.query(`ALTER TABLE "${table}" DROP COLUMN "id"`)
          
          // Step 4: Rename the temp column to id
          await db.query(`ALTER TABLE "${table}" RENAME COLUMN "id_temp" TO "id"`)
          
          // Step 5: Make it the primary key
          await db.query(`ALTER TABLE "${table}" ADD PRIMARY KEY ("id")`)
          
          results[table] = {
            success: true,
            message: `Successfully converted ${table}.id from INTEGER to TEXT`,
            oldType: 'integer',
            newType: 'text'
          }
        } else {
          results[table] = {
            success: true,
            message: `${table}.id is already TEXT or doesn't exist`,
            currentType: currentType.rows[0]?.data_type || 'not_found'
          }
        }
        
      } catch (error: any) {
        results[table] = {
          success: false,
          error: error.message
        }
      }
    }
    
    // Also fix any relationship tables that might have integer foreign keys
    const relationshipTables = [
      'users_sessions',
      'categories_breadcrumbs', 
      'products_images',
      'products_tags',
      'products_rels'
    ]
    
    for (const table of relationshipTables) {
      try {
        // Check if table exists
        const existsQuery = `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = $1
          )
        `
        const exists = await db.query(existsQuery, [table])
        
        if (exists.rows[0].exists) {
          // Check for integer foreign key columns
          const columnsQuery = `
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = $1 
            AND (column_name LIKE '%_id' OR column_name = 'parent_id')
            AND data_type = 'integer'
          `
          const intColumns = await db.query(columnsQuery, [table])
          
          for (const column of intColumns.rows) {
            const columnName = column.column_name
            console.log(`Converting ${table}.${columnName} from INTEGER to TEXT`)
            
            // Convert the column
            await db.query(`ALTER TABLE "${table}" ADD COLUMN "${columnName}_temp" TEXT`)
            await db.query(`UPDATE "${table}" SET "${columnName}_temp" = "${columnName}"::TEXT`)
            await db.query(`ALTER TABLE "${table}" DROP COLUMN "${columnName}"`)
            await db.query(`ALTER TABLE "${table}" RENAME COLUMN "${columnName}_temp" TO "${columnName}"`)
          }
          
          results[table] = {
            success: true,
            message: `Fixed ${intColumns.rows.length} integer foreign key columns in ${table}`,
            fixedColumns: intColumns.rows.map((col: any) => col.column_name)
          }
        } else {
          results[table] = {
            success: true,
            message: `${table} does not exist, skipping`
          }
        }
      } catch (error: any) {
        results[table] = {
          success: false,
          error: error.message
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'ID field type conversion completed',
      results,
      summary: {
        totalTables: tables.length + relationshipTables.length,
        successfulConversions: Object.values(results).filter((r: any) => r.success).length,
        failedConversions: Object.values(results).filter((r: any) => !r.success).length,
      },
    })
  } catch (error: any) {
    console.error('Error fixing ID fields:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fix ID field types',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
