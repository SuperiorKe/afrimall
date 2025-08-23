import { NextRequest } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { createSuccessResponse, withErrorHandling, ApiError } from '@/utilities/apiResponse'
import { logger } from '@/utilities/logger'

// Enhanced search and filtering for products
export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    const payload = await getPayloadHMR({ config: configPromise })
    const searchParams = request.nextUrl.searchParams

    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const featured = searchParams.get('featured')
    const status = searchParams.get('status') || 'active'

    // Build where clause
    const where: Record<string, any> = {
      status: { equals: status },
    }

    // Search functionality
    if (search) {
      where.or = [
        { title: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
        { 'tags.tag': { contains: search } },
      ]
    }

    // Category filter
    if (category) {
      where.categories = { in: [category] }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) {
        where.price.greater_than_equal = parseFloat(minPrice)
      }
      if (maxPrice) {
        where.price.less_than_equal = parseFloat(maxPrice)
      }
    }

    // Featured filter
    if (featured === 'true') {
      where.featured = { equals: true }
    }

    // Build sort string
    const sortString = `${sortOrder === 'desc' ? '-' : ''}${sortBy}`

    // Fetch products with enhanced population
    const result = await payload.find({
      collection: 'products',
      where: where as any,
      limit,
      page,
      sort: sortString,
      populate: {
        categories: true,
        images: true,
        tags: true,
      } as any,
    })

    // Transform products for frontend consumption
    const transformedProducts = result.docs.map((product: any) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      sku: product.sku,
      status: product.status,
      featured: product.featured,
      slug: product.slug,
      images:
        product.images?.map((img: any) => ({
          id: img.id,
          url: img.image?.filename ? `/api/media/file/${img.image.filename}` : null,
          alt: img.alt || img.image?.alt || '',
          width: img.image?.width || 800,
          height: img.image?.height || 600,
        })) || [],
      categories:
        product.categories?.map((cat: any) => ({
          id: cat.id,
          title: cat.title,
          slug: cat.slug,
          image: cat.image
            ? {
                url: `/api/media/file/${cat.image.filename}`,
                alt: cat.image.alt || '',
              }
            : null,
        })) || [],
      tags:
        product.tags?.map((tag: any) => ({
          id: tag.id,
          tag: tag.tag,
        })) || [],
      inventory: {
        trackQuantity: product.inventory?.trackQuantity || false,
        quantity: product.inventory?.quantity || 0,
        allowBackorder: product.inventory?.allowBackorder || false,
        lowStockThreshold: product.inventory?.lowStockThreshold || 5,
      },
      weight: product.weight,
      dimensions: product.dimensions,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }))

    // Enhanced pagination info
    const pagination = {
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
      limit: result.limit,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
      nextPage: result.nextPage,
      prevPage: result.prevPage,
    }

    logger.info('Products fetched successfully', 'API:products', {
      totalProducts: result.totalDocs,
      page,
      limit,
      search,
      category,
      filters: { minPrice, maxPrice, featured, status },
    })

    return createSuccessResponse(
      {
        products: transformedProducts,
        pagination,
        filters: {
          applied: {
            search,
            category,
            minPrice,
            maxPrice,
            featured: featured === 'true',
            status,
          },
          available: {
            categories: await getAvailableCategories(payload),
            priceRange: await getPriceRange(payload),
          },
        },
      },
      200,
      'Products fetched successfully',
    )
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    logger.apiError('Error fetching products', '/api/products', error as Error)
    throw new ApiError('Failed to fetch products', 500, 'FETCH_ERROR')
  }
})

// Helper function to get available categories
async function getAvailableCategories(payload: any) {
  try {
    const categories = await payload.find({
      collection: 'categories',
      where: { status: { equals: 'active' } },
      sort: 'sortOrder',
      limit: 100,
      fields: ['id', 'title', 'slug', 'productCount'],
    })

    return categories.docs.map((cat: any) => ({
      id: cat.id,
      title: cat.title,
      slug: cat.slug,
      productCount: cat.productCount || 0,
    }))
  } catch (error) {
    logger.warn('Failed to fetch categories for filters', 'API:products', error as Error)
    return []
  }
}

// Helper function to get price range
async function getPriceRange(payload: any) {
  try {
    const minResult = await payload.find({
      collection: 'products',
      where: { status: { equals: 'active' } },
      sort: 'price',
      limit: 1,
      fields: ['price'],
    })

    const maxResult = await payload.find({
      collection: 'products',
      where: { status: { equals: 'active' } },
      sort: '-price',
      limit: 1,
      fields: ['price'],
    })

    return {
      min: minResult.docs[0]?.price || 0,
      max: maxResult.docs[0]?.price || 1000,
    }
  } catch (error) {
    logger.warn('Failed to fetch price range', 'API:products', error as Error)
    return { min: 0, max: 1000 }
  }
}

