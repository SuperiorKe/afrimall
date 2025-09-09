import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createSuccessResponse, withErrorHandling, ApiError } from '@/utilities/apiResponse'
import { logger } from '@/utilities/logger'

// Add item to cart
export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const { customerId, sessionId, productId, variantId, quantity = 1, currency = 'USD' } = body

    if (!customerId && !sessionId) {
      throw new ApiError('Customer ID or Session ID required', 400, 'MISSING_IDENTIFIER')
    }

    if (!productId) {
      throw new ApiError('Product ID is required', 400, 'MISSING_PRODUCT')
    }

    if (!quantity || quantity < 1) {
      throw new ApiError('Quantity must be at least 1', 400, 'INVALID_QUANTITY')
    }

    // Validate product exists and is active
    let product
    try {
      product = await payload.findByID({
        collection: 'products',
        id: productId,
      })
    } catch (error) {
      throw new ApiError('Product not found', 404, 'PRODUCT_NOT_FOUND')
    }

    if (!product || product.status !== 'active') {
      throw new ApiError('Product not available', 400, 'PRODUCT_UNAVAILABLE')
    }

    // Validate variant if specified
    if (variantId) {
      try {
        const variant = await payload.findByID({
          collection: 'product-variants',
          id: variantId,
        })

        if (!variant || variant.status !== 'active' || variant.product !== productId) {
          throw new ApiError('Invalid variant', 400, 'INVALID_VARIANT')
        }
      } catch (error) {
        throw new ApiError('Variant not found', 404, 'VARIANT_NOT_FOUND')
      }
    }

    // Check inventory
    if (product.inventory?.trackQuantity && !product.inventory?.allowBackorder) {
      const availableQuantity = product.inventory?.quantity || 0
      if (quantity > availableQuantity) {
        throw new ApiError(
          `Insufficient inventory. Only ${availableQuantity} available.`,
          400,
          'INSUFFICIENT_INVENTORY',
        )
      }
    }

    // Find existing cart
    const where: any = {
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
      const currentItems = existingCart.docs[0].items || []

      // Check if item already exists
      const existingItemIndex = currentItems.findIndex((item: any) => {
        // Handle both populated and unpopulated relationships
        const itemProductId = typeof item.product === 'object' ? item.product.id : item.product
        const itemVariantId = typeof item.variant === 'object' ? item.variant.id : item.variant

        // Normalize variantId for comparison (handle undefined vs null)
        const normalizedVariantId = variantId || null
        const normalizedItemVariantId = itemVariantId || null

        return itemProductId === productId && normalizedItemVariantId === normalizedVariantId
      })

      let updatedItems
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        updatedItems = [...currentItems]
        const currentItem = updatedItems[existingItemIndex]
        const newQuantity = currentItem.quantity + quantity
        updatedItems[existingItemIndex] = {
          ...currentItem,
          quantity: newQuantity,
          totalPrice: currentItem.unitPrice * newQuantity,
        }
      } else {
        // Add new item
        const unitPrice = product.price // Use product price as base
        const newItem = {
          product: product, // Use the full product object
          variant: variantId || null,
          quantity,
          unitPrice,
          totalPrice: unitPrice * quantity,
          addedAt: new Date().toISOString(),
        }
        updatedItems = [...currentItems, newItem]
      }

      cart = await payload.update({
        collection: 'shopping-cart',
        id: cartId,
        data: {
          items: updatedItems,
          currency,
          updatedAt: new Date().toISOString(),
        },
      })
    } else {
      // Create new cart
      const unitPrice = product.price // Use product price as base
      const newItem = {
        product: product, // Use the full product object
        variant: variantId || null,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
        addedAt: new Date().toISOString(),
      }

      cart = await payload.create({
        collection: 'shopping-cart',
        data: {
          customer: customerId || undefined,
          sessionId: sessionId || undefined,
          items: [newItem],
          currency,
          status: 'active',
        },
      })
    }

    // Return simple cart data for now
    const simpleCart = {
      id: cart.id,
      items: cart.items || [],
      subtotal: cart.subtotal || 0,
      itemCount: cart.itemCount || 0,
      currency: cart.currency || 'USD',
      customer: cart.customer,
      sessionId: cart.sessionId,
      status: cart.status,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    }

    logger.info('Item added to cart successfully', 'API:cart/items', {
      cartId: cart.id,
      productId,
      variantId,
      quantity,
      customerId,
      sessionId,
    })

    return createSuccessResponse(simpleCart, 200, 'Item added to cart successfully')
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    logger.apiError('Error adding item to cart', '/api/cart/items', error as Error)
    throw new ApiError('Failed to add item to cart', 500, 'ADD_ERROR')
  }
})

