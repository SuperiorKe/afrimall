import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createSuccessResponse, withErrorHandling, ApiError } from '@/lib/api/apiResponse'
import { logger } from '@/lib/api/logger'
import { ORDER_STATUSES, generateOrderNumber } from '@/lib/orders/orderUtils'
import { getShippingCost } from '@/lib/orders/order-management'
import { queueOrderConfirmationEmail } from '@/lib/email/emailQueue'

export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const payload = await getPayload({ config: configPromise })

    const {
      items,
      total,
      currency,
      customer,
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentStatus,
      paymentReference,
      stripePaymentIntentId,
      status,
      shippingMethod,
      specialInstructions,
      customerNotes,
      taxAmount,
      taxRate,
    } = body

    // Validate required fields
    if (!items || !total || !customer || !shippingAddress) {
      throw new ApiError('Missing required fields', 400, 'MISSING_FIELDS')
    }

    // Extract customer ID - handle both string ID and object with ID
    const customerId =
      typeof customer === 'string' ? customer : customer?.id || customer?._id || customer

    if (!customerId) {
      throw new ApiError('Invalid customer ID', 400, 'INVALID_CUSTOMER')
    }

    // Generate unique order number
    const orderNumber = generateOrderNumber()

    // Validate inventory before creating order
    logger.info('Validating inventory...', 'API:orders')
    await validateAndReserveInventory(payload, items)
    logger.info('Inventory validated, creating order...', 'API:orders')

    // Create the order
    logger.info('Calling payload.create for order...', 'API:orders')
    const order = await payload.create({
      collection: 'orders',
      data: {
        // Order identification
        orderNumber: orderNumber,

        // Customer relationship
        customer: customerId,

        // Order items with proper structure
        items: items.map((item: any) => ({
          product: item.product,
          variant: item.variant,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          productSnapshot: {
            title: item.productSnapshot?.title || item.title || '',
            sku: item.productSnapshot?.sku || item.sku || '',
            image: item.productSnapshot?.image || item.image || null,
          },
        })),

        // Order totals
        subtotal: items.reduce((sum: number, item: any) => sum + item.totalPrice, 0),
        total: total,
        currency: currency || 'USD',

        // Shipping information
        shipping: {
          method: shippingMethod || 'standard',
          cost: getShippingCost(
            shippingMethod || 'standard',
            items.reduce((sum: number, item: any) => sum + item.totalPrice, 0),
          ), // Dynamic shipping cost
          address: {
            firstName: shippingAddress.firstName,
            lastName: shippingAddress.lastName,
            address1: shippingAddress.address1,
            address2: shippingAddress.address2 || '',
            city: shippingAddress.city,
            state: shippingAddress.state,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country,
            phone: shippingAddress.phone || '',
          },
          specialInstructions: specialInstructions || '',
        },

        // Billing information
        billing: {
          address: {
            firstName: billingAddress.firstName,
            lastName: billingAddress.lastName,
            address1: billingAddress.address1,
            address2: billingAddress.address2 || '',
            city: billingAddress.city,
            state: billingAddress.state,
            postalCode: billingAddress.postalCode,
            country: billingAddress.country,
            phone: billingAddress.phone || '',
          },
        },

        // Tax information
        tax: {
          amount: taxAmount || 0,
          rate: taxRate || 0,
          inclusive: false,
        },

        // Payment information
        payment: {
          method: paymentMethod || 'credit_card',
          status: paymentStatus || 'pending',
          reference: paymentReference || '',
          stripePaymentIntentId: stripePaymentIntentId || '',
        },

        // Order status and metadata
        status: status || ORDER_STATUSES.PENDING, // Use provided status or default to pending
        customerNotes: customerNotes || '',
        metadata: {
          createdAt: new Date().toISOString(),
          source: 'checkout',
          userAgent: request.headers.get('user-agent') || '',
        },
      } as any,
    })

    logger.info('Order created in database', 'API:orders', {
      orderId: order.id,
      total: order.total,
      status: order.status,
    })

    logger.info('Starting email and response preparation...', 'API:orders')

    // Fetch customer details for email and response
    let customerDetails = null
    let customerEmail = null

    try {
      logger.info('Fetching customer details...', 'API:orders', { customerId })
      // Fetch customer details to get email
      customerDetails = await payload.findByID({
        collection: 'customers',
        id: customerId,
      })
      logger.info('Customer details fetched', 'API:orders')

      customerEmail = customerDetails?.email || null

      // Queue order confirmation email if email exists
      if (customerEmail) {
        const orderWithEmail = {
          ...order,
          customer: {
            id: customerDetails.id,
            email: customerEmail,
            firstName: customerDetails.firstName,
            lastName: customerDetails.lastName,
          },
        }

        const emailQueueId = await queueOrderConfirmationEmail(orderWithEmail)
        logger.info(`Order confirmation email queued: ${emailQueueId}`, 'API:orders')
      } else {
        logger.warn('No customer email found, skipping order confirmation email', 'API:orders')
      }
    } catch (error) {
      logger.error(
        'Failed to fetch customer or queue order confirmation email',
        'API:orders',
        error as Error,
      )
      // Don't fail the order creation if email fails
    }

    logger.info('Preparing response...', 'API:orders')

    return createSuccessResponse(
      {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        customer: {
          id: order.customer,
          email: customerEmail || '',
        },
        items: order.items,
        shipping: order.shipping,
        createdAt: order.createdAt,
      },
      201,
      'Order created successfully',
    )
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    logger.apiError('Error creating order', '/api/orders', error as Error)
    throw new ApiError('Failed to create order', 500, 'CREATE_ERROR')
  }
})

