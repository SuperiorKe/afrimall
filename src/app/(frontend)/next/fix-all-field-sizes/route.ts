import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

export async function POST(req: NextRequest) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    await client.connect()
    console.log('🔗 Connected to database for field size fixes')

    const alterStatements = [
      // Users table - fix all authentication fields
      `ALTER TABLE users ALTER COLUMN name TYPE TEXT`,
      `ALTER TABLE users ALTER COLUMN email TYPE TEXT`,
      `ALTER TABLE users ALTER COLUMN hash TYPE TEXT`,
      `ALTER TABLE users ALTER COLUMN salt TYPE TEXT`,
      `ALTER TABLE users ALTER COLUMN reset_password_token TYPE TEXT`,
      `ALTER TABLE users ALTER COLUMN role TYPE TEXT`,
      
      // Categories table
      `ALTER TABLE categories ALTER COLUMN title TYPE TEXT`,
      `ALTER TABLE categories ALTER COLUMN slug TYPE TEXT`,
      `ALTER TABLE categories ALTER COLUMN description TYPE TEXT`,
      `ALTER TABLE categories ALTER COLUMN status TYPE TEXT`,
      `ALTER TABLE categories ALTER COLUMN seo_title TYPE TEXT`,
      `ALTER TABLE categories ALTER COLUMN seo_description TYPE TEXT`,
      `ALTER TABLE categories ALTER COLUMN seo_keywords TYPE TEXT`,
      
      // Products table
      `ALTER TABLE products ALTER COLUMN title TYPE TEXT`,
      `ALTER TABLE products ALTER COLUMN slug TYPE TEXT`,
      `ALTER TABLE products ALTER COLUMN description TYPE TEXT`,
      `ALTER TABLE products ALTER COLUMN full_description TYPE TEXT`,
      `ALTER TABLE products ALTER COLUMN sku TYPE TEXT`,
      `ALTER TABLE products ALTER COLUMN status TYPE TEXT`,
      `ALTER TABLE products ALTER COLUMN seo_title TYPE TEXT`,
      `ALTER TABLE products ALTER COLUMN seo_description TYPE TEXT`,
      `ALTER TABLE products ALTER COLUMN seo_keywords TYPE TEXT`,
      
      // Media table
      `ALTER TABLE media ALTER COLUMN alt TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN filename TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN mime_type TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN url TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN thumbnail_u_r_l TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN caption TYPE TEXT`,
      
      // Media size variants
      `ALTER TABLE media ALTER COLUMN sizes_thumbnail_url TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN sizes_thumbnail_mime_type TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN sizes_thumbnail_filename TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN sizes_square_url TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN sizes_square_mime_type TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN sizes_square_filename TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN sizes_small_url TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN sizes_small_mime_type TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN sizes_small_filename TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN sizes_medium_url TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN sizes_medium_mime_type TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN sizes_medium_filename TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN sizes_large_url TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN sizes_large_mime_type TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN sizes_large_filename TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN sizes_xlarge_url TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN sizes_xlarge_mime_type TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN sizes_xlarge_filename TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN sizes_og_url TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN sizes_og_mime_type TYPE TEXT`,
      `ALTER TABLE media ALTER COLUMN sizes_og_filename TYPE TEXT`,
      
      // Relationship tables
      `ALTER TABLE categories_breadcrumbs ALTER COLUMN url TYPE TEXT`,
      `ALTER TABLE categories_breadcrumbs ALTER COLUMN label TYPE TEXT`,
      `ALTER TABLE products_images ALTER COLUMN alt TYPE TEXT`,
      `ALTER TABLE products_tags ALTER COLUMN tag TYPE TEXT`,
    ]

    const results = []
    let successCount = 0
    let errorCount = 0

    for (const statement of alterStatements) {
      try {
        await client.query(statement)
        console.log(`✅ Success: ${statement}`)
        results.push({ statement, success: true })
        successCount++
      } catch (error: any) {
        console.log(`❌ Error: ${statement} - ${error.message}`)
        results.push({ 
          statement, 
          success: false, 
          error: error.message 
        })
        errorCount++
      }
    }

    await client.end()

    return NextResponse.json({
      success: errorCount === 0,
      message: `Field size fixes completed: ${successCount} successful, ${errorCount} errors`,
      summary: {
        totalStatements: alterStatements.length,
        successful: successCount,
        errors: errorCount
      },
      results: results.slice(0, 10), // Show first 10 results
      note: 'All VARCHAR fields have been converted to TEXT to remove length constraints'
    })

  } catch (error: any) {
    console.error('❌ Field size fix error:', error)
    await client.end()
    return NextResponse.json({
      success: false,
      message: 'Field size fix failed',
      error: error.message
    }, { status: 500 })
  }
}