// POST method for creating products (admin only)
export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const payload = await getPayloadHMR({ config: configPromise })

    // Check content type and parse accordingly
    const contentType = request.headers.get('content-type') || ''
    let body: Record<string, unknown>

    if (contentType.includes('application/json')) {
      body = await request.json()
    } else if (
      contentType.includes('multipart/form-data') ||
      contentType.includes('application/x-www-form-urlencoded')
    ) {
      // Handle form data - this is what Payload admin sends
      const formData = await request.formData()
      body = {}

      // Convert FormData to plain object with proper type handling
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          // Handle file uploads if needed
          body[key] = value
        } else {
          const stringValue = value as string

          // Handle special fields
          if (key === 'price' || key === 'compareAtPrice') {
            // Convert price fields to numbers
            const numValue = parseFloat(stringValue)
            body[key] = isNaN(numValue) ? 0 : numValue
          } else if (key === 'featured' || key === 'trackQuantity' || key === 'allowBackorder') {
            // Convert boolean fields
            body[key] = stringValue === 'true' || stringValue === '1'
          } else if (key === 'quantity' || key === 'lowStockThreshold') {
            // Convert number fields
            const numValue = parseInt(stringValue)
            body[key] = isNaN(numValue) ? 0 : numValue
          } else {
            body[key] = stringValue
          }
        }
      }

      // Handle Payload admin's special _payload field
      if (body._payload && typeof body._payload === 'string') {
        try {
          const payloadData = JSON.parse(body._payload as string)
          logger.debug('Parsed _payload data for product', 'API:products', {
            payloadData,
            payloadDataKeys: Object.keys(payloadData),
            titleInPayload: payloadData.title,
          })
          // Merge the parsed payload data with the existing body
          body = { ...body, ...payloadData }
          // Remove the _payload field as it's no longer needed
          delete body._payload
          logger.debug('Body after merging _payload for product', 'API:products', {
            finalBody: body,
            finalBodyKeys: Object.keys(body),
            titleInFinalBody: body.title,
          })
        } catch (parseError) {
          logger.warn(
            'Failed to parse _payload field for product',
            'API:products',
            parseError as Error,
          )
          // Continue with the original body if parsing fails
        }
      }
    } else {
      throw new ApiError('Unsupported content type', 400, 'INVALID_CONTENT_TYPE')
    }

    // Log the processed body for debugging
    logger.debug('Processed request body for product creation', 'API:products', {
      contentType,
      processedBody: body,
      bodyKeys: Object.keys(body),
      titleField: body.title,
      titleFieldType: typeof body.title,
    })

    // Validate product data
    const validation = validateProductData(body)
    if (!validation.isValid) {
      throw new ApiError(
        `Validation failed: ${validation.errors.join(', ')}`,
        422,
        'VALIDATION_ERROR',
      )
    }

    // Create the product
    const result = await payload.create({
      collection: 'products',
      data: body as any,
    })

    logger.info('Product created successfully', 'API:products', {
      productId: result.id,
      title: result.title,
    })

    return createSuccessResponse(result, 201, 'Product created successfully')
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    logger.apiError('Error creating product', '/api/products', error as Error)
    throw new ApiError('Failed to create product', 500, 'CREATE_ERROR')
  }
})

// Helper function to validate product data
function validateProductData(data: Record<string, unknown>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check for title
  const title = data.title
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string')
  } else if (title.length > 200) {
    errors.push('Title must be less than 200 characters')
  }

  // Check for description
  const description = data.description
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.push('Description is required and must be a non-empty string')
  } else if (description.length > 2000) {
    errors.push('Description must be less than 2000 characters')
  }

  // Check for price
  const price = data.price
  if (price !== undefined && price !== null && price !== '') {
    const numPrice = parseFloat(String(price))
    if (isNaN(numPrice) || numPrice < 0) {
      errors.push('Price must be a valid positive number')
    }
  }

  // Check for status
  const status = data.status
  if (status && typeof status === 'string' && !['active', 'draft', 'archived'].includes(status)) {
    errors.push('Status must be one of: active, draft, archived')
  }

  // Check for SKU if provided
  const sku = data.sku
  if (sku && typeof sku !== 'string') {
    errors.push('SKU must be a string')
  }

  // Validate images (required field)
  const images = data.images
  if (!images || !Array.isArray(images) || images.length === 0) {
    errors.push('At least one image is required')
  } else {
    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      if (image && typeof image === 'object') {
        if (!image.image || (typeof image.image === 'string' && image.image.trim() === '')) {
          errors.push(`Images ${i + 1} > Image is required`)
        }
        if (!image.alt || (typeof image.alt === 'string' && image.alt.trim() === '')) {
          errors.push(`Images ${i + 1} > Alt is required`)
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Note: PATCH method moved to /api/products/[slug]/route.ts for individual product updates
