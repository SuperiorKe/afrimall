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

export const GET = withErrorHandling(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params
      const payload = await getPayloadHMR({ config: configPromise })

      const product = await payload.findByID({
        collection: 'products',
        id,
        populate: {
          categories: true,
          images: true,
        },
      })

      if (!product || product.status !== 'active') {
        throw new ApiError('Product not found', 404, 'PRODUCT_NOT_FOUND')
      }

      // Get product variants
      const variants = await payload.find({
        collection: 'product-variants',
        where: {
          product: { equals: id },
          status: { equals: 'active' },
        },
        populate: {
          images: true,
        },
      })

      // Get related products (same category)
      const relatedProducts = await payload.find({
        collection: 'products',
        where: {
          and: [
            { status: { equals: 'active' } },
            { id: { not_equals: id } },
            { categories: { in: product.categories?.map((cat: any) => cat.id) || [] } },
          ],
        },
        limit: 4,
        populate: {
          categories: true,
          images: true,
        },
      })

      logger.info('Product fetched successfully', 'API:products/[id]', {
        productId: id,
        hasVariants: variants.docs.length > 0,
        relatedProductsCount: relatedProducts.docs.length,
      })

      return createSuccessResponse(
        {
          product,
          variants: variants.docs,
          relatedProducts: relatedProducts.docs,
        },
        200,
        'Product fetched successfully',
      )
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      logger.apiError('Error fetching product', `/api/products/${id}`, error as Error)
      throw new ApiError('Failed to fetch product', 500, 'FETCH_ERROR')
    }
  },
)
