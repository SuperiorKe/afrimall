#!/usr/bin/env node

/**
 * Script to fix the users table schema in your PostgreSQL database
 * This resolves the "value too long for type character varying(255)" error
 */

const BASE_URL = process.env.BASE_URL || 'https://afrimall.vercel.app'

async function fixUsersSchema() {
  try {
    console.log('🔧 Fixing users table schema...')
    console.log(`📡 Calling endpoint: ${BASE_URL}/next/fix-users-schema`)
    
    const response = await fetch(`${BASE_URL}/next/fix-users-schema`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Schema fix successful!')
      console.log('📊 Updated schema:')
      result.schema.forEach((column: any) => {
        console.log(`  ${column.column_name}: ${column.data_type}${column.character_maximum_length ? `(${column.character_maximum_length})` : ''}`)
      })
    } else {
      console.error('❌ Schema fix failed:', result.error)
      if (result.details) {
        console.error('Details:', result.details)
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error.message)
  }
}

// Run the fix
fixUsersSchema()
