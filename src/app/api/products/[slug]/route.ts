import { NextRequest } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { createSuccessResponse, withErrorHandling, ApiError } from '@/utilities/apiResponse'
import { logger } from '@/utilities/logger'

// Helper function to normalize field names
function normalizeFieldNames(data: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {}

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
      normalized[normalizedKey] = normalizeFieldNames(value as Record<string, unknown>)
    } else {
      normalized[normalizedKey] = value
    }
  }

  return normalized
}

// Helper function to validate product data
function validateProductData(data: Record<string, unknown>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check for title - handle both cases
  const title = data.title || data.Title
  if (title && typeof title !== 'string') {
    errors.push('Title must be a string')
  } else if (title && typeof title === 'string' && title.length > 200) {
    errors.push('Title must be less than 200 characters')
  }

  // Check for description - handle both cases
  const description = data.description || data.Description
  if (description && typeof description !== 'string') {
    errors.push('Description must be a string')
  } else if (description && typeof description === 'string' && description.length > 2000) {
    errors.push('Description must be less than 2000 characters')
  }

  // Check for price - handle both cases
  const price = data.price || data.Price
  if (price !== undefined && price !== null && price !== '') {
    const numPrice = parseFloat(String(price))
    if (isNaN(numPrice) || numPrice < 0) {
      errors.push('Price must be a valid positive number')
    }
  }

  // Check for status - handle both cases
  const status = data.status || data.Status
  if (status && typeof status === 'string' && !['active', 'draft', 'archived'].includes(status)) {
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

export const GET = withErrorHandling(
  async (request: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params

    try {
      const payload = await getPayloadHMR({ config: configPromise })

      // Try to find product by slug first, then by ID if slug doesn't work
      let product = await payload.find({
        collection: 'products',
        where: {
          and: [
            { slug: { equals: slug } },
            { status: { equals: 'active' } },
          ],
        },
        limit: 1,
      })

      // If not found by slug, try by ID (for admin operations)
      if (!product || product.docs.length === 0) {
        product = await payload.find({
          collection: 'products',
          where: {
            and: [
              { id: { equals: slug } },
              { status: { equals: 'active' } },
            ],
          },
          limit: 1,
        })
      }

      if (!product || product.docs.length === 0) {
        throw new ApiError('Product not found', 404, 'NOT_FOUND')
      }

      const productData = product.docs[0]

      logger.info('Product fetched successfully', 'API:products/[slug]', {
        productId: productData.id,
        slug,
        title: productData.title,
      })

      return createSuccessResponse(productData, 200, 'Product fetched successfully')
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      logger.apiError('Error fetching product by slug', `/api/products/${slug}`, error as Error)
      throw new ApiError('Failed to fetch product', 500, 'FETCH_ERROR')
    }
  },
)

export const PATCH = withErrorHandling(
  async (request: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params

    try {
      const payload = await getPayloadHMR({ config: configPromise })

      // First find the product by slug or ID to get its ID
      let existingProduct = await payload.find({
        collection: 'products',
        where: {
          and: [
            { slug: { equals: slug } },
            { status: { equals: 'active' } },
          ],
        },
        limit: 1,
      })

      // If not found by slug, try by ID (for admin operations)
      if (!existingProduct || existingProduct.docs.length === 0) {
        existingProduct = await payload.find({
          collection: 'products',
          where: {
            and: [
              { id: { equals: slug } },
              { status: { equals: 'active' } },
            ],
          },
          limit: 1,
        })
      }

      if (!existingProduct || existingProduct.docs.length === 0) {
        throw new ApiError('Product not found', 404, 'NOT_FOUND')
      }

      const productId = existingProduct.docs[0].id

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
            logger.debug('Parsed _payload data for product update', 'API:products/[slug]', {
              payloadData,
              payloadDataKeys: Object.keys(payloadData),
              titleInPayload: payloadData.title,
            })
            // Merge the parsed payload data with the existing body
            body = { ...body, ...payloadData }
            // Remove the _payload field as it's no longer needed
            delete body._payload
            logger.debug('Body after merging _payload for product update', 'API:products/[slug]', {
              finalBody: body,
              finalBodyKeys: Object.keys(body),
              titleInFinalBody: body.title,
            })
          } catch (parseError) {
            logger.warn('Failed to parse _payload field for product update', 'API:products/[slug]', parseError as Error)
            // Continue with the original body if parsing fails
          }
        }
      } else {
        throw new ApiError('Unsupported content type', 400, 'INVALID_CONTENT_TYPE')
      }

      // Normalize field names
      const normalizedBody = normalizeFieldNames(body)

      // Validate product data
      const validation = validateProductData(normalizedBody)
      if (!validation.isValid) {
        throw new ApiError(
          `Validation failed: ${validation.errors.join(', ')}`,
          422,
          'VALIDATION_ERROR',
        )
      }

      // Update the product using its ID
      const result = await payload.update({
        collection: 'products',
        id: productId,
        data: normalizedBody as any,
      })

      logger.info('Product updated successfully via PATCH', 'API:products/[slug]', {
        productId: result.id,
        slug,
        title: result.title,
      })

      return createSuccessResponse(result, 200, 'Product updated successfully')
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      logger.apiError('Error updating product', `/api/products/${slug}`, error as Error)
      throw new ApiError('Failed to update product', 500, 'UPDATE_ERROR')
    }
  },
)

