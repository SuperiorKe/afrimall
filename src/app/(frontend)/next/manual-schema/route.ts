import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

export async function POST(request: NextRequest) {
  let client: Client | null = null

  try {
    console.log('🔧 Starting complete Payload CMS database schema creation...')

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

    console.log('📡 Connecting to database for complete schema creation...')

    client = new Client({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
    })

    await client.connect()
    console.log('✅ Database connection successful')

    const results: any = {}

    // Create users table with all Payload fields
    console.log('👤 Creating complete users table...')
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(500) NOT NULL,
          email VARCHAR(500) UNIQUE NOT NULL,
          role VARCHAR(100) NOT NULL DEFAULT 'admin',
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP,
          reset_password_token VARCHAR(500),
          reset_password_expiration TIMESTAMP,
          salt VARCHAR(500),
          hash VARCHAR(500),
          login_attempts INTEGER DEFAULT 0,
          lock_until TIMESTAMP
        )
      `)

      // Create users_sessions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users_sessions (
          id SERIAL PRIMARY KEY,
          _parent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          _order INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP NOT NULL,
          data JSONB
        )
      `)

      results.users = {
        success: true,
        message: 'Complete users table and sessions table created successfully',
      }
      console.log('✅ Complete users table created successfully')
    } catch (error: any) {
      results.users = { success: false, error: error.message }
      console.log('❌ Failed to create users table:', error.message)
    }

    // Create categories table with all Payload fields
    console.log('📂 Creating complete categories table...')
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          slug_lock BOOLEAN DEFAULT false,
          description TEXT,
          parent_id INTEGER REFERENCES categories(id),
          image_id INTEGER,
          status VARCHAR(50) DEFAULT 'active',
          featured BOOLEAN DEFAULT false,
          sort_order INTEGER DEFAULT 0,
          breadcrumb_path TEXT,
          seo_title VARCHAR(255),
          seo_description TEXT,
          seo_keywords TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP
        )
      `)

      // Create categories_breadcrumbs relationship table
      await client.query(`
        CREATE TABLE IF NOT EXISTS categories_breadcrumbs (
          id SERIAL PRIMARY KEY,
          _parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
          _order INTEGER DEFAULT 0,
          doc_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
          url VARCHAR(255),
          label VARCHAR(255)
        )
      `)

      results.categories = {
        success: true,
        message: 'Complete categories table and breadcrumbs table created successfully',
      }
      console.log('✅ Complete categories table created successfully')
    } catch (error: any) {
      results.categories = { success: false, error: error.message }
      console.log('❌ Failed to create categories table:', error.message)
    }

    // Create products table with all Payload fields
    console.log('🛍️ Creating complete products table...')
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          slug_lock BOOLEAN DEFAULT false,
          description TEXT NOT NULL,
          full_description JSONB,
          price DECIMAL(10,2) NOT NULL,
          compare_at_price DECIMAL(10,2),
          sku VARCHAR(255) UNIQUE NOT NULL,
          inventory_track_quantity BOOLEAN DEFAULT true,
          inventory_quantity INTEGER DEFAULT 0,
          inventory_allow_backorder BOOLEAN DEFAULT false,
          inventory_low_stock_threshold INTEGER DEFAULT 5,
          status VARCHAR(50) DEFAULT 'active',
          featured BOOLEAN DEFAULT false,
          weight DECIMAL(8,2),
          dimensions_length DECIMAL(8,2),
          dimensions_width DECIMAL(8,2),
          dimensions_height DECIMAL(8,2),
          seo_title VARCHAR(255),
          seo_description TEXT,
          seo_keywords TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP
        )
      `)

      // Create products_images relationship table
      await client.query(`
        CREATE TABLE IF NOT EXISTS products_images (
          id SERIAL PRIMARY KEY,
          _parent_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          _order INTEGER DEFAULT 0,
          image_id INTEGER,
          alt VARCHAR(255)
        )
      `)

      // Create products_tags relationship table
      await client.query(`
        CREATE TABLE IF NOT EXISTS products_tags (
          id SERIAL PRIMARY KEY,
          _parent_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          _order INTEGER DEFAULT 0,
          tag VARCHAR(255)
        )
      `)

      // Create products_rels relationship table for categories
      await client.query(`
        CREATE TABLE IF NOT EXISTS products_rels (
          id SERIAL PRIMARY KEY,
          parent_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          order_index INTEGER DEFAULT 0,
          path VARCHAR(255),
          categories_id INTEGER REFERENCES categories(id) ON DELETE CASCADE
        )
      `)

      results.products = {
        success: true,
        message: 'Complete products table and all relationship tables created successfully',
      }
      console.log('✅ Complete products table created successfully')
    } catch (error: any) {
      results.products = { success: false, error: error.message }
      console.log('❌ Failed to create products table:', error.message)
    }

    // Create media table with all Payload fields
    console.log('🌍 Creating complete media table...')
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS media (
          id SERIAL PRIMARY KEY,
          alt VARCHAR(255),
          caption TEXT,
          filename VARCHAR(255),
          mime_type VARCHAR(100),
          filesize INTEGER,
          width INTEGER,
          height INTEGER,
          focal_x DECIMAL(5,2),
          focal_y DECIMAL(5,2),
          url TEXT,
          thumbnail_u_r_l TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP
        )
      `)

      // Create media size variants tables
      await client.query(`
        ALTER TABLE media ADD COLUMN IF NOT EXISTS sizes_thumbnail_url TEXT,
        ADD COLUMN IF NOT EXISTS sizes_thumbnail_width INTEGER,
        ADD COLUMN IF NOT EXISTS sizes_thumbnail_height INTEGER,
        ADD COLUMN IF NOT EXISTS sizes_thumbnail_mime_type VARCHAR(100),
        ADD COLUMN IF NOT EXISTS sizes_thumbnail_filesize INTEGER,
        ADD COLUMN IF NOT EXISTS sizes_thumbnail_filename VARCHAR(255),
        ADD COLUMN IF NOT EXISTS sizes_square_url TEXT,
        ADD COLUMN IF NOT EXISTS sizes_square_width INTEGER,
        ADD COLUMN IF NOT EXISTS sizes_square_height INTEGER,
        ADD COLUMN IF NOT EXISTS sizes_square_mime_type VARCHAR(100),
        ADD COLUMN IF NOT EXISTS sizes_square_filesize INTEGER,
        ADD COLUMN IF NOT EXISTS sizes_square_filename VARCHAR(255),
        ADD COLUMN IF NOT EXISTS sizes_small_url TEXT,
        ADD COLUMN IF NOT EXISTS sizes_small_width INTEGER,
        ADD COLUMN IF NOT EXISTS sizes_small_height INTEGER,
        ADD COLUMN IF NOT EXISTS sizes_small_mime_type VARCHAR(100),
        ADD COLUMN IF NOT EXISTS sizes_small_filesize INTEGER,
        ADD COLUMN IF NOT EXISTS sizes_small_filename VARCHAR(255),
        ADD COLUMN IF NOT EXISTS sizes_medium_url TEXT,
        ADD COLUMN IF NOT EXISTS sizes_medium_width INTEGER,
        ADD COLUMN IF NOT EXISTS sizes_medium_height INTEGER,
        ADD COLUMN IF NOT EXISTS sizes_medium_mime_type VARCHAR(100),
        ADD COLUMN IF NOT EXISTS sizes_medium_filesize INTEGER,
        ADD COLUMN IF NOT EXISTS sizes_medium_filename VARCHAR(255),
        ADD COLUMN IF NOT EXISTS sizes_large_url TEXT,
        ADD COLUMN IF NOT EXISTS sizes_large_width INTEGER,
        ADD COLUMN IF NOT EXISTS sizes_large_height INTEGER,
        ADD COLUMN IF NOT EXISTS sizes_large_mime_type VARCHAR(100),
        ADD COLUMN IF NOT EXISTS sizes_large_filesize INTEGER,
        ADD COLUMN IF NOT EXISTS sizes_large_filename VARCHAR(255),
        ADD COLUMN IF NOT EXISTS sizes_xlarge_url TEXT,
        ADD COLUMN IF NOT EXISTS sizes_xlarge_width INTEGER,
        ADD COLUMN IF NOT EXISTS sizes_xlarge_height INTEGER,
        ADD COLUMN IF NOT EXISTS sizes_xlarge_mime_type VARCHAR(100),
        ADD COLUMN IF NOT EXISTS sizes_xlarge_filesize INTEGER,
        ADD COLUMN IF NOT EXISTS sizes_xlarge_filename VARCHAR(255),
        ADD COLUMN IF NOT EXISTS sizes_og_url TEXT,
        ADD COLUMN IF NOT EXISTS sizes_og_width INTEGER,
        ADD COLUMN IF NOT EXISTS sizes_og_height INTEGER,
        ADD COLUMN IF NOT EXISTS sizes_og_mime_type VARCHAR(100),
        ADD COLUMN IF NOT EXISTS sizes_og_filesize INTEGER,
        ADD COLUMN IF NOT EXISTS sizes_og_filename VARCHAR(255)
      `)

      results.media = {
        success: true,
        message: 'Complete media table with all size variants created successfully',
      }
      console.log('✅ Complete media table created successfully')
    } catch (error: any) {
      results.media = { success: false, error: error.message }
      console.log('❌ Failed to create media table:', error.message)
    }

    // Create product_categories junction table
    console.log('🔗 Creating product_categories junction table...')
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS product_categories (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
          UNIQUE(product_id, category_id)
        )
      `)

      results.product_categories = {
        success: true,
        message: 'Product-categories junction table created successfully',
      }
      console.log('✅ Product-categories junction table created successfully')
    } catch (error: any) {
      results.product_categories = { success: false, error: error.message }
      console.log('❌ Failed to create product_categories table:', error.message)
    }

    const successfulTables = Object.values(results).filter((result: any) => result.success)
    const failedTables = Object.values(results).filter((result: any) => !result.success)

    console.log('📊 Complete Schema Creation Summary:')
    console.log(`✅ Successfully created: ${successfulTables.length} table sets`)
    console.log(`❌ Failed to create: ${failedTables.length} table sets`)

    if (failedTables.length === 0) {
      console.log('🎉 Complete Payload CMS database schema creation completed successfully!')
      return NextResponse.json({
        success: true,
        message:
          'Complete Payload CMS database schema creation completed successfully! All tables now exist with full field support.',
        results,
        summary: {
          totalTableSets: Object.keys(results).length,
          successfulTableSets: successfulTables.length,
          failedTableSets: failedTables.length,
        },
      })
    } else {
      console.log('⚠️ Complete schema creation partially failed')
      return NextResponse.json(
        {
          success: false,
          message: 'Complete schema creation partially failed - some tables could not be created',
          results,
          summary: {
            totalTableSets: Object.keys(results).length,
            successfulTableSets: successfulTables.length,
            failedTableSets: failedTables.length,
          },
          error: 'Some tables failed to create - check the results for details',
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error('❌ Complete schema creation failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Complete schema creation failed',
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
