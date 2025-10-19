import { NextRequest } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { createSuccessResponse, withErrorHandling, ApiError } from '@/lib/api/apiResponse'
import { logger } from '@/lib/api/logger'

// Enhanced search endpoint for products
export const GET = withErrorHandling(
  async (request: NextRequest) => {
    try {
      const payload = await getPayloadHMR({ config: configPromise })
      const searchParams = request.nextUrl.searchParams

      // Extract search parameters
      const query = searchParams.get('q') || ''
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '12')
      const category = searchParams.get('category') || ''
      const minPrice = searchParams.get('minPrice')
      const maxPrice = searchParams.get('maxPrice')
      const sortBy = searchParams.get('sortBy') || 'relevance'
      const sortOrder = searchParams.get('sortOrder') || 'desc'

      if (!query.trim()) {
        return createSuccessResponse(
          {
            products: [],
            pagination: {
              totalDocs: 0,
              totalPages: 0,
              page: 1,
              limit,
              hasNextPage: false,
              hasPrevPage: false,
            },
            suggestions: [],
            filters: {
              applied: { query, category, minPrice, maxPrice },
              available: { categories: [], priceRange: { min: 0, max: 1000 } },
            },
          },
          200,
          'No search query provided',
        )
      }

      // Build search query
      const where: Record<string, any> = {
        status: { equals: 'active' },
        or: [
          { title: { contains: query } },
          { description: { contains: query } },
          { sku: { contains: query } },
          { 'tags.tag': { contains: query } },
        ],
      }

      // Add category filter
      if (category) {
        where.categories = { in: [category] }
      }

      // Add price range filter
      if (minPrice || maxPrice) {
        where.price = {}
        if (minPrice) {
          where.price.greater_than_equal = parseFloat(minPrice)
        }
        if (maxPrice) {
          where.price.less_than_equal = parseFloat(maxPrice)
        }
      }

      // Build sort string
      let sortString = 'createdAt'
      if (sortBy === 'price') {
        sortString = 'price'
      } else if (sortBy === 'title') {
        sortString = 'title'
      } else if (sortBy === 'relevance') {
        // For relevance, we'll use a combination of featured and creation date
        sortString = 'featured'
      }

      const finalSortString = `${sortOrder === 'desc' ? '-' : ''}${sortString}`

      // Fetch products
      const result = await payload.find({
        collection: 'products',
        where: where as any,
        limit,
        page,
        sort: finalSortString,
        populate: {
          categories: true,
          images: true,
          tags: true,
        } as any,
      })

      // Transform products for frontend
      const transformedProducts = result.docs.map((product: any) => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        sku: product.sku,
        slug: product.slug,
        images: product.images?.map((img: any) => ({
          id: img.id,
          url: img.image?.filename ? `/uploads/media/${img.image.filename}` : null,
          alt: img.alt || img.image?.alt || '',
          width: img.image?.width || 800,
          height: img.image?.height || 600,
        })) || [],
        categories: product.categories?.map((cat: any) => ({
          id: cat.id,
          title: cat.title,
          slug: cat.slug,
        })) || [],
        tags: product.tags?.map((tag: any) => ({
          id: tag.id,
          tag: tag.tag,
        })) || [],
        featured: product.featured,
        inventory: {
          trackQuantity: product.inventory?.trackQuantity || false,
          quantity: product.inventory?.quantity || 0,
          allowBackorder: product.inventory?.allowBackorder || false,
        },
      }))

      // Generate search suggestions
      const suggestions = await generateSearchSuggestions(payload, query)

      // Get available filters
      const availableCategories = await getAvailableCategories(payload)
      const priceRange = await getPriceRange(payload)

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

      logger.info('Search completed successfully', 'API:search', {
        query,
        totalResults: result.totalDocs,
        page,
        limit,
        category,
        filters: { minPrice, maxPrice, sortBy, sortOrder },
      })

      return createSuccessResponse(
        {
          products: transformedProducts,
          pagination,
          suggestions,
          filters: {
            applied: { query, category, minPrice, maxPrice, sortBy, sortOrder },
            available: { categories: availableCategories, priceRange },
          },
        },
        200,
        'Search completed successfully',
      )
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      logger.apiError('Error performing search', '/api/search', error as Error)
      throw new ApiError('Failed to perform search', 500, 'SEARCH_ERROR')
    }
  },
)

// Helper function to generate search suggestions
async function generateSearchSuggestions(payload: any, query: string) {
  try {
    // Get popular search terms from products
    const popularTerms = await payload.find({
      collection: 'products',
      where: {
        status: { equals: 'active' },
        or: [
          { title: { contains: query } },
          { 'tags.tag': { contains: query } },
        ],
      },
      limit: 5,
      fields: ['title', 'tags'],
    })

    const suggestions = new Set<string>()

    // Add title-based suggestions
    popularTerms.docs.forEach((product: any) => {
      if (product.title) {
        const words = product.title.toLowerCase().split(' ')
        words.forEach((word: string) => {
          if (word.includes(query.toLowerCase()) && word.length > 2) {
            suggestions.add(word)
          }
        })
      }
    })

    // Add tag-based suggestions
    popularTerms.docs.forEach((product: any) => {
      if (product.tags) {
        product.tags.forEach((tag: any) => {
          if (tag.tag && tag.tag.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(tag.tag)
          }
        })
      }
    })

    return Array.from(suggestions).slice(0, 8)
  } catch (error) {
    logger.warn('Failed to generate search suggestions', 'API:search', error as Error)
    return []
  }
}

// Helper function to get available categories
async function getAvailableCategories(payload: any) {
  try {
    const categories = await payload.find({
      collection: 'categories',
      where: { status: { equals: 'active' } },
      sort: 'sortOrder',
      limit: 100,
      fields: ['id', 'title', 'slug'],
    })

    return categories.docs.map((cat: any) => ({
      id: cat.id,
      title: cat.title,
      slug: cat.slug,
    }))
  } catch (error) {
    logger.warn('Failed to fetch categories for search filters', 'API:search', error as Error)
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
    logger.warn('Failed to fetch price range for search', 'API:search', error as Error)
    return { min: 0, max: 1000 }
  }
}
