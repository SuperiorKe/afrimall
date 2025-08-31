import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

export async function POST(request: NextRequest) {
  let client: Client | null = null
  
  try {
    console.log('🔧 Fixing database field size constraints...')
    
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
    
    const results: any = {}
    
    // Fix categories table field sizes
    console.log('📂 Fixing categories table field sizes...')
    try {
      // Increase field sizes for better compatibility
      await client.query(`
        ALTER TABLE categories 
        ALTER COLUMN title TYPE VARCHAR(500),
        ALTER COLUMN slug TYPE VARCHAR(500),
        ALTER COLUMN seo_title TYPE VARCHAR(500),
        ALTER COLUMN seo_description TYPE TEXT,
        ALTER COLUMN seo_keywords TYPE TEXT
      `)
      
      results.categories = { success: true, message: 'Categories table field sizes fixed successfully' }
      console.log('✅ Categories table field sizes fixed successfully')
      
    } catch (error: any) {
      results.categories = { success: false, error: error.message }
      console.log('❌ Failed to fix categories table field sizes:', error.message)
    }
    
    // Fix products table field sizes
    console.log('🛍️ Fixing products table field sizes...')
    try {
      // Increase field sizes for better compatibility
      await client.query(`
        ALTER TABLE products 
        ALTER COLUMN title TYPE VARCHAR(500),
        ALTER COLUMN slug TYPE VARCHAR(500),
        ALTER COLUMN sku TYPE VARCHAR(500),
        ALTER COLUMN seo_title TYPE VARCHAR(500),
        ALTER COLUMN seo_description TYPE TEXT,
        ALTER COLUMN seo_keywords TYPE TEXT
      `)
      
      results.products = { success: true, message: 'Products table field sizes fixed successfully' }
      console.log('✅ Products table field sizes fixed successfully')
      
    } catch (error: any) {
      results.products = { success: false, error: error.message }
      console.log('❌ Failed to fix products table field sizes:', error.message)
    }
    
    // Fix media table field sizes
    console.log('🌍 Fixing media table field sizes...')
    try {
      // Increase field sizes for better compatibility
      await client.query(`
        ALTER TABLE media 
        ALTER COLUMN alt TYPE VARCHAR(500),
        ALTER COLUMN filename TYPE VARCHAR(500),
        ALTER COLUMN mime_type TYPE VARCHAR(200),
        ALTER COLUMN url TYPE TEXT,
        ALTER COLUMN thumbnail_u_r_l TYPE TEXT
      `)
      
      results.media = { success: true, message: 'Media table field sizes fixed successfully' }
      console.log('✅ Media table field sizes fixed successfully')
      
    } catch (error: any) {
      results.media = { success: false, error: error.message }
      console.log('❌ Failed to fix media table field sizes:', error.message)
    }
    
    // Fix users table field sizes
    console.log('👤 Fixing users table field sizes...')
    try {
      // Increase field sizes for better compatibility
      await client.query(`
        ALTER TABLE users 
        ALTER COLUMN name TYPE VARCHAR(500),
        ALTER COLUMN email TYPE VARCHAR(500),
        ALTER COLUMN role TYPE VARCHAR(100),
        ALTER COLUMN reset_password_token TYPE VARCHAR(500)
      `)
      
      results.users = { success: true, message: 'Users table field sizes fixed successfully' }
      console.log('✅ Users table field sizes fixed successfully')
      
    } catch (error: any) {
      results.users = { success: false, error: error.message }
      console.log('❌ Failed to fix users table field sizes:', error.message)
    }
    
    // Fix relationship table field sizes
    console.log('🔗 Fixing relationship table field sizes...')
    try {
      // Increase field sizes for better compatibility
      await client.query(`
        ALTER TABLE categories_breadcrumbs 
        ALTER COLUMN url TYPE VARCHAR(500),
        ALTER COLUMN label TYPE VARCHAR(500)
      `)
      
      await client.query(`
        ALTER TABLE products_images 
        ALTER COLUMN alt TYPE VARCHAR(500)
      `)
      
      await client.query(`
        ALTER TABLE products_tags 
        ALTER COLUMN tag TYPE VARCHAR(500)
      `)
      
      await client.query(`
        ALTER TABLE products_rels 
        ALTER COLUMN path TYPE VARCHAR(500)
      `)
      
      results.relationships = { success: true, message: 'Relationship table field sizes fixed successfully' }
      console.log('✅ Relationship table field sizes fixed successfully')
      
    } catch (error: any) {
      results.relationships = { success: false, error: error.message }
      console.log('❌ Failed to fix relationship table field sizes:', error.message)
    }
    
    const successfulFixes = Object.values(results).filter((result: any) => result.success)
    const failedFixes = Object.values(results).filter((result: any) => !result.success)
    
    console.log('📊 Field Size Fix Summary:')
    console.log(`✅ Successfully fixed: ${successfulFixes.length} table sets`)
    console.log(`❌ Failed to fix: ${failedFixes.length} table sets`)
    
    if (failedFixes.length === 0) {
      console.log('🎉 Database field size fixes completed successfully!')
      return NextResponse.json({
        success: true,
        message: 'Database field size fixes completed successfully! All fields now have appropriate sizes.',
        results,
        summary: {
          totalTableSets: Object.keys(results).length,
          successfulFixes: successfulFixes.length,
          failedFixes: failedFixes.length
        }
      })
    } else {
      console.log('⚠️ Field size fixes partially failed')
      return NextResponse.json({
        success: false,
        message: 'Field size fixes partially failed - some tables could not be fixed',
        results,
        summary: {
          totalTableSets: Object.keys(results).length,
          successfulFixes: successfulFixes.length,
          failedFixes: failedFixes.length
        },
        error: 'Some tables failed to fix - check the results for details'
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('❌ Field size fixes failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Field size fixes failed',
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
