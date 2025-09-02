import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // Create all tables with TEXT fields from the start to avoid VARCHAR limitations
    const createTableSQL = `
      -- Drop existing tables if they exist
      DROP TABLE IF EXISTS "users_sessions" CASCADE;
      DROP TABLE IF EXISTS "categories_breadcrumbs" CASCADE;
      DROP TABLE IF EXISTS "products_images" CASCADE;
      DROP TABLE IF EXISTS "products_tags" CASCADE;
      DROP TABLE IF EXISTS "products_rels" CASCADE;
      DROP TABLE IF EXISTS "users" CASCADE;
      DROP TABLE IF EXISTS "categories" CASCADE;
      DROP TABLE IF EXISTS "products" CASCADE;
      DROP TABLE IF EXISTS "media" CASCADE;

      -- Create users table with TEXT fields
      CREATE TABLE "users" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT,
        "email" TEXT UNIQUE,
        "hash" TEXT,
        "salt" TEXT,
        "reset_password_token" TEXT,
        "reset_password_expiration" TIMESTAMP,
        "login_attempts" INTEGER DEFAULT 0,
        "lock_until" TIMESTAMP,
        "role" TEXT DEFAULT 'user',
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create users_sessions table
      CREATE TABLE "users_sessions" (
        "id" TEXT PRIMARY KEY,
        "_parent_id" TEXT REFERENCES "users"("id") ON DELETE CASCADE,
        "_order" INTEGER,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "expires_at" TIMESTAMP
      );

      -- Create categories table with TEXT fields
      CREATE TABLE "categories" (
        "id" TEXT PRIMARY KEY,
        "title" TEXT,
        "slug" TEXT UNIQUE,
        "slug_lock" BOOLEAN DEFAULT FALSE,
        "description" TEXT,
        "parent_id" TEXT REFERENCES "categories"("id") ON DELETE SET NULL,
        "image_id" TEXT,
        "status" TEXT DEFAULT 'draft',
        "featured" BOOLEAN DEFAULT FALSE,
        "sort_order" INTEGER DEFAULT 0,
        "breadcrumb_path" TEXT,
        "seo_title" TEXT,
        "seo_description" TEXT,
        "seo_keywords" TEXT,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create categories_breadcrumbs table
      CREATE TABLE "categories_breadcrumbs" (
        "id" TEXT PRIMARY KEY,
        "_parent_id" TEXT REFERENCES "categories"("id") ON DELETE CASCADE,
        "_order" INTEGER,
        "doc_id" TEXT,
        "url" TEXT,
        "label" TEXT
      );

      -- Create products table with TEXT fields
      CREATE TABLE "products" (
        "id" TEXT PRIMARY KEY,
        "title" TEXT,
        "slug" TEXT UNIQUE,
        "slug_lock" BOOLEAN DEFAULT FALSE,
        "description" TEXT,
        "full_description" TEXT,
        "price" DECIMAL(10,2),
        "compare_at_price" DECIMAL(10,2),
        "sku" TEXT,
        "inventory_track_quantity" BOOLEAN DEFAULT FALSE,
        "inventory_quantity" INTEGER DEFAULT 0,
        "inventory_allow_backorder" BOOLEAN DEFAULT FALSE,
        "inventory_low_stock_threshold" INTEGER DEFAULT 0,
        "status" TEXT DEFAULT 'draft',
        "featured" BOOLEAN DEFAULT FALSE,
        "weight" DECIMAL(8,2),
        "dimensions_length" DECIMAL(8,2),
        "dimensions_width" DECIMAL(8,2),
        "dimensions_height" DECIMAL(8,2),
        "seo_title" TEXT,
        "seo_description" TEXT,
        "seo_keywords" TEXT,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create products_images table
      CREATE TABLE "products_images" (
        "id" TEXT PRIMARY KEY,
        "_parent_id" TEXT REFERENCES "products"("id") ON DELETE CASCADE,
        "_order" INTEGER,
        "image_id" TEXT,
        "alt" TEXT
      );

      -- Create products_tags table
      CREATE TABLE "products_tags" (
        "id" TEXT PRIMARY KEY,
        "_parent_id" TEXT REFERENCES "products"("id") ON DELETE CASCADE,
        "_order" INTEGER,
        "tag" TEXT
      );

      -- Create products_rels table
      CREATE TABLE "products_rels" (
        "id" TEXT PRIMARY KEY,
        "parent_id" TEXT REFERENCES "products"("id") ON DELETE CASCADE,
        "order" INTEGER,
        "path" TEXT,
        "categories_id" TEXT REFERENCES "categories"("id") ON DELETE CASCADE
      );

      -- Create media table with TEXT fields
      CREATE TABLE "media" (
        "id" TEXT PRIMARY KEY,
        "alt" TEXT,
        "caption" TEXT,
        "url" TEXT,
        "thumbnail_u_r_l" TEXT,
        "filename" TEXT,
        "mime_type" TEXT,
        "filesize" INTEGER,
        "width" INTEGER,
        "height" INTEGER,
        "focal_x" DECIMAL(5,2),
        "focal_y" DECIMAL(5,2),
        "sizes_thumbnail_url" TEXT,
        "sizes_thumbnail_width" INTEGER,
        "sizes_thumbnail_height" INTEGER,
        "sizes_thumbnail_mime_type" TEXT,
        "sizes_thumbnail_filesize" INTEGER,
        "sizes_thumbnail_filename" TEXT,
        "sizes_square_url" TEXT,
        "sizes_square_width" INTEGER,
        "sizes_square_height" INTEGER,
        "sizes_square_mime_type" TEXT,
        "sizes_square_filesize" INTEGER,
        "sizes_square_filename" TEXT,
        "sizes_small_url" TEXT,
        "sizes_small_width" INTEGER,
        "sizes_small_height" INTEGER,
        "sizes_small_mime_type" TEXT,
        "sizes_small_filesize" INTEGER,
        "sizes_small_filename" TEXT,
        "sizes_medium_url" TEXT,
        "sizes_medium_width" INTEGER,
        "sizes_medium_height" INTEGER,
        "sizes_medium_mime_type" TEXT,
        "sizes_medium_filesize" INTEGER,
        "sizes_medium_filename" TEXT,
        "sizes_large_url" TEXT,
        "sizes_large_width" INTEGER,
        "sizes_large_height" INTEGER,
        "sizes_large_mime_type" TEXT,
        "sizes_large_filesize" INTEGER,
        "sizes_large_filename" TEXT,
        "sizes_xlarge_url" TEXT,
        "sizes_xlarge_width" INTEGER,
        "sizes_xlarge_height" INTEGER,
        "sizes_xlarge_mime_type" TEXT,
        "sizes_xlarge_filesize" INTEGER,
        "sizes_xlarge_filename" TEXT,
        "sizes_og_url" TEXT,
        "sizes_og_width" INTEGER,
        "sizes_og_height" INTEGER,
        "sizes_og_mime_type" TEXT,
        "sizes_og_filesize" INTEGER,
        "sizes_og_filename" TEXT,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
    
    return NextResponse.json({
      success: true,
      message: 'Complete schema creation SQL with TEXT fields generated',
      instructions: {
        problem: 'Some tables are missing or have VARCHAR field size limitations',
        solution: 'Create all tables with TEXT fields from the start',
        steps: [
          '1. Open pgAdmin and connect to your RDS database',
          '2. Open the Query Tool (SQL Editor)',
          '3. Copy and paste the SQL commands below',
          '4. Execute all commands',
          '5. Test the admin login and create admin user'
        ],
        note: 'This will create all tables with TEXT fields, avoiding VARCHAR size limitations'
      },
      sqlCommands: createTableSQL,
      summary: {
        tablesToCreate: ['users', 'users_sessions', 'categories', 'categories_breadcrumbs', 'products', 'products_images', 'products_tags', 'products_rels', 'media'],
        fieldType: 'All text fields use TEXT type (no size limits)',
        relationships: 'All foreign key relationships properly defined'
      }
    })
  } catch (error: any) {
    console.error('Error generating schema creation SQL:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate schema creation SQL',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