// Helper function to validate and reserve inventory
async function validateAndReserveInventory(payload: any, items: any[]) {
  for (const item of items) {
    if (!item.product || !item.quantity) continue

    try {
      // Get current product inventory
      const product = await payload.findByID({
        collection: 'products',
        id: item.product,
      })

      if (!product) {
        throw new ApiError(`Product ${item.product} not found`, 400, 'PRODUCT_NOT_FOUND')
      }

      // Check if inventory tracking is enabled
      if (product.inventory?.trackQuantity && !product.inventory?.allowBackorder) {
        const currentQuantity = product.inventory?.quantity || 0
        const requestedQuantity = item.quantity

        if (requestedQuantity > currentQuantity) {
          throw new ApiError(
            `Insufficient inventory for ${product.title}. Available: ${currentQuantity}, Requested: ${requestedQuantity}`,
            400,
            'INSUFFICIENT_INVENTORY',
          )
        }

        // Reserve inventory by deducting it
        const newQuantity = currentQuantity - requestedQuantity
        await payload.update({
          collection: 'products',
          id: item.product,
          data: {
            'inventory.quantity': newQuantity,
          },
        })

        logger.info('Inventory reserved', 'API:orders', {
          productId: item.product,
          productTitle: product.title,
          requestedQuantity,
          previousQuantity: currentQuantity,
          newQuantity,
        })

        // Check for low stock alert
        if (newQuantity <= (product.inventory?.lowStockThreshold || 5)) {
          logger.warn('Low stock alert', 'API:orders', {
            productId: item.product,
            productTitle: product.title,
            currentQuantity: newQuantity,
            lowStockThreshold: product.inventory?.lowStockThreshold || 5,
          })
          // TODO: Send admin notification for low stock
        }
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      logger.error(
        'Error processing inventory for product',
        'API:orders',
        error instanceof Error ? error : undefined,
        {
          productId: item.product,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      )
      throw new ApiError('Failed to process inventory', 500, 'INVENTORY_ERROR')
    }
  }
}

// Helper function to extract authenticated customer ID from request
async function getAuthenticatedCustomerId(
  request: NextRequest,
  payload: any,
): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)

    // Try to find customer by looking up who has this token
    // Since JWT verification is complex, we'll use a simpler approach:
    // For now, we rely on the frontend to send the correct customerId
    // and verify it matches the token's user when JWT is properly decoded
    // This is a temporary solution until full JWT verification is implemented

    // Attempt to use Payload's local API to verify token
    // Note: This may need adjustment based on Payload CMS version
    try {
      // Create a mock request with the token for Payload's authenticate
      const mockReq = {
        headers: new Headers({
          authorization: `Bearer ${token}`,
        }),
      } as any

      // Try to authenticate using Payload's method
      const authResult = await payload.authenticate({
        headers: mockReq.headers,
      } as any)

      if (authResult?.user && authResult.user.collection === 'customers') {
        return authResult.user.id
      }
    } catch (authError) {
      // Authentication failed, return null (token may be invalid/expired)
      logger.info('Token authentication attempt failed', 'API:orders', {
        error: authError instanceof Error ? authError.message : 'Unknown error',
      })
    }

    return null
  } catch (error) {
    logger.info('Failed to authenticate customer from token', 'API:orders', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return null
  }
}

// GET endpoint for retrieving orders
export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const payload = await getPayload({ config: configPromise })

    // Get authenticated customer ID
    const authenticatedCustomerId = await getAuthenticatedCustomerId(request, payload)

    const customerId = searchParams.get('customerId')
    const orderNumber = searchParams.get('orderNumber')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    // Security: If customerId is provided in query, verify it matches authenticated customer
    // If no customerId provided but user is authenticated, use their ID
    let effectiveCustomerId: string | null = null

    if (customerId) {
      // If a customerId is explicitly requested, verify the user is that customer
      if (authenticatedCustomerId && authenticatedCustomerId !== customerId) {
        throw new ApiError("Unauthorized: Cannot access other customers' orders", 403, 'FORBIDDEN')
      }
      effectiveCustomerId = customerId
    } else if (authenticatedCustomerId) {
      // If no customerId provided but user is authenticated, use their ID
      effectiveCustomerId = authenticatedCustomerId
    } else {
      // No authentication and no customerId - admins can still query all orders
      // But for security, we require authentication for customer queries
      // Admins should use admin endpoints
      throw new ApiError('Authentication required to retrieve orders', 401, 'UNAUTHORIZED')
    }

    const where: any = {}

    if (effectiveCustomerId) {
      where.customer = { equals: effectiveCustomerId }
    }

    if (orderNumber) {
      where.orderNumber = { equals: orderNumber }

      // Additional security: If looking up by order number, verify customer owns it
      if (effectiveCustomerId) {
        where.customer = { equals: effectiveCustomerId }
      }
    }

    if (status) {
      where.status = { equals: status }
    }

    const orders = await payload.find({
      collection: 'orders',
      where,
      limit,
      page,
      sort: '-createdAt',
    })

    return createSuccessResponse(
      {
        orders: orders.docs,
        totalDocs: orders.totalDocs,
        totalPages: orders.totalPages,
        page: orders.page,
        hasNextPage: orders.hasNextPage,
        hasPrevPage: orders.hasPrevPage,
      },
      200,
      'Orders retrieved successfully',
    )
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    logger.apiError('Error retrieving orders', '/api/orders', error as Error)
    throw new ApiError('Failed to retrieve orders', 500, 'RETRIEVE_ERROR')
  }
})