// Update cart item quantity
export const PUT = withErrorHandling(async (request: NextRequest) => {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const { customerId, sessionId, productId, variantId, quantity, currency = 'USD' } = body

    if (!customerId && !sessionId) {
      throw new ApiError('Customer ID or Session ID required', 400, 'MISSING_IDENTIFIER')
    }

    if (!productId) {
      throw new ApiError('Product ID is required', 400, 'MISSING_PRODUCT')
    }

    if (quantity === undefined || quantity < 0) {
      throw new ApiError('Valid quantity is required', 400, 'INVALID_QUANTITY')
    }

    // Find existing cart
    const where: any = {
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
      throw new ApiError('Cart not found', 404, 'CART_NOT_FOUND')
    }

    const cartId = existingCart.docs[0].id
    const currentItems = existingCart.docs[0].items || []

    // Debug logging
    logger.info('Debugging cart item update', 'API:cart/items', {
      cartId,
      productId,
      variantId,
      currentItemsCount: currentItems.length,
      currentItems: currentItems.map((item: any) => ({
        product: typeof item.product === 'object' ? item.product.id : item.product,
        variant: typeof item.variant === 'object' ? item.variant.id : item.variant,
        quantity: item.quantity,
      })),
    })

    // Find item to update
    const itemIndex = currentItems.findIndex((item: any) => {
      // Handle both populated and unpopulated relationships
      const itemProductId = typeof item.product === 'object' ? item.product.id : item.product
      const itemVariantId = typeof item.variant === 'object' ? item.variant.id : item.variant

      // Normalize variantId for comparison (handle undefined vs null)
      const normalizedVariantId = variantId || null
      const normalizedItemVariantId = itemVariantId || null

      return itemProductId === productId && normalizedItemVariantId === normalizedVariantId
    })

    if (itemIndex === -1) {
      throw new ApiError('Item not found in cart', 404, 'ITEM_NOT_FOUND')
    }

    let updatedItems
    if (quantity === 0) {
      // Remove item
      updatedItems = currentItems.filter((_: any, index: number) => index !== itemIndex)
    } else {
      // Update quantity
      updatedItems = [...currentItems]
      const currentItem = updatedItems[itemIndex]
      updatedItems[itemIndex] = {
        ...currentItem,
        quantity,
        totalPrice: currentItem.unitPrice * quantity,
      }
    }

    // Update cart
    const cart = await payload.update({
      collection: 'shopping-cart',
      id: cartId,
      data: {
        items: updatedItems,
        currency,
        updatedAt: new Date().toISOString(),
      },
    })

    // Transform and return cart
    const transformedCart = transformCartData(cart)

    logger.info('Cart item updated successfully', 'API:cart/items', {
      cartId: cart.id,
      productId,
      variantId,
      quantity,
      action: quantity === 0 ? 'removed' : 'updated',
      customerId,
      sessionId,
    })

    return createSuccessResponse(transformedCart, 200, 'Cart item updated successfully')
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    logger.apiError('Error updating cart item', '/api/cart/items', error as Error)
    throw new ApiError('Failed to update cart item', 500, 'UPDATE_ERROR')
  }
})

