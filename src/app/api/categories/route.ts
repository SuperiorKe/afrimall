import { NextRequest } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import {
  createSuccessResponse,
  createErrorResponse,
  withErrorHandling,
  ApiError,
} from '@/utilities/apiResponse'
import { logger } from '@/utilities/logger'
import type { Where } from 'payload'

// Helper function to normalize field names - simplified and more reliable
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
    Parent: 'parent',
    parent: 'parent',
    Featured: 'featured',
    featured: 'featured',
    SortOrder: 'sortOrder',
    sortOrder: 'sortOrder',
    slug: 'slug',
    Slug: 'slug',
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

// Helper function to validate category data
function validateCategoryData(data: Record<string, unknown>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check for title in both cases
  const title = data.title || data.Title
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string')
  }

  if (title && typeof title === 'string' && title.length > 100) {
    errors.push('Title must be less than 100 characters')
  }

  // Check for description in both cases
  const description = data.description || data.Description
  if (description && typeof description !== 'string') {
    errors.push('Description must be a string')
  }

  if (description && typeof description === 'string' && description.length > 1000) {
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
    const query: Where = {
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

      // Handle Payload admin's special _payload field
      if (body._payload && typeof body._payload === 'string') {
        try {
          const payloadData = JSON.parse(body._payload as string)
          logger.debug('Parsed _payload data', 'API:categories', {
            payloadData,
            payloadDataKeys: Object.keys(payloadData),
            titleInPayload: payloadData.title,
          })
          // Merge the parsed payload data with the existing body
          body = { ...body, ...payloadData }
          // Remove the _payload field as it's no longer needed
          delete body._payload
          logger.debug('Body after merging _payload', 'API:categories', {
            finalBody: body,
            finalBodyKeys: Object.keys(body),
            titleInFinalBody: body.title,
          })
        } catch (parseError) {
          logger.warn('Failed to parse _payload field', 'API:categories', parseError as Error)
          // Continue with the original body if parsing fails
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

    // Check if this is a relationship dropdown request (empty or minimal data)
    const hasTitle = body.title || body.Title
    const hasDescription = body.description || body.Description
    const hasStatus = body.status || body.Status
    const bodyKeys = Object.keys(body)

    // Log all incoming requests for debugging
    logger.debug('Incoming POST request to categories API', 'API:categories', {
      body,
      bodyKeys,
      hasTitle: !!hasTitle,
      hasDescription: !!hasDescription,
      hasStatus: !!hasStatus,
      contentType,
    })

    // Check if this is a search/filter request (has pagination params but no category data)
    const isSearchRequest =
      bodyKeys.includes('depth') ||
      bodyKeys.includes('limit') ||
      bodyKeys.includes('page') ||
      bodyKeys.includes('sort')
    const hasCategoryData = hasTitle || hasDescription || hasStatus

    // If this looks like a search/filter request without category data, treat it as a GET request
    if (isSearchRequest && !hasCategoryData) {
      logger.debug('Detected search/filter request, treating as GET request', 'API:categories', {
        body,
        bodyKeys,
      })

      const page = parseInt((body.page as string) || '1')
      const limit = parseInt((body.limit as string) || '10')
      const sort = (body.sort as string) || 'title'
      const depth = parseInt((body.depth as string) || '0')

      const existingCategories = await payload.find({
        collection: 'categories',
        where: {
          status: { equals: 'active' },
        },
        page,
        limit,
        sort,
        depth,
      })

      return createSuccessResponse(
        existingCategories.docs,
        200,
        'Categories fetched for search/filter request',
      )
    }

    // If this looks like a relationship dropdown request (no meaningful data), return existing categories
    if (!hasTitle && !hasDescription && !hasStatus && bodyKeys.length <= 2) {
      logger.debug(
        'Detected relationship dropdown request, returning existing categories',
        'API:categories',
        {
          body,
          bodyKeys,
        },
      )

      const existingCategories = await payload.find({
        collection: 'categories',
        where: {
          status: { equals: 'active' },
        },
        limit: 100,
        sort: 'title',
        depth: 0,
      })

      return createSuccessResponse(
        existingCategories.docs,
        200,
        'Categories fetched for relationship dropdown',
      )
    }

    // Additional check: if the request has no meaningful data at all, return existing categories
    if (
      bodyKeys.length === 0 ||
      (bodyKeys.length === 1 && bodyKeys[0] === '_payload' && !body._payload)
    ) {
      logger.debug('Empty request detected, returning existing categories', 'API:categories', {
        body,
        bodyKeys,
      })

      const existingCategories = await payload.find({
        collection: 'categories',
        where: {
          status: { equals: 'active' },
        },
        limit: 100,
        sort: 'title',
        depth: 0,
      })

      return createSuccessResponse(
        existingCategories.docs,
        200,
        'Categories fetched for empty request',
      )
    }

    // Normalize field names to handle case sensitivity
    const normalizedData = normalizeFieldNames(body)

    // Filter out invalid fields that might cause validation issues
    const validFields = [
      'title',
      'description',
      'status',
      'parent',
      'featured',
      'sortOrder',
      'slug',
      'seo',
    ]
    const filteredData: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(normalizedData)) {
      if (validFields.includes(key)) {
        filteredData[key] = value
      }
    }

    logger.debug('Data after normalization and filtering', 'API:categories', {
      normalizedData,
      normalizedDataKeys: Object.keys(normalizedData),
      titleAfterNormalization: normalizedData.title,
      titleTypeAfterNormalization: typeof normalizedData.title,
      filteredData,
      filteredDataKeys: Object.keys(filteredData),
    })

    // Use filtered data for further processing
    const finalData = filteredData

    // Ensure critical fields are properly set for payload
    if (body.Title && !finalData.title) {
      finalData.title = body.Title
    }
    if (body.Description && !finalData.description) {
      finalData.description = body.Description
    }
    if (body.Status && !finalData.status) {
      finalData.status = body.Status
    }
    if (body.Parent && !finalData.parent) {
      finalData.parent = body.Parent
    }
    if (body.Featured && !finalData.featured) {
      finalData.featured = body.Featured
    }
    if (body.SortOrder && !finalData.sortOrder) {
      finalData.sortOrder = body.SortOrder
    }

    // Debug logging for parent field
    logger.debug('Processing category data', 'API:categories', {
      originalBody: body,
      normalizedData,
      finalData,
      parentField: finalData.parent,
      parentType: typeof finalData.parent,
      titleField: finalData.title,
      titleFieldType: typeof finalData.title,
    })

    // Validate the data
    const validation = validateCategoryData(finalData)
    if (!validation.isValid) {
      // Only treat as dropdown request if we have very minimal data (like empty or just _payload)
      const isMinimalRequest = bodyKeys.length <= 1 && !finalData.title && !finalData.Title

      if (isMinimalRequest) {
        logger.debug(
          'Validation failed but minimal request detected, treating as dropdown request',
          'API:categories',
          {
            finalData,
            validationErrors: validation.errors,
            bodyKeys,
          },
        )

        const existingCategories = await payload.find({
          collection: 'categories',
          where: {
            status: { equals: 'active' },
          },
          limit: 100,
          sort: 'title',
          depth: 0,
        })

        return createSuccessResponse(
          existingCategories.docs,
          200,
          'Categories fetched for dropdown (validation fallback)',
        )
      }

      throw new ApiError(
        `Validation failed: ${validation.errors.join(', ')}`,
        422,
        'VALIDATION_ERROR',
      )
    }

    // Additional parent field validation
    if (finalData.parent && finalData.parent !== null && typeof finalData.parent === 'string') {
      try {
        // Verify parent category exists if a parent is specified
        const parentCategory = await payload.findByID({
          collection: 'categories',
          id: finalData.parent,
          depth: 0,
        })

        if (!parentCategory) {
          throw new ApiError(
            `Parent category with ID '${finalData.parent}' not found`,
            422,
            'INVALID_PARENT',
          )
        }

        logger.debug('Parent category verified', 'API:categories', {
          parentId: finalData.parent,
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
      finalData: finalData,
      titleField: finalData.title,
      titleFieldType: typeof finalData.title,
      statusField: finalData.status,
      parentField: finalData.parent,
    })

    // Final validation check before sending to payload
    if (!finalData.title) {
      logger.error(
        'Title field missing after normalization',
        'API:categories',
        new Error('Title field missing'),
      )
      throw new ApiError(
        'Title field is required but missing after processing',
        422,
        'MISSING_TITLE',
      )
    }

    // Create the category
    const result = await payload.create({
      collection: 'categories',
      data: finalData as any, // Type assertion needed due to dynamic field processing
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

export const DELETE = withErrorHandling(async (request: NextRequest) => {
  try {
    const payload = await getPayloadHMR({ config: configPromise })
    const { searchParams } = new URL(request.url)

    // Get category IDs from query parameters
    const categoryIds = searchParams.get('ids')
    const whereParam = searchParams.get('where')
    const force = searchParams.get('force') === 'true'

    let ids: string[] = []

    // Handle different ways IDs can be passed
    if (categoryIds) {
      // Direct IDs parameter
      ids = categoryIds
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0)
    } else if (whereParam) {
      // Parse where parameter for bulk operations (Payload admin format)
      try {
        const whereObj = JSON.parse(decodeURIComponent(whereParam))
        if (whereObj.and && whereObj.and[0] && whereObj.and[0].id && whereObj.and[0].id.in) {
          ids = whereObj.and[0].id.in
        }
      } catch (parseError) {
        logger.warn('Failed to parse where parameter', 'API:categories', parseError as Error)
      }
    } else {
      // Handle URL-encoded where parameters (Payload admin format)
      // Check for where[and][0][id][in][0] pattern
      const whereAnd0IdIn0 = searchParams.get('where[and][0][id][in][0]')
      if (whereAnd0IdIn0) {
        ids = [whereAnd0IdIn0]
        // Check for additional IDs in the pattern where[and][0][id][in][1], etc.
        let index = 1
        while (true) {
          const nextId = searchParams.get(`where[and][0][id][in][${index}]`)
          if (nextId) {
            ids.push(nextId)
            index++
          } else {
            break
          }
        }
      }
    }

    if (ids.length === 0) {
      throw new ApiError('Category IDs are required for deletion', 400, 'MISSING_IDS')
    }

    logger.info('Starting bulk category deletion', 'API:categories', {
      categoryIds: ids,
      force,
      count: ids.length,
    })

    const deletedCategories = []
    const errors = []
    const warnings = []

    // Process each category deletion
    for (const categoryId of ids) {
      try {
        // First, check if category exists
        const existingCategory = await payload.findByID({
          collection: 'categories',
          id: categoryId,
        })

        if (!existingCategory) {
          errors.push(`Category with ID ${categoryId} not found`)
          continue
        }

        // Check for child categories (unless force delete)
        if (!force) {
          const childCategories = await payload.find({
            collection: 'categories',
            where: {
              parent: { equals: categoryId },
            },
            limit: 1,
          })

          if (childCategories.docs.length > 0) {
            errors.push(
              `Cannot delete category '${existingCategory.title}' - it has child categories`,
            )
            continue
          }

          // Check for products in this category
          const productsInCategory = await payload.find({
            collection: 'products',
            where: {
              categories: {
                contains: categoryId,
              },
            },
            limit: 1,
          })

          if (productsInCategory.docs.length > 0) {
            warnings.push(
              `Category '${existingCategory.title}' has products. Consider moving them to another category first.`,
            )
            if (!force) {
              errors.push(`Cannot delete category '${existingCategory.title}' - it has products`)
              continue
            }
          }
        }

        // Delete the category
        const deletedCategory = await payload.delete({
          collection: 'categories',
          id: categoryId,
        })

        deletedCategories.push({
          id: deletedCategory.id,
          title: deletedCategory.title,
        })

        logger.info('Category deleted successfully', 'API:categories', {
          categoryId: deletedCategory.id,
          title: deletedCategory.title,
        })

        // If force delete and there were products, move them to "Uncategorized" or remove category reference
        if (force && existingCategory) {
          try {
            // Find products in this category and remove the category reference
            const productsToUpdate = await payload.find({
              collection: 'products',
              where: {
                categories: {
                  contains: categoryId,
                },
              },
              limit: 1000, // Adjust based on your needs
            })

            for (const product of productsToUpdate.docs) {
              const updatedCategories = Array.isArray(product.categories)
                ? product.categories.filter((cat: any) => cat !== categoryId)
                : []

              await payload.update({
                collection: 'products',
                id: product.id,
                data: {
                  categories: updatedCategories,
                },
              })
            }

            if (productsToUpdate.docs.length > 0) {
              warnings.push(
                `Removed category reference from ${productsToUpdate.docs.length} products`,
              )
            }
          } catch (updateError) {
            logger.error(
              'Error updating products after category deletion',
              'API:categories',
              updateError as Error,
            )
            warnings.push(
              `Failed to update products after deleting category '${existingCategory.title}'`,
            )
          }
        }
      } catch (categoryError) {
        logger.error(
          `Error deleting category ${categoryId}`,
          'API:categories',
          categoryError as Error,
        )
        errors.push(
          `Failed to delete category ${categoryId}: ${categoryError instanceof Error ? categoryError.message : 'Unknown error'}`,
        )
      }
    }

    // Prepare response
    const response = {
      deletedCount: deletedCategories.length,
      deletedCategories,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    }

    if (errors.length > 0 && deletedCategories.length === 0) {
      throw new ApiError(`Failed to delete categories: ${errors.join('; ')}`, 400, 'DELETE_ERROR')
    }

    const message =
      deletedCategories.length === ids.length
        ? 'All categories deleted successfully'
        : `${deletedCategories.length} of ${ids.length} categories deleted successfully`

    return createSuccessResponse(response, 200, message)
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    logger.apiError('Error deleting categories', '/api/categories', error as Error)
    throw new ApiError('Failed to delete categories', 500, 'DELETE_ERROR')
  }
})
