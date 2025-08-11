import { NextRequest } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import {
  createSuccessResponse,
  createErrorResponse,
  badRequestResponse,
  withErrorHandling,
  ApiError,
} from '@/utilities/apiResponse'
import { logger } from '@/utilities/logger'
import { Category } from '@/types/ecommerce'

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
    Parent: 'parent',
    parent: 'parent',
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

// Helper function to validate category data
function validateCategoryData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check for title in both cases
  const title = data.title || data.Title
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string')
  }

  if (title && title.length > 100) {
    errors.push('Title must be less than 100 characters')
  }

  // Check for description in both cases
  const description = data.description || data.Description
  if (description && typeof description !== 'string') {
    errors.push('Description must be a string')
  }

  if (description && description.length > 1000) {
    errors.push('Description must be less than 1000 characters')
  }

  // Handle parent field properly - it can be null/undefined for top-level categories
  const parent = data.parent || data.Parent
  if (parent !== undefined && parent !== null && parent !== '') {
    if (typeof parent !== 'string') {
      errors.push('Parent must be a valid category ID string')
    } else if (parent.trim().length === 0) {
      // Convert empty string to null for top-level categories
      data.parent = null
    }
  } else {
    // Ensure parent is explicitly set to null for top-level categories
    data.parent = null
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    const payload = await getPayloadHMR({ config: configPromise })
    const { searchParams } = new URL(request.url)

    // Add debug endpoint for testing
    if (searchParams.get('debug') === 'true') {
      logger.debug('Debug endpoint called', 'API:categories', {
        searchParams: Object.fromEntries(searchParams.entries()),
      })

      // Test creating a simple category to see what happens
      try {
        const testResult = await payload.create({
          collection: 'categories',
          data: {
            title: 'Test Category',
            status: 'active',
            parent: null,
          },
        })

        return createSuccessResponse(
          {
            message: 'Test category created successfully',
            testResult,
            timestamp: new Date().toISOString(),
          },
          200,
          'Debug test completed',
        )
      } catch (testError) {
        logger.error('Test category creation failed', 'API:categories', testError as Error)
        return createErrorResponse('Test failed', 500, 'TEST_ERROR')
      }
    }

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const parent = searchParams.get('parent')
    const status = searchParams.get('status')
    const featured = searchParams.get('featured')

    // Build query
    const query: any = {
      status: { equals: 'active' },
    }

    if (parent) {
      query.parent = { equals: parent }
    }

    if (status) {
      query.status = { equals: status }
    }

    if (featured) {
      query.featured = { equals: featured === 'true' }
    }

    const result = await payload.find({
      collection: 'categories',
      where: query,
      page,
      limit,
      sort: 'sortOrder',
      depth: 1,
    })

    logger.info('Categories fetched successfully', 'API:categories', {
      page,
      limit,
      total: result.totalDocs,
    })

    return createSuccessResponse(result.docs, 200, 'Categories fetched successfully')
  } catch (error) {
    logger.apiError('Error fetching categories', '/api/categories', error as Error)
    throw new ApiError('Failed to fetch categories', 500, 'FETCH_ERROR')
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
          if (key === 'parent') {
            // Parent field can be empty string (top-level) or a valid ID
            body[key] = stringValue === '' ? null : stringValue
          } else if (key === 'featured' || key === 'sortOrder') {
            // Convert boolean and number fields
            if (key === 'featured') {
              body[key] = stringValue === 'true' || stringValue === '1'
            } else if (key === 'sortOrder') {
              const numValue = parseInt(stringValue)
              body[key] = isNaN(numValue) ? 0 : numValue
            }
          } else {
            body[key] = stringValue
          }
        }
      }
    } else {
      throw new ApiError('Unsupported content type', 400, 'INVALID_CONTENT_TYPE')
    }

    // Log the raw body before normalization
    logger.debug('Raw request body received', 'API:categories', {
      contentType,
      rawBody: body,
      bodyKeys: Object.keys(body),
      titleField: body.title || body.Title,
      titleFieldType: typeof (body.title || body.Title),
    })

    // Normalize field names to handle case sensitivity
    const normalizedData = normalizeFieldNames(body)

    // Ensure critical fields are properly set for payload
    if (body.Title && !normalizedData.title) {
      normalizedData.title = body.Title
    }
    if (body.Description && !normalizedData.description) {
      normalizedData.description = body.Description
    }
    if (body.Status && !normalizedData.status) {
      normalizedData.status = body.Status
    }
    if (body.Parent && !normalizedData.parent) {
      normalizedData.parent = body.Parent
    }
    if (body.Featured && !normalizedData.featured) {
      normalizedData.featured = body.Featured
    }
    if (body.SortOrder && !normalizedData.sortorder) {
      normalizedData.sortorder = body.SortOrder
    }

    // Debug logging for parent field
    logger.debug('Processing category data', 'API:categories', {
      originalBody: body,
      normalizedData,
      parentField: normalizedData.parent,
      parentType: typeof normalizedData.parent,
      titleField: normalizedData.title,
      titleFieldType: typeof normalizedData.title,
    })

    // Validate the data
    const validation = validateCategoryData(normalizedData)
    if (!validation.isValid) {
      throw new ApiError(
        `Validation failed: ${validation.errors.join(', ')}`,
        422,
        'VALIDATION_ERROR',
      )
    }

    // Additional parent field validation
    if (normalizedData.parent && normalizedData.parent !== null) {
      try {
        // Verify parent category exists if a parent is specified
        const parentCategory = await payload.findByID({
          collection: 'categories',
          id: normalizedData.parent,
          depth: 0,
        })

        if (!parentCategory) {
          throw new ApiError(
            `Parent category with ID '${normalizedData.parent}' not found`,
            422,
            'INVALID_PARENT',
          )
        }

        logger.debug('Parent category verified', 'API:categories', {
          parentId: normalizedData.parent,
          parentTitle: parentCategory.title,
        })
      } catch (error) {
        if (error instanceof ApiError) {
          throw error
        }
        logger.error('Error verifying parent category', 'API:categories', error as Error)
        throw new ApiError(
          `Failed to verify parent category: ${error instanceof Error ? error.message : 'Unknown error'}`,
          422,
          'PARENT_VERIFICATION_ERROR',
        )
      }
    }

    // Log final data being sent to payload
    logger.debug('Final category data for creation', 'API:categories', {
      finalData: normalizedData,
      titleField: normalizedData.title,
      titleFieldType: typeof normalizedData.title,
      statusField: normalizedData.status,
      parentField: normalizedData.parent,
    })

    // Final validation check before sending to payload
    if (!normalizedData.title) {
      logger.error('Title field missing after normalization', 'API:categories', {
        originalBody: body,
        normalizedData,
        bodyKeys: Object.keys(body),
        normalizedKeys: Object.keys(normalizedData),
      } as any)
      throw new ApiError(
        'Title field is required but missing after processing',
        422,
        'MISSING_TITLE',
      )
    }

    // Create the category
    const result = await payload.create({
      collection: 'categories',
      data: normalizedData as any, // Type assertion needed due to dynamic field processing
    })

    logger.info('Category created successfully', 'API:categories', {
      categoryId: result.id,
      title: result.title,
    })

    return createSuccessResponse(result, 201, 'Category created successfully')
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    logger.apiError('Error creating category', '/api/categories', error as Error)
    throw new ApiError('Failed to create category', 500, 'CREATE_ERROR')
  }
})
