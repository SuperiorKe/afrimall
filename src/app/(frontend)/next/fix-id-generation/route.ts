import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // The issue is that our TEXT id fields don't have default UUID generation
    // We need to add UUID generation for all id fields
    const fixIdGenerationSQL = `
      -- Enable UUID extension if not already enabled
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
      -- Add UUID generation for users table
      ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();
      
      -- Add UUID generation for users_sessions table
      ALTER TABLE "users_sessions" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();
      
      -- Add UUID generation for categories table
      ALTER TABLE "categories" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();
      
      -- Add UUID generation for categories_breadcrumbs table
      ALTER TABLE "categories_breadcrumbs" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();
      
      -- Add UUID generation for products table
      ALTER TABLE "products" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();
      
      -- Add UUID generation for products_images table
      ALTER TABLE "products_images" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();
      
      -- Add UUID generation for products_tags table
      ALTER TABLE "products_tags" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();
      
      -- Add UUID generation for products_rels table
      ALTER TABLE "products_rels" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();
      
      -- Add UUID generation for media table
      ALTER TABLE "media" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();
    `
    
    return NextResponse.json({
      success: true,
      message: 'UUID generation fix SQL generated',
      instructions: {
        problem: 'ID fields are TEXT but don\'t have default UUID generation, causing null constraint violations',
        solution: 'Add UUID generation defaults to all ID fields',
        steps: [
          '1. Open pgAdmin and connect to your RDS database',
          '2. Open the Query Tool (SQL Editor)',
          '3. Copy and paste the SQL commands below',
          '4. Execute all commands',
          '5. Test admin login again'
        ],
        note: 'This will enable automatic UUID generation for all ID fields'
      },
      sqlCommands: fixIdGenerationSQL,
      summary: {
        tablesToFix: ['users', 'users_sessions', 'categories', 'categories_breadcrumbs', 'products', 'products_images', 'products_tags', 'products_rels', 'media'],
        fix: 'Add UUID generation defaults to all ID fields',
        extension: 'Enable uuid-ossp extension for UUID generation'
      }
    })
  } catch (error: any) {
    console.error('Error generating UUID fix SQL:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate UUID fix SQL',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
