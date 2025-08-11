import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import {
  createSuccessResponse,
  createErrorResponse,
  withErrorHandling,
  ApiError,
} from '@/utilities/apiResponse'
import { logger } from '@/utilities/logger'
import { Product } from '@/types/ecommerce'

// Helper function to normalize field names - simplified and more reliable
function normalizeFieldNames(data: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {}

  // Handle common field variations
  const fieldMappings: Record<string, string> = {
    Title: 'title',
    title: 'title',
    Description: 'description',
    description: 'description',
    Status: 'status',
    status: 'status',
    Price: 'price',
    price: 'price',
    Categories: 'categories',
    categories: 'categories',
    Featured: 'featured',
    featured: 'featured',
    SortOrder: 'sortOrder',
    sortOrder: 'sortOrder',
  }

  // Process each field with proper mapping
  for (const [key, value] of Object.entries(data)) {
    const normalizedKey = fieldMappings[key] || key.toLowerCase()

    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof File)) {
      // Recursively normalize nested objects
      normalized[normalizedKey] = normalizeFieldNames(value)
    } else {
      normalized[normalizedKey] = value
    }
  }

  return normalized
}

// Helper function to validate product data
function validateProductData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check for title - handle both cases
  const title = data.title || data.Title
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string')
  } else if (title.length > 200) {
    errors.push('Title must be less than 200 characters')
  }

  // Check for description - handle both cases
  const description = data.description || data.Description
  if (description && typeof description !== 'string') {
    errors.push('Description must be a string')
  } else if (description && description.length > 2000) {
    errors.push('Description must be less than 2000 characters')
  }

  // Check for price - handle both cases
  const price = data.price || data.Price
  if (price !== undefined && price !== null && price !== '') {
    const numPrice = parseFloat(price)
    if (isNaN(numPrice) || numPrice < 0) {
      errors.push('Price must be a valid positive number')
    }
  }

  // Check for status - handle both cases
  const status = data.status || data.Status
  if (status && !['active', 'draft', 'archived'].includes(status)) {
    errors.push('Status must be one of: active, draft, archived')
  }

  // Check for SKU if provided
  const sku = data.sku || data.SKU
  if (sku && typeof sku !== 'string') {
    errors.push('SKU must be a string')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Helper function to validate update data
function validateUpdateData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // For updates, fields are optional but must be valid if provided
  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim().length === 0) {
      errors.push('Title must be a non-empty string')
    } else if (data.title.length > 200) {
      errors.push('Title must be less than 200 characters')
    }
  }

  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.push('Description must be a string')
    } else if (data.description.length > 2000) {
      errors.push('Description must be less than 2000 characters')
    }
  }

  if (data.price !== undefined) {
    const numPrice = parseFloat(data.price)
    if (isNaN(numPrice) || numPrice < 0) {
      errors.push('Price must be a valid positive number')
    }
  }

  if (data.status !== undefined) {
    if (!['active', 'draft', 'archived'].includes(data.status)) {
      errors.push('Status must be one of: active, draft, archived')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    const payload = await getPayloadHMR({ config: configPromise })
    const searchParams = request.nextUrl.searchParams

    // Parse query parameters with validation
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12')))
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    const featured = searchParams.get('featured')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const status = searchParams.get('status')

    // Validate sort field
    const allowedSortFields = ['title', 'price', 'createdAt', 'updatedAt', 'featured', 'sortOrder']
    const validSort = allowedSortFields.includes(sort) ? sort : 'createdAt'

    // Validate order
    const validOrder = ['asc', 'desc'].includes(order) ? order : 'desc'

    // Build where clause
    const where: any = {}

    // Add status filter (default to active if not specified)
    if (status) {
      if (['active', 'draft', 'archived'].includes(status)) {
        where.status = { equals: status }
      }
    } else {
      where.status = { equals: 'active' }
    }

    // Add category filter
    if (category) {
      where.categories = { in: [category] }
    }

    // Add search filter
    if (search && search.trim().length > 0) {
      where.or = [
        { title: { contains: search.trim() } },
        { description: { contains: search.trim() } },
        { 'tags.tag': { contains: search.trim() } },
      ]
    }

    // Add featured filter
    if (featured === 'true') {
      where.featured = { equals: true }
    }

    // Add price range filter
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) {
        const min = parseFloat(minPrice)
        if (!isNaN(min) && min >= 0) {
          where.price.greater_than_equal = min
        }
      }
      if (maxPrice) {
        const max = parseFloat(maxPrice)
        if (!isNaN(max) && max >= 0) {
          where.price.less_than_equal = max
        }
      }
    }

    // Build sort object
    const sortString = `${order === 'desc' ? '-' : ''}${validSort}`

    const result = await payload.find({
      collection: 'products',
      where,
      limit,
      page,
      sort: sortString,
      populate: {
        categories: true as any,
        images: true as any,
      },
    })

    logger.info('Products fetched successfully', 'API:products', {
      page,
      limit,
      total: result.totalDocs,
      filters: { category, search, featured, minPrice, maxPrice, status },
    })

    return createSuccessResponse(result.docs, 200, 'Products fetched successfully')
  } catch (error) {
    logger.apiError('Error fetching products', '/api/products', error as Error)
    throw new ApiError('Failed to fetch products', 500, 'FETCH_ERROR')
  }
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const payload = await getPayloadHMR({ config: configPromise })

    // Check content type and parse accordingly
    const contentType = request.headers.get('content-type') || ''
    let body: any

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
          if (key === 'categories') {
            // Categories field can be a comma-separated string or array
            if (stringValue.includes(',')) {
              body[key] = stringValue.split(',').map((id) => id.trim())
            } else {
              body[key] = stringValue ? [stringValue] : []
            }
          } else if (key === 'featured') {
            // Convert boolean field
            body[key] = stringValue === 'true' || stringValue === '1'
          } else if (key === 'sortOrder') {
            // Convert number field
            const numValue = parseInt(stringValue)
            body[key] = isNaN(numValue) ? 0 : numValue
          } else if (key === 'price') {
            // Convert price to number
            const numValue = parseFloat(stringValue)
            body[key] = isNaN(numValue) ? 0 : numValue
          } else if (key.startsWith('images[')) {
            // Handle images array field
            const match = key.match(/images\[(\d+)\]\[(\w+)\]/)
            if (match) {
              const [, index, field] = match
              const numIndex = parseInt(index)
              if (!body.images) {
                body.images = []
              }
              if (!body.images[numIndex]) {
                body.images[numIndex] = {}
              }
              body.images[numIndex][field] = stringValue
            }
          } else {
            body[key] = stringValue
          }
        }
      }
    } else {
      throw new ApiError('Unsupported content type', 400, 'INVALID_CONTENT_TYPE')
    }

    // Log the raw body for debugging
    logger.debug('Raw request body received', 'API:products', {
      contentType,
      bodyKeys: Object.keys(body),
      hasTitle: !!(body.title || body.Title),
    })

    // Normalize field names to handle case sensitivity
    const normalizedData = normalizeFieldNames(body)

    // Validate the data
    const validation = validateProductData(normalizedData)
    if (!validation.isValid) {
      throw new ApiError(
        `Validation failed: ${validation.errors.join(', ')}`,
        422,
        'VALIDATION_ERROR',
      )
    }

    // Log final data being sent to payload
    logger.debug('Final product data for creation', 'API:products', {
      titleField: normalizedData.title,
      statusField: normalizedData.status,
      priceField: normalizedData.price,
    })

    // Create the product
    try {
      const result = await payload.create({
        collection: 'products',
        data: normalizedData as any, // Type assertion needed due to dynamic field processing
      })

      logger.info('Product created successfully', 'API:products', {
        productId: result.id,
        title: result.title,
      })

      return createSuccessResponse(result, 201, 'Product created successfully')
    } catch (createError) {
      logger.error('Payload create error details', 'API:products', {
        errorMessage: createError instanceof Error ? createError.message : 'Unknown error',
        errorStack: createError instanceof Error ? createError.stack : undefined,
        normalizedData,
        validationErrors: (createError as any)?.data?.errors || 'No validation errors',
      } as any)

      // Re-throw with more context
      if (createError instanceof Error) {
        throw new ApiError(
          `Product creation failed: ${createError.message}`,
          422,
          'PAYLOAD_CREATE_ERROR',
        )
      }
      throw new ApiError('Product creation failed with unknown error', 500, 'UNKNOWN_CREATE_ERROR')
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    logger.apiError('Error creating product', '/api/products', error as Error)
    throw new ApiError('Failed to create product', 500, 'CREATE_ERROR')
  }
})

