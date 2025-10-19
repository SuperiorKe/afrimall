import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createSuccessResponse, withErrorHandling, ApiError } from '@/lib/api/apiResponse'
import { logger } from '@/lib/api/logger'
import type { Where } from 'payload'
import type { ShoppingCartSelect } from '@/payload-types'

// GET cart by customer ID or session ID
export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    const payload = await getPayload({ config: configPromise })
    const searchParams = request.nextUrl.searchParams

    const customerId = searchParams.get('customerId')
    const sessionId = searchParams.get('sessionId')

    if (!customerId && !sessionId) {
      throw new ApiError('Customer ID or Session ID required', 400, 'MISSING_IDENTIFIER')
    }

    // Build where clause
    const where: Where = {
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
        'items.product': {
          populate: {
            images: true,
            categories: true,
          },
        },
        'items.variant': true,
      } as any,
    })

    const cart = result.docs[0] || null

    // Transform cart data for frontend
    const transformedCart = cart ? transformCartData(cart) : null

    logger.info('Cart fetched successfully', 'API:cart', {
      customerId,
      sessionId,
      hasCart: !!cart,
      itemCount: cart?.items?.length || 0,
    })

    return createSuccessResponse(transformedCart, 200, 'Cart fetched successfully')
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
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const { customerId, sessionId, items, currency = 'USD', action = 'update' } = body

    if (!customerId && !sessionId) {
      throw new ApiError('Customer ID or Session ID required', 400, 'MISSING_IDENTIFIER')
    }

    if (!items || !Array.isArray(items)) {
      throw new ApiError('Items array is required', 400, 'INVALID_ITEMS')
    }

    // Validate items
    const validationResult = await validateCartItems(payload, items)
    if (!validationResult.isValid) {
      throw new ApiError(
        `Item validation failed: ${validationResult.errors.join(', ')}`,
        422,
        'VALIDATION_ERROR',
      )
    }

    // Find existing cart
    const where: Where = {
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
      const cartId = existingCart.docs[0].id

      if (action === 'clear') {
        // Clear cart
        cart = await payload.update({
          collection: 'shopping-cart',
          id: cartId,
          data: {
            items: [],
            currency,
            updatedAt: new Date().toISOString(),
          },
        })
      } else {
        // Update cart with new items
        cart = await payload.update({
          collection: 'shopping-cart',
          id: cartId,
          data: {
            items,
            currency,
            updatedAt: new Date().toISOString(),
          },
        })
      }
    } else {
      // Create new cart
      cart = await payload.create({
        collection: 'shopping-cart',
        data: {
          customer: customerId || undefined,
          sessionId: sessionId || undefined,
          items,
          currency,
          status: 'active',
        },
      })
    }

    // Transform and return cart
    const transformedCart = transformCartData(cart)

    logger.info('Cart updated successfully', 'API:cart', {
      cartId: cart.id,
      customerId,
      sessionId,
      action,
      itemCount: items.length,
    })

    return createSuccessResponse(transformedCart, 200, 'Cart updated successfully')
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    logger.apiError('Error updating cart', '/api/cart', error as Error)
    throw new ApiError('Failed to update cart', 500, 'UPDATE_ERROR')
  }
})

// DELETE cart (clear items)
export const DELETE = withErrorHandling(async (request: NextRequest) => {
  try {
    const payload = await getPayload({ config: configPromise })
    const searchParams = request.nextUrl.searchParams

    const customerId = searchParams.get('customerId')
    const sessionId = searchParams.get('sessionId')

    if (!customerId && !sessionId) {
      throw new ApiError('Customer ID or Session ID required', 400, 'MISSING_IDENTIFIER')
    }

    // Build where clause
    const where: Where = {
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

    if (existingCart.docs.length === 0) {
      return createSuccessResponse({ message: 'Cart not found' }, 200, 'Cart not found')
    }

    // Clear cart items
    const cart = await payload.update({
      collection: 'shopping-cart',
      id: existingCart.docs[0].id,
      data: {
        items: [],
        updatedAt: new Date().toISOString(),
      },
    })

    logger.info('Cart cleared successfully', 'API:cart', {
      cartId: cart.id,
      customerId,
      sessionId,
    })

    return createSuccessResponse(
      { message: 'Cart cleared successfully' },
      200,
      'Cart cleared successfully',
    )
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    logger.apiError('Error clearing cart', '/api/cart', error as Error)
    throw new ApiError('Failed to clear cart', 500, 'CLEAR_ERROR')
  }
})

// Helper function to validate cart items
async function validateCartItems(payload: any, items: any[]) {
  const errors: string[] = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    // Check required fields
    if (!item.product) {
      errors.push(`Item ${i + 1}: Product is required`)
      continue
    }

    if (!item.quantity || item.quantity < 1) {
      errors.push(`Item ${i + 1}: Quantity must be at least 1`)
      continue
    }

    // Validate product exists and is active
    try {
      const product = await payload.findByID({
        collection: 'products',
        id: item.product,
      })

      if (!product || product.status !== 'active') {
        errors.push(`Item ${i + 1}: Product not found or inactive`)
        continue
      }

      // Check inventory if tracking is enabled
      if (product.inventory?.trackQuantity && !product.inventory?.allowBackorder) {
        const availableQuantity = product.inventory?.quantity || 0
        if (item.quantity > availableQuantity) {
          errors.push(`Item ${i + 1}: Insufficient inventory (${availableQuantity} available)`)
        }
      }

      // Validate variant if specified
      if (item.variant) {
        try {
          const variant = await payload.findByID({
            collection: 'product-variants',
            id: item.variant,
          })

          if (!variant || variant.status !== 'active' || variant.product !== item.product) {
            errors.push(`Item ${i + 1}: Invalid variant`)
          }
        } catch (variantError) {
          errors.push(`Item ${i + 1}: Variant not found`)
        }
      }
    } catch (productError) {
      errors.push(`Item ${i + 1}: Product not found`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Helper function to transform cart data for frontend
function transformCartData(cart: any) {
  const items =
    cart.items?.map((item: any) => ({
      id: item.id,
      product: {
        id: item.product?.id,
        title: item.product?.title,
        price: item.product?.price,
        sku: item.product?.sku,
        images:
          item.product?.images?.map((img: any) => ({
            url:
              img.image?.url ||
              (img.image?.filename ? `/uploads/media/${img.image.filename}` : null),
            alt: img.alt || img.image?.alt || '',
          })) || [],
        categories:
          item.product?.categories?.map((cat: any) => ({
            id: cat.id,
            title: cat.title,
            slug: cat.slug,
          })) || [],
      },
      variant: item.variant
        ? {
            id: item.variant.id,
            title: item.variant.title,
            price: item.variant.price,
          }
        : null,
      quantity: item.quantity,
      unitPrice: item.variant?.price || item.product?.price || 0,
      totalPrice: (item.variant?.price || item.product?.price || 0) * item.quantity,
    })) || []

  const subtotal = items.reduce((sum: number, item: any) => sum + item.totalPrice, 0)
  const itemCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0)

  return {
    id: cart.id,
    items,
    subtotal,
    itemCount,
    currency: cart.currency || 'USD',
    customer: cart.customer,
    sessionId: cart.sessionId,
    status: cart.status,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  }
}
