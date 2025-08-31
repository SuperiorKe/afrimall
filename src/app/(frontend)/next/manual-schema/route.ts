import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

export async function POST(request: NextRequest) {
  let client: Client | null = null
  
  try {
    console.log('🔧 Starting manual database schema creation...')
    
    // Get database connection string from environment
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URI
    
    if (!databaseUrl) {
      return NextResponse.json({
        success: false,
        error: 'No database connection string found'
      }, { status: 500 })
    }
    
    console.log('📡 Connecting to database for manual schema creation...')
    
    // Create PostgreSQL client
    client = new Client({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    })
    
    // Connect to database
    await client.connect()
    console.log('✅ Database connection successful')
    
    const results: any = {}
    
    // Create users table
    console.log('👤 Creating users table...')
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'user',
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP,
          reset_password_token VARCHAR(255),
          reset_password_expiration TIMESTAMP,
          salt VARCHAR(255),
          hash VARCHAR(255),
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
      
      results.users = { success: true, message: 'Users table and sessions table created successfully' }
      console.log('✅ Users table created successfully')
      
    } catch (error: any) {
      results.users = { success: false, error: error.message }
      console.log('❌ Failed to create users table:', error.message)
    }
    
    // Create categories table
    console.log('📂 Creating categories table...')
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          parent INTEGER REFERENCES categories(id),
          image INTEGER,
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
      
      results.categories = { success: true, message: 'Categories table created successfully' }
      console.log('✅ Categories table created successfully')
      
    } catch (error: any) {
      results.categories = { success: false, error: error.message }
      console.log('❌ Failed to create categories table:', error.message)
    }
    
    // Create products table
    console.log('🛍️ Creating products table...')
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
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
          sort_order INTEGER DEFAULT 0,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP
        )
      `)
      
      // Create product_categories junction table
      await client.query(`
        CREATE TABLE IF NOT EXISTS product_categories (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
          UNIQUE(product_id, category_id)
        )
      `)
      
      results.products = { success: true, message: 'Products table and categories junction table created successfully' }
      console.log('✅ Products table created successfully')
      
    } catch (error: any) {
      results.products = { success: false, error: error.message }
      console.log('❌ Failed to create products table:', error.message)
    }
    
    // Create media table
    console.log('🌍 Creating media table...')
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS media (
          id SERIAL PRIMARY KEY,
          alt VARCHAR(255),
          filename VARCHAR(255),
          mime_type VARCHAR(100),
          filesize INTEGER,
          width INTEGER,
          height INTEGER,
          url TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP
        )
      `)
      
      results.media = { success: true, message: 'Media table created successfully' }
      console.log('✅ Media table created successfully')
      
    } catch (error: any) {
      results.media = { success: false, error: error.message }
      console.log('❌ Failed to create media table:', error.message)
    }
    
    // Check overall success
    const successfulTables = Object.values(results).filter((result: any) => result.success)
    const failedTables = Object.values(results).filter((result: any) => !result.success)
    
    console.log('📊 Manual Schema Creation Summary:')
    console.log(`✅ Successfully created: ${successfulTables.length} table sets`)
    console.log(`❌ Failed to create: ${failedTables.length} table sets`)
    
    if (failedTables.length === 0) {
      console.log('🎉 Manual database schema creation completed successfully!')
      return NextResponse.json({
        success: true,
        message: 'Manual database schema creation completed successfully! All tables now exist.',
        results,
        summary: {
          totalTableSets: Object.keys(results).length,
          successfulTableSets: successfulTables.length,
          failedTableSets: failedTables.length
        }
      })
    } else {
      console.log('⚠️ Manual database schema creation partially failed')
      return NextResponse.json({
        success: false,
        message: 'Manual database schema creation partially failed - some tables could not be created',
        results,
        summary: {
          totalTableSets: Object.keys(results).length,
          successfulTableSets: successfulTables.length,
          failedTableSets: failedTables.length
        },
        error: 'Some tables failed to create - check the results for details'
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('❌ Manual database schema creation failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Manual database schema creation failed',
        details: 'Check server logs for more information'
      },
      { status: 500 }
    )
  } finally {
    // Always close the connection
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