export const PUT = withErrorHandling(
  async (request: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params

    try {
      const payload = await getPayloadHMR({ config: configPromise })

      // First find the product by slug or ID to get its ID
      let existingProduct = await payload.find({
        collection: 'products',
        where: {
          and: [
            { slug: { equals: slug } },
            { status: { equals: 'active' } },
          ],
        },
        limit: 1,
      })

      // If not found by slug, try by ID (for admin operations)
      if (!existingProduct || existingProduct.docs.length === 0) {
        existingProduct = await payload.find({
          collection: 'products',
          where: {
            and: [
              { id: { equals: slug } },
              { status: { equals: 'active' } },
            ],
          },
          limit: 1,
        })
      }

      if (!existingProduct || existingProduct.docs.length === 0) {
        throw new ApiError('Product not found', 404, 'NOT_FOUND')
      }

      const productId = existingProduct.docs[0].id

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
            logger.debug('Parsed _payload data for product replacement', 'API:products/[slug]', {
              payloadData,
              payloadDataKeys: Object.keys(payloadData),
              titleInPayload: payloadData.title,
            })
            // Merge the parsed payload data with the existing body
            body = { ...body, ...payloadData }
            // Remove the _payload field as it's no longer needed
            delete body._payload
            logger.debug('Body after merging _payload for product replacement', 'API:products/[slug]', {
              finalBody: body,
              finalBodyKeys: Object.keys(body),
              titleInFinalBody: body.title,
            })
          } catch (parseError) {
            logger.warn('Failed to parse _payload field for product replacement', 'API:products/[slug]', parseError as Error)
            // Continue with the original body if parsing fails
          }
        }
      } else {
        throw new ApiError('Unsupported content type', 400, 'INVALID_CONTENT_TYPE')
      }

      // Normalize field names
      const normalizedBody = normalizeFieldNames(body)

      // Validate product data
      const validation = validateProductData(normalizedBody)
      if (!validation.isValid) {
        throw new ApiError(
          `Validation failed: ${validation.errors.join(', ')}`,
          422,
          'VALIDATION_ERROR',
        )
      }

      // Replace the product using its ID
      const result = await payload.update({
        collection: 'products',
        id: productId,
        data: normalizedBody as any,
      })

      logger.info('Product replaced successfully via PUT', 'API:products/[slug]', {
        productId: result.id,
        slug,
        title: result.title,
      })

      return createSuccessResponse(result, 200, 'Product replaced successfully')
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      logger.apiError('Error replacing product', `/api/products/${slug}`, error as Error)
      throw new ApiError('Failed to replace product', 500, 'REPLACE_ERROR')
    }
  },
)

export const DELETE = withErrorHandling(
  async (request: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params

    try {
      const payload = await getPayloadHMR({ config: configPromise })

      // First find the product by slug or ID to get its ID
      let existingProduct = await payload.find({
        collection: 'products',
        where: {
          and: [
            { slug: { equals: slug } },
            { status: { equals: 'active' } },
          ],
        },
        limit: 1,
      })

      // If not found by slug, try by ID (for admin operations)
      if (!existingProduct || existingProduct.docs.length === 0) {
        existingProduct = await payload.find({
          collection: 'products',
          where: {
            and: [
              { id: { equals: slug } },
              { status: { equals: 'active' } },
            ],
          },
          limit: 1,
        })
      }

      if (!existingProduct || existingProduct.docs.length === 0) {
        throw new ApiError('Product not found', 404, 'NOT_FOUND')
      }

      const productId = existingProduct.docs[0].id

      logger.info('Product found for deletion', 'API:products/[slug]', {
        productId,
        slug,
        title: existingProduct.docs[0].title,
      })

      // Delete the product using its ID
      const result = await payload.delete({
        collection: 'products',
        id: productId,
      })

      logger.info('Product deleted successfully', 'API:products/[slug]', {
        productId: result.id,
        slug,
        title: result.title,
      })

      return createSuccessResponse(result, 200, 'Product deleted successfully')
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      logger.apiError('Error deleting product', `/api/products/${slug}`, error as Error)
      throw new ApiError('Failed to delete product', 500, 'DELETE_ERROR')
    }
  },
)