export const PUT = withErrorHandling(async (request: NextRequest) => {
  try {
    const payload = await getPayloadHMR({ config: configPromise })
    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get('id')

    if (!productId) {
      throw new ApiError('Product ID is required', 400, 'MISSING_ID')
    }

    // Check content type and parse accordingly
    const contentType = request.headers.get('content-type') || ''
    let body: any

    if (contentType.includes('application/json')) {
      body = await request.json()
    } else if (
      contentType.includes('multipart/form-data') ||
      contentType.includes('application/x-www-form-urlencoded')
    ) {
      const formData = await request.formData()
      body = {}

      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          body[key] = value
        } else {
          const stringValue = value as string

          // Handle special fields similar to POST
          if (key === 'categories') {
            if (stringValue.includes(',')) {
              body[key] = stringValue.split(',').map((id) => id.trim())
            } else {
              body[key] = stringValue ? [stringValue] : []
            }
          } else if (key === 'featured') {
            body[key] = stringValue === 'true' || stringValue === '1'
          } else if (key === 'sortOrder') {
            const numValue = parseInt(stringValue)
            body[key] = isNaN(numValue) ? 0 : numValue
          } else if (key === 'price') {
            const numValue = parseFloat(stringValue)
            body[key] = isNaN(numValue) ? 0 : numValue
          } else if (key.startsWith('images[')) {
            const match = key.match(/images\[(\d+)\]\[(\w+)\]/)
            if (match) {
              const [, index, field] = match
              const numIndex = parseInt(index)
              if (!body.images) {
                body.images = []
              }
              if (!body.images[numIndex]) {
                body.images[numIndex] = {}
              }
              body.images[numIndex][field] = stringValue
            }
          } else {
            body[key] = stringValue
          }
        }
      }
    } else {
      throw new ApiError('Unsupported content type', 400, 'INVALID_CONTENT_TYPE')
    }

    // Normalize field names
    const normalizedData = normalizeFieldNames(body)

    // Validate update data
    const validation = validateUpdateData(normalizedData)
    if (!validation.isValid) {
      throw new ApiError(
        `Validation failed: ${validation.errors.join(', ')}`,
        422,
        'VALIDATION_ERROR',
      )
    }

    // Check if product exists
    try {
      await payload.findByID({
        collection: 'products',
        id: productId,
      })
    } catch (error) {
      throw new ApiError('Product not found', 404, 'PRODUCT_NOT_FOUND')
    }

    // Update the product
    try {
      const result = await payload.update({
        collection: 'products',
        id: productId,
        data: normalizedData as any,
      })

      logger.info('Product updated successfully', 'API:products', {
        productId: result.id,
        title: result.title,
        updatedFields: Object.keys(normalizedData),
      })

      return createSuccessResponse(result, 200, 'Product updated successfully')
    } catch (updateError) {
      logger.error(
        'Payload update error details',
        'API:products',
        updateError instanceof Error ? updateError : undefined,
        {
          productId,
          normalizedData,
        },
      )

      if (updateError instanceof Error) {
        throw new ApiError(
          `Product update failed: ${updateError.message}`,
          422,
          'PAYLOAD_UPDATE_ERROR',
        )
      }
      throw new ApiError('Product update failed with unknown error', 500, 'UNKNOWN_UPDATE_ERROR')
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    logger.apiError('Error updating product', '/api/products', error as Error)
    throw new ApiError('Failed to update product', 500, 'UPDATE_ERROR')
  }
})

