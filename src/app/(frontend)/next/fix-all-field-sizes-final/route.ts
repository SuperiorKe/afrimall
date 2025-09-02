import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // Since we can't access raw SQL through Payload's adapter,
    // we'll provide the exact SQL commands needed to fix all field sizes
    
    const sqlCommands = [
      // Users table - convert all VARCHAR fields to TEXT
      `ALTER TABLE "users" ALTER COLUMN "name" TYPE TEXT;`,
      `ALTER TABLE "users" ALTER COLUMN "email" TYPE TEXT;`,
      `ALTER TABLE "users" ALTER COLUMN "hash" TYPE TEXT;`,
      `ALTER TABLE "users" ALTER COLUMN "salt" TYPE TEXT;`,
      `ALTER TABLE "users" ALTER COLUMN "reset_password_token" TYPE TEXT;`,
      
      // Categories table - convert all VARCHAR fields to TEXT
      `ALTER TABLE "categories" ALTER COLUMN "title" TYPE TEXT;`,
      `ALTER TABLE "categories" ALTER COLUMN "slug" TYPE TEXT;`,
      `ALTER TABLE "categories" ALTER COLUMN "description" TYPE TEXT;`,
      `ALTER TABLE "categories" ALTER COLUMN "seo_title" TYPE TEXT;`,
      `ALTER TABLE "categories" ALTER COLUMN "seo_description" TYPE TEXT;`,
      `ALTER TABLE "categories" ALTER COLUMN "seo_keywords" TYPE TEXT;`,
      
      // Products table - convert all VARCHAR fields to TEXT
      `ALTER TABLE "products" ALTER COLUMN "title" TYPE TEXT;`,
      `ALTER TABLE "products" ALTER COLUMN "slug" TYPE TEXT;`,
      `ALTER TABLE "products" ALTER COLUMN "description" TYPE TEXT;`,
      `ALTER TABLE "products" ALTER COLUMN "full_description" TYPE TEXT;`,
      `ALTER TABLE "products" ALTER COLUMN "sku" TYPE TEXT;`,
      `ALTER TABLE "products" ALTER COLUMN "seo_title" TYPE TEXT;`,
      `ALTER TABLE "products" ALTER COLUMN "seo_description" TYPE TEXT;`,
      `ALTER TABLE "products" ALTER COLUMN "seo_keywords" TYPE TEXT;`,
      
      // Media table - convert all VARCHAR fields to TEXT
      `ALTER TABLE "media" ALTER COLUMN "alt" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "caption" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "url" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "thumbnail_u_r_l" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "filename" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "mime_type" TYPE TEXT;`,
      
      // Media size variants - convert all VARCHAR fields to TEXT
      `ALTER TABLE "media" ALTER COLUMN "sizes_thumbnail_url" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "sizes_thumbnail_mime_type" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "sizes_thumbnail_filename" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "sizes_square_url" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "sizes_square_mime_type" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "sizes_square_filename" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "sizes_small_url" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "sizes_small_mime_type" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "sizes_small_filename" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "sizes_medium_url" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "sizes_medium_mime_type" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "sizes_medium_filename" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "sizes_large_url" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "sizes_large_mime_type" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "sizes_large_filename" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "sizes_xlarge_url" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "sizes_xlarge_mime_type" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "sizes_xlarge_filename" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "sizes_og_url" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "sizes_og_mime_type" TYPE TEXT;`,
      `ALTER TABLE "media" ALTER COLUMN "sizes_og_filename" TYPE TEXT;`,
      
      // Relationship tables - convert VARCHAR fields to TEXT
      `ALTER TABLE "categories_breadcrumbs" ALTER COLUMN "url" TYPE TEXT;`,
      `ALTER TABLE "categories_breadcrumbs" ALTER COLUMN "label" TYPE TEXT;`,
      `ALTER TABLE "products_images" ALTER COLUMN "alt" TYPE TEXT;`,
      `ALTER TABLE "products_tags" ALTER COLUMN "tag" TYPE TEXT;`,
    ]
    
    return NextResponse.json({
      success: true,
      message: 'Field size fix commands generated. Execute these SQL commands in pgAdmin.',
      instructions: {
        problem: 'Payload CMS recreated tables with VARCHAR(500) field size limits, causing "value too long" errors',
        solution: 'Convert all VARCHAR fields to TEXT to remove size limitations',
        steps: [
          '1. Open pgAdmin and connect to your RDS database',
          '2. Open the Query Tool (SQL Editor)',
          '3. Copy and paste the SQL commands below',
          '4. Execute all commands',
          '5. Test the admin login again'
        ],
        note: 'These commands will convert all VARCHAR fields to TEXT, removing the 500-character limit'
      },
      sqlCommands,
      summary: {
        totalCommands: sqlCommands.length,
        tablesAffected: ['users', 'categories', 'products', 'media', 'categories_breadcrumbs', 'products_images', 'products_tags'],
        fieldsToConvert: 'All VARCHAR fields will be converted to TEXT'
      }
    })
  } catch (error: any) {
    console.error('Error generating field size fix commands:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate field size fix commands',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
