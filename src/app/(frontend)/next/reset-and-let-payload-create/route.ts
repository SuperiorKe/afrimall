import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // The best approach is to completely reset the database and let Payload create its own schema
    // This ensures all field names, types, and relationships are exactly what Payload expects
    
    const resetSQL = `
      -- Drop ALL tables and let Payload recreate them with correct schema
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO afrimall_admin;
      GRANT ALL ON SCHEMA public TO public;
    `
    
    return NextResponse.json({
      success: true,
      message: 'Database reset SQL generated - this will let Payload create its own schema',
      instructions: {
        problem: 'Manual schema creation is causing field naming and type mismatches with Payload CMS expectations',
        solution: 'Completely reset the database and let Payload CMS create its own schema automatically',
        steps: [
          '1. Open pgAdmin and connect to your RDS database',
          '2. Open the Query Tool (SQL Editor)',
          '3. Copy and paste the SQL commands below',
          '4. Execute the commands (this will delete ALL data and tables)',
          '5. Redeploy your application - Payload will automatically create the correct schema',
          '6. Run the seed endpoint to populate initial data',
          '7. Create admin user using the create-admin endpoint'
        ],
        warning: 'This will delete ALL existing data and tables. Make sure you want to start fresh.',
        note: 'Payload CMS will automatically create tables with correct field names, types, and relationships'
      },
      sqlCommands: resetSQL,
      summary: {
        action: 'Complete database reset',
        result: 'Payload CMS will create its own schema with correct field names and types',
        benefits: [
          'No more field naming mismatches',
          'Correct data types for all fields',
          'Proper relationships and constraints',
          'UUID generation working correctly',
          'No more destructuring errors'
        ]
      }
    })
  } catch (error: any) {
    console.error('Error generating reset SQL:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate reset SQL',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
