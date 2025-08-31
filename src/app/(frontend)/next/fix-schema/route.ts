import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

export async function POST(request: NextRequest) {
  let client: Client | null = null
  
  try {
    console.log('🔧 Fixing database schema to match Payload CMS expectations...')
    
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
    
    // Fix categories table
    console.log('📂 Fixing categories table...')
    try {
      // Add missing slug_lock field
      await client.query(`
        ALTER TABLE categories 
        ADD COLUMN IF NOT EXISTS slug_lock BOOLEAN DEFAULT false
      `)
      
      // Rename parent to parent_id
      await client.query(`
        ALTER TABLE categories 
        RENAME COLUMN parent TO parent_id
      `)
      
      // Rename image to image_id
      await client.query(`
        ALTER TABLE categories 
        RENAME COLUMN image TO image_id
      `)
      
      results.categories = { success: true, message: 'Categories table fixed successfully' }
      console.log('✅ Categories table fixed successfully')
      
    } catch (error: any) {
      results.categories = { success: false, error: error.message }
      console.log('❌ Failed to fix categories table:', error.message)
    }
    
    // Fix products table
    console.log('🛍️ Fixing products table...')
    try {
      // Add missing slug_lock field
      await client.query(`
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS slug_lock BOOLEAN DEFAULT false
      `)
      
      // Add missing weight and dimensions fields
      await client.query(`
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS weight DECIMAL(8,2),
        ADD COLUMN IF NOT EXISTS dimensions_length DECIMAL(8,2),
        ADD COLUMN IF NOT EXISTS dimensions_width DECIMAL(8,2),
        ADD COLUMN IF NOT EXISTS dimensions_height DECIMAL(8,2)
      `)
      
      // Add missing SEO fields
      await client.query(`
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255),
        ADD COLUMN IF NOT EXISTS seo_description TEXT,
        ADD COLUMN IF NOT EXISTS seo_keywords TEXT
      `)
      
      results.products = { success: true, message: 'Products table fixed successfully' }
      console.log('✅ Products table fixed successfully')
      
    } catch (error: any) {
      results.products = { success: false, error: error.message }
      console.log('❌ Failed to fix products table:', error.message)
    }
    
    // Fix media table
    console.log('🌍 Fixing media table...')
    try {
      // Add missing fields
      await client.query(`
        ALTER TABLE media 
        ADD COLUMN IF NOT EXISTS caption TEXT,
        ADD COLUMN IF NOT EXISTS focal_x DECIMAL(5,2),
        ADD COLUMN IF NOT EXISTS focal_y DECIMAL(5,2),
        ADD COLUMN IF NOT EXISTS thumbnail_u_r_l TEXT
      `)
      
      results.media = { success: true, message: 'Media table fixed successfully' }
      console.log('✅ Media table fixed successfully')
      
    } catch (error: any) {
      results.media = { success: false, error: error.message }
      console.log('❌ Failed to fix media table:', error.message)
    }
    
    // Fix products_rels table field names
    console.log('🔗 Fixing products_rels table...')
    try {
      // Rename order to order_index to match Payload expectations
      await client.query(`
        ALTER TABLE products_rels 
        RENAME COLUMN order_index TO "order"
      `)
      
      results.products_rels = { success: true, message: 'Products_rels table fixed successfully' }
      console.log('✅ Products_rels table fixed successfully')
      
    } catch (error: any) {
      results.products_rels = { success: false, error: error.message }
      console.log('❌ Failed to fix products_rels table:', error.message)
    }
    
    const successfulFixes = Object.values(results).filter((result: any) => result.success)
    const failedFixes = Object.values(results).filter((result: any) => !result.success)
    
    console.log('📊 Schema Fix Summary:')
    console.log(`✅ Successfully fixed: ${successfulFixes.length} tables`)
    console.log(`❌ Failed to fix: ${failedFixes.length} tables`)
    
    if (failedFixes.length === 0) {
      console.log('🎉 Database schema fixes completed successfully!')
      return NextResponse.json({
        success: true,
        message: 'Database schema fixes completed successfully! All tables now match Payload CMS expectations.',
        results,
        summary: {
          totalTables: Object.keys(results).length,
          successfulFixes: successfulFixes.length,
          failedFixes: failedFixes.length
        }
      })
    } else {
      console.log('⚠️ Schema fixes partially failed')
      return NextResponse.json({
        success: false,
        message: 'Schema fixes partially failed - some tables could not be fixed',
        results,
        summary: {
          totalTables: Object.keys(results).length,
          successfulFixes: successfulFixes.length,
          failedFixes: failedFixes.length
        },
        error: 'Some tables failed to fix - check the results for details'
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('❌ Schema fixes failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Schema fixes failed',
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
