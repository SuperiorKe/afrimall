import { NextRequest } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { createSuccessResponse, withErrorHandling, ApiError } from '@/utilities/apiResponse'
import { logger } from '@/utilities/logger'

// GET cart by customer ID or session ID
export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    const payload = await getPayloadHMR({ config: configPromise })
    const searchParams = request.nextUrl.searchParams

    const customerId = searchParams.get('customerId')
    const sessionId = searchParams.get('sessionId')

    if (!customerId && !sessionId) {
      throw new ApiError('Customer ID or Session ID required', 400, 'MISSING_IDENTIFIER')
    }

    // Build where clause
    const where: Record<string, unknown> = {
      status: { equals: 'active' },
    }

    if (customerId) {
      where.customer = { equals: customerId }
    } else {
      where.sessionId = { equals: sessionId }
    }

    const result = await payload.find({
      collection: 'shopping-cart',
      where,
      limit: 1,
      populate: {
        customer: true,
        'items.product': true,
        'items.variant': true,
      },
    })

    const cart = result.docs[0] || null

    logger.info('Cart fetched successfully', 'API:cart', {
      customerId,
      sessionId,
      hasCart: !!cart,
    })

    return createSuccessResponse(cart, 200, 'Cart fetched successfully')
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    logger.apiError('Error fetching cart', '/api/cart', error as Error)
    throw new ApiError('Failed to fetch cart', 500, 'FETCH_ERROR')
  }
})

// CREATE or UPDATE cart
export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const payload = await getPayloadHMR({ config: configPromise })
    const body = await request.json()

    const { customerId, sessionId, items, currency = 'USD' } = body

    if (!customerId && !sessionId) {
      throw new ApiError('Customer ID or Session ID required', 400, 'MISSING_IDENTIFIER')
    }

    // Find existing cart
    const where: Record<string, unknown> = {
      status: { equals: 'active' },
    }

    if (customerId) {
      where.customer = { equals: customerId }
    } else {
      where.sessionId = { equals: sessionId }
    }

    const existingCart = await payload.find({
      collection: 'shopping-cart',
      where,
      limit: 1,
    })

    let cart
    if (existingCart.docs.length > 0) {
      // Update existing cart
      cart = await payload.update({
        collection: 'shopping-cart',
        id: existingCart.docs[0].id,
        data: {
          items,
          currency,
        },
      })
    } else {
      // Create new cart
      const cartData: Record<string, unknown> = {
        items,
        currency,
        status: 'active',
      }

      if (customerId) {
        cartData.customer = customerId
      } else {
        cartData.sessionId = sessionId
      }

      cart = await payload.create({
        collection: 'shopping-cart',
        data: cartData,
      })
    }

    logger.info('Cart updated successfully', 'API:cart', {
      customerId,
      sessionId,
      hasCart: !!cart,
    })

    return createSuccessResponse(cart, 200, 'Cart updated successfully')
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    logger.apiError('Error updating cart', '/api/cart', error as Error)
    throw new ApiError('Failed to update cart', 500, 'UPDATE_ERROR')
  }
})