// Remove item from cart
export const DELETE = withErrorHandling(async (request: NextRequest) => {
  try {
    const payload = await getPayload({ config: configPromise })
    const searchParams = request.nextUrl.searchParams

    const customerId = searchParams.get('customerId')
    const sessionId = searchParams.get('sessionId')
    const productId = searchParams.get('productId')
    const variantId = searchParams.get('variantId')

    if (!customerId && !sessionId) {
      throw new ApiError('Customer ID or Session ID required', 400, 'MISSING_IDENTIFIER')
    }

    if (!productId) {
      throw new ApiError('Product ID is required', 400, 'MISSING_PRODUCT')
    }

    // Find existing cart
    const where: any = {
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
      throw new ApiError('Cart not found', 404, 'CART_NOT_FOUND')
    }

    const cartId = existingCart.docs[0].id
    const currentItems = existingCart.docs[0].items || []

    // Debug logging
    logger.info('Debugging cart item removal', 'API:cart/items', {
      cartId,
      productId,
      variantId,
      currentItemsCount: currentItems.length,
      currentItems: currentItems.map((item: any) => ({
        product: typeof item.product === 'object' ? item.product.id : item.product,
        variant: typeof item.variant === 'object' ? item.variant.id : item.variant,
        quantity: item.quantity,
      })),
    })

    // Remove item
    const updatedItems = currentItems.filter((item: any) => {
      // Handle both populated and unpopulated relationships
      const itemProductId = typeof item.product === 'object' ? item.product.id : item.product
      const itemVariantId = typeof item.variant === 'object' ? item.variant.id : item.variant

      // Normalize variantId for comparison (handle undefined vs null)
      const normalizedVariantId = variantId || null
      const normalizedItemVariantId = itemVariantId || null

      return !(itemProductId === productId && normalizedItemVariantId === normalizedVariantId)
    })

    logger.info('Items after removal', 'API:cart/items', {
      updatedItemsCount: updatedItems.length,
      updatedItems: updatedItems.map((item: any) => ({
        product: typeof item.product === 'object' ? item.product.id : item.product,
        variant: typeof item.variant === 'object' ? item.variant.id : item.variant,
        quantity: item.quantity,
      })),
    })

    // If cart becomes empty, we might want to handle it differently
    let cart
    if (updatedItems.length === 0) {
      // Cart is empty, either delete the cart or mark it as abandoned
      try {
        cart = await payload.update({
          collection: 'shopping-cart',
          id: cartId,
          data: {
            items: [],
            status: 'abandoned',
            updatedAt: new Date().toISOString(),
          },
        })
      } catch (updateError) {
        logger.error('Error updating empty cart', 'API:cart/items', updateError as Error)
        // If update fails, try to delete the cart
        try {
          await payload.delete({
            collection: 'shopping-cart',
            id: cartId,
          })
          // Return empty cart response
          return createSuccessResponse(
            {
              id: cartId,
              items: [],
              subtotal: 0,
              itemCount: 0,
              currency: 'USD',
              status: 'abandoned',
            },
            200,
            'Cart item removed successfully',
          )
        } catch (deleteError) {
          logger.error('Error deleting empty cart', 'API:cart/items', deleteError as Error)
          throw new ApiError('Failed to remove cart item', 500, 'REMOVE_ERROR')
        }
      }
    } else {
      // Update cart with remaining items
      cart = await payload.update({
        collection: 'shopping-cart',
        id: cartId,
        data: {
          items: updatedItems,
          updatedAt: new Date().toISOString(),
        },
      })
    }

    // Transform and return cart
    const transformedCart = transformCartData(cart)

    logger.info('Cart item removed successfully', 'API:cart/items', {
      cartId: cart.id,
      productId,
      variantId,
      customerId,
      sessionId,
    })

    return createSuccessResponse(transformedCart, 200, 'Cart item removed successfully')
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    logger.apiError('Error removing cart item', '/api/cart/items', error as Error)
    throw new ApiError('Failed to remove cart item', 500, 'REMOVE_ERROR')
  }
})

// Helper function to transform cart data for frontend
function transformCartData(cart: any) {
  const items =
    cart.items?.map((item: any) => {
      // Handle both populated and unpopulated relationships
      const productId = typeof item.product === 'object' ? item.product.id : item.product
      const variantId = typeof item.variant === 'object' ? item.variant.id : item.variant

      return {
        id: item.id,
        product: {
          id: productId,
          title: typeof item.product === 'object' ? item.product.title : undefined,
          price: typeof item.product === 'object' ? item.product.price : undefined,
          images:
            typeof item.product === 'object'
              ? item.product.images?.map((img: any) => ({
                  url:
                    img.image?.url ||
                    (img.image?.filename ? `/uploads/media/${img.image.filename}` : null),
                  alt: img.alt || img.image?.alt || '',
                })) || []
              : [],
          categories:
            typeof item.product === 'object'
              ? item.product.categories?.map((cat: any) => ({
                  id: cat.id,
                  title: cat.title,
                  slug: cat.slug,
                })) || []
              : [],
        },
        variant:
          typeof item.variant === 'object'
            ? {
                id: variantId,
                title: item.variant.title,
                price: item.variant.price,
              }
            : null,
        quantity: item.quantity,
        unitPrice: item.unitPrice || 0,
        totalPrice: item.totalPrice || 0,
      }
    }) || []

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
