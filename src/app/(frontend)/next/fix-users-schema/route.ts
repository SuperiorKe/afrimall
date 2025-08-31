import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

export async function POST(request: NextRequest) {
  let client: Client | null = null

  try {
    console.log('🔧 Starting users table schema fix...')

    const databaseUrl =
      process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URI

    if (!databaseUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'No database connection string found',
        },
        { status: 500 },
      )
    }

    console.log('📡 Connecting to database for schema fix...')

    client = new Client({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
    })

    await client.connect()
    console.log('✅ Database connection successful')

    // Fix users table schema to match Payload CMS requirements
    console.log('👤 Fixing users table schema...')
    try {
      // Update field lengths to accommodate Payload CMS data
      await client.query(`
        ALTER TABLE users 
        ALTER COLUMN name TYPE VARCHAR(500),
        ALTER COLUMN email TYPE VARCHAR(500),
        ALTER COLUMN role TYPE VARCHAR(100),
        ALTER COLUMN reset_password_token TYPE VARCHAR(500),
        ALTER COLUMN salt TYPE VARCHAR(500),
        ALTER COLUMN hash TYPE VARCHAR(500)
      `)

      console.log('✅ Users table schema updated successfully')

      // Verify the changes
      const result = await client.query(`
        SELECT column_name, data_type, character_maximum_length 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `)

      console.log('📊 Updated users table schema:')
      result.rows.forEach((row: any) => {
        console.log(
          `  ${row.column_name}: ${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''}`,
        )
      })

      return NextResponse.json({
        success: true,
        message: 'Users table schema fixed successfully',
        schema: result.rows,
      })
    } catch (error: any) {
      console.error('❌ Failed to fix users table schema:', error.message)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: 'Failed to update users table schema',
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error('❌ Schema fix failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Schema fix failed',
        details: 'Check server logs for more information',
      },
      { status: 500 },
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