export const DELETE = withErrorHandling(async (request: NextRequest) => {
  try {
    const payload = await getPayloadHMR({ config: configPromise })
    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get('id')

    if (!productId) {
      throw new ApiError('Product ID is required', 400, 'MISSING_ID')
    }

    // Check if product exists
    let existingProduct
    try {
      existingProduct = await payload.findByID({
        collection: 'products',
        id: productId,
      })
    } catch (error) {
      throw new ApiError('Product not found', 404, 'PRODUCT_NOT_FOUND')
    }

    // Delete the product
    try {
      await payload.delete({
        collection: 'products',
        id: productId,
      })

      logger.info('Product deleted successfully', 'API:products', {
        productId,
        title: existingProduct.title,
      })

      return createSuccessResponse(
        { message: 'Product deleted successfully', productId },
        200,
        'Product deleted successfully',
      )
    } catch (deleteError) {
      logger.error(
        'Payload delete error details',
        'API:products',
        deleteError instanceof Error ? deleteError : undefined,
        {
          productId,
        },
      )

      if (deleteError instanceof Error) {
        throw new ApiError(
          `Product deletion failed: ${deleteError.message}`,
          422,
          'PAYLOAD_DELETE_ERROR',
        )
      }
      throw new ApiError('Product deletion failed with unknown error', 500, 'UNKNOWN_DELETE_ERROR')
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    logger.apiError('Error deleting product', '/api/products', error as Error)
    throw new ApiError('Failed to delete product', 500, 'DELETE_ERROR')
  }
})
