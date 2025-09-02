import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // The issue is field naming - Payload CMS expects camelCase but our schema uses snake_case
    // We need to rename some fields to match Payload's expectations
    const fixFieldNamesSQL = `
      -- Fix field naming issues in users table
      -- Rename lock_until to lockUntil (camelCase)
      ALTER TABLE "users" RENAME COLUMN "lock_until" TO "lockUntil";
      
      -- Rename reset_password_token to resetPasswordToken
      ALTER TABLE "users" RENAME COLUMN "reset_password_token" TO "resetPasswordToken";
      
      -- Rename reset_password_expiration to resetPasswordExpiration
      ALTER TABLE "users" RENAME COLUMN "reset_password_expiration" TO "resetPasswordExpiration";
      
      -- Rename login_attempts to loginAttempts
      ALTER TABLE "users" RENAME COLUMN "login_attempts" TO "loginAttempts";
      
      -- Rename updated_at to updatedAt
      ALTER TABLE "users" RENAME COLUMN "updated_at" TO "updatedAt";
      
      -- Rename created_at to createdAt
      ALTER TABLE "users" RENAME COLUMN "created_at" TO "createdAt";
      
      -- Fix categories table field names
      ALTER TABLE "categories" RENAME COLUMN "slug_lock" TO "slugLock";
      ALTER TABLE "categories" RENAME COLUMN "parent_id" TO "parentId";
      ALTER TABLE "categories" RENAME COLUMN "image_id" TO "imageId";
      ALTER TABLE "categories" RENAME COLUMN "sort_order" TO "sortOrder";
      ALTER TABLE "categories" RENAME COLUMN "breadcrumb_path" TO "breadcrumbPath";
      ALTER TABLE "categories" RENAME COLUMN "seo_title" TO "seoTitle";
      ALTER TABLE "categories" RENAME COLUMN "seo_description" TO "seoDescription";
      ALTER TABLE "categories" RENAME COLUMN "seo_keywords" TO "seoKeywords";
      ALTER TABLE "categories" RENAME COLUMN "updated_at" TO "updatedAt";
      ALTER TABLE "categories" RENAME COLUMN "created_at" TO "createdAt";
      
      -- Fix products table field names
      ALTER TABLE "products" RENAME COLUMN "slug_lock" TO "slugLock";
      ALTER TABLE "products" RENAME COLUMN "full_description" TO "fullDescription";
      ALTER TABLE "products" RENAME COLUMN "compare_at_price" TO "compareAtPrice";
      ALTER TABLE "products" RENAME COLUMN "inventory_track_quantity" TO "inventoryTrackQuantity";
      ALTER TABLE "products" RENAME COLUMN "inventory_quantity" TO "inventoryQuantity";
      ALTER TABLE "products" RENAME COLUMN "inventory_allow_backorder" TO "inventoryAllowBackorder";
      ALTER TABLE "products" RENAME COLUMN "inventory_low_stock_threshold" TO "inventoryLowStockThreshold";
      ALTER TABLE "products" RENAME COLUMN "dimensions_length" TO "dimensionsLength";
      ALTER TABLE "products" RENAME COLUMN "dimensions_width" TO "dimensionsWidth";
      ALTER TABLE "products" RENAME COLUMN "dimensions_height" TO "dimensionsHeight";
      ALTER TABLE "products" RENAME COLUMN "seo_title" TO "seoTitle";
      ALTER TABLE "products" RENAME COLUMN "seo_description" TO "seoDescription";
      ALTER TABLE "products" RENAME COLUMN "seo_keywords" TO "seoKeywords";
      ALTER TABLE "products" RENAME COLUMN "updated_at" TO "updatedAt";
      ALTER TABLE "products" RENAME COLUMN "created_at" TO "createdAt";
      
      -- Fix media table field names
      ALTER TABLE "media" RENAME COLUMN "thumbnail_u_r_l" TO "thumbnailURL";
      ALTER TABLE "media" RENAME COLUMN "mime_type" TO "mimeType";
      ALTER TABLE "media" RENAME COLUMN "focal_x" TO "focalX";
      ALTER TABLE "media" RENAME COLUMN "focal_y" TO "focalY";
      ALTER TABLE "media" RENAME COLUMN "updated_at" TO "updatedAt";
      ALTER TABLE "media" RENAME COLUMN "created_at" TO "createdAt";
      
      -- Fix media size variant field names
      ALTER TABLE "media" RENAME COLUMN "sizes_thumbnail_url" TO "sizesThumbnailUrl";
      ALTER TABLE "media" RENAME COLUMN "sizes_thumbnail_width" TO "sizesThumbnailWidth";
      ALTER TABLE "media" RENAME COLUMN "sizes_thumbnail_height" TO "sizesThumbnailHeight";
      ALTER TABLE "media" RENAME COLUMN "sizes_thumbnail_mime_type" TO "sizesThumbnailMimeType";
      ALTER TABLE "media" RENAME COLUMN "sizes_thumbnail_filesize" TO "sizesThumbnailFilesize";
      ALTER TABLE "media" RENAME COLUMN "sizes_thumbnail_filename" TO "sizesThumbnailFilename";
      
      ALTER TABLE "media" RENAME COLUMN "sizes_square_url" TO "sizesSquareUrl";
      ALTER TABLE "media" RENAME COLUMN "sizes_square_width" TO "sizesSquareWidth";
      ALTER TABLE "media" RENAME COLUMN "sizes_square_height" TO "sizesSquareHeight";
      ALTER TABLE "media" RENAME COLUMN "sizes_square_mime_type" TO "sizesSquareMimeType";
      ALTER TABLE "media" RENAME COLUMN "sizes_square_filesize" TO "sizesSquareFilesize";
      ALTER TABLE "media" RENAME COLUMN "sizes_square_filename" TO "sizesSquareFilename";
      
      ALTER TABLE "media" RENAME COLUMN "sizes_small_url" TO "sizesSmallUrl";
      ALTER TABLE "media" RENAME COLUMN "sizes_small_width" TO "sizesSmallWidth";
      ALTER TABLE "media" RENAME COLUMN "sizes_small_height" TO "sizesSmallHeight";
      ALTER TABLE "media" RENAME COLUMN "sizes_small_mime_type" TO "sizesSmallMimeType";
      ALTER TABLE "media" RENAME COLUMN "sizes_small_filesize" TO "sizesSmallFilesize";
      ALTER TABLE "media" RENAME COLUMN "sizes_small_filename" TO "sizesSmallFilename";
      
      ALTER TABLE "media" RENAME COLUMN "sizes_medium_url" TO "sizesMediumUrl";
      ALTER TABLE "media" RENAME COLUMN "sizes_medium_width" TO "sizesMediumWidth";
      ALTER TABLE "media" RENAME COLUMN "sizes_medium_height" TO "sizesMediumHeight";
      ALTER TABLE "media" RENAME COLUMN "sizes_medium_mime_type" TO "sizesMediumMimeType";
      ALTER TABLE "media" RENAME COLUMN "sizes_medium_filesize" TO "sizesMediumFilesize";
      ALTER TABLE "media" RENAME COLUMN "sizes_medium_filename" TO "sizesMediumFilename";
      
      ALTER TABLE "media" RENAME COLUMN "sizes_large_url" TO "sizesLargeUrl";
      ALTER TABLE "media" RENAME COLUMN "sizes_large_width" TO "sizesLargeWidth";
      ALTER TABLE "media" RENAME COLUMN "sizes_large_height" TO "sizesLargeHeight";
      ALTER TABLE "media" RENAME COLUMN "sizes_large_mime_type" TO "sizesLargeMimeType";
      ALTER TABLE "media" RENAME COLUMN "sizes_large_filesize" TO "sizesLargeFilesize";
      ALTER TABLE "media" RENAME COLUMN "sizes_large_filename" TO "sizesLargeFilename";
      
      ALTER TABLE "media" RENAME COLUMN "sizes_xlarge_url" TO "sizesXlargeUrl";
      ALTER TABLE "media" RENAME COLUMN "sizes_xlarge_width" TO "sizesXlargeWidth";
      ALTER TABLE "media" RENAME COLUMN "sizes_xlarge_height" TO "sizesXlargeHeight";
      ALTER TABLE "media" RENAME COLUMN "sizes_xlarge_mime_type" TO "sizesXlargeMimeType";
      ALTER TABLE "media" RENAME COLUMN "sizes_xlarge_filesize" TO "sizesXlargeFilesize";
      ALTER TABLE "media" RENAME COLUMN "sizes_xlarge_filename" TO "sizesXlargeFilename";
      
      ALTER TABLE "media" RENAME COLUMN "sizes_og_url" TO "sizesOgUrl";
      ALTER TABLE "media" RENAME COLUMN "sizes_og_width" TO "sizesOgWidth";
      ALTER TABLE "media" RENAME COLUMN "sizes_og_height" TO "sizesOgHeight";
      ALTER TABLE "media" RENAME COLUMN "sizes_og_mime_type" TO "sizesOgMimeType";
      ALTER TABLE "media" RENAME COLUMN "sizes_og_filesize" TO "sizesOgFilesize";
      ALTER TABLE "media" RENAME COLUMN "sizes_og_filename" TO "sizesOgFilename";
      
      -- Fix relationship table field names
      ALTER TABLE "users_sessions" RENAME COLUMN "_parent_id" TO "_parentId";
      ALTER TABLE "users_sessions" RENAME COLUMN "_order" TO "_order";
      ALTER TABLE "users_sessions" RENAME COLUMN "created_at" TO "createdAt";
      ALTER TABLE "users_sessions" RENAME COLUMN "expires_at" TO "expiresAt";
      
      ALTER TABLE "categories_breadcrumbs" RENAME COLUMN "_parent_id" TO "_parentId";
      ALTER TABLE "categories_breadcrumbs" RENAME COLUMN "_order" TO "_order";
      ALTER TABLE "categories_breadcrumbs" RENAME COLUMN "doc_id" TO "docId";
      
      ALTER TABLE "products_images" RENAME COLUMN "_parent_id" TO "_parentId";
      ALTER TABLE "products_images" RENAME COLUMN "_order" TO "_order";
      ALTER TABLE "products_images" RENAME COLUMN "image_id" TO "imageId";
      
      ALTER TABLE "products_tags" RENAME COLUMN "_parent_id" TO "_parentId";
      ALTER TABLE "products_tags" RENAME COLUMN "_order" TO "_order";
      
      ALTER TABLE "products_rels" RENAME COLUMN "parent_id" TO "parentId";
      ALTER TABLE "products_rels" RENAME COLUMN "categories_id" TO "categoriesId";
    `
    
    return NextResponse.json({
      success: true,
      message: 'Field naming fix SQL generated',
      instructions: {
        problem: 'Field names use snake_case but Payload CMS expects camelCase, causing destructuring errors',
        solution: 'Rename all fields from snake_case to camelCase to match Payload expectations',
        steps: [
          '1. Open pgAdmin and connect to your RDS database',
          '2. Open the Query Tool (SQL Editor)',
          '3. Copy and paste the SQL commands below',
          '4. Execute all commands',
          '5. Test admin login again'
        ],
        note: 'This will rename all fields to match Payload CMS naming conventions'
      },
      sqlCommands: fixFieldNamesSQL,
      summary: {
        tablesToFix: ['users', 'categories', 'products', 'media', 'users_sessions', 'categories_breadcrumbs', 'products_images', 'products_tags', 'products_rels'],
        fix: 'Rename all snake_case fields to camelCase',
        mainIssue: 'lock_until -> lockUntil, reset_password_token -> resetPasswordToken, etc.'
      }
    })
  } catch (error: any) {
    console.error('Error generating field naming fix SQL:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate field naming fix SQL',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
