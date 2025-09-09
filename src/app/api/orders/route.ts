import { NextRequest } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { createSuccessResponse, withErrorHandling, ApiError } from '@/utilities/apiResponse'
import { logger } from '@/utilities/logger'
import { ORDER_STATUSES, generateOrderNumber } from '@/utilities/orderUtils'

export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const payload = await getPayloadHMR({ config: configPromise })

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
    } = body

    // Validate required fields
    if (!items || !total || !customer || !shippingAddress) {
      throw new ApiError('Missing required fields', 400, 'MISSING_FIELDS')
    }

    // Generate unique order number
    const orderNumber = generateOrderNumber()

    // Create the order
    const order = await payload.create({
      collection: 'orders',
      data: {
        // Order identification
        orderNumber: orderNumber,

        // Customer relationship
        customer: customer,

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
          cost: 9.99, // Default shipping cost
          address: {
            firstName: shippingAddress.firstName,
            lastName: shippingAddress.lastName,
            address1: shippingAddress.address1,
            address2: shippingAddress.address2 || '',
            city: shippingAddress.city,
            state: shippingAddress.state,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country,
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
          },
        },

        // Payment information
        payment: {
          method: paymentMethod || 'credit_card',
          status: paymentStatus || 'pending',
          reference: paymentReference || '',
          stripePaymentIntentId: stripePaymentIntentId || '',
        },

        // Order status and metadata
        status: ORDER_STATUSES.CONFIRMED, // Start with confirmed since payment is successful
        customerNotes: customerNotes || '',
        metadata: {
          createdAt: new Date().toISOString(),
          source: 'checkout',
          userAgent: request.headers.get('user-agent') || '',
        },
      } as any,
    })

    logger.info('Order created successfully', 'API:orders', {
      orderId: order.id,
      total: order.total,
      status: order.status,
    })

    return createSuccessResponse(
      {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        customer: {
          id: order.customer,
          email: customer.email,
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

// GET endpoint for retrieving orders
export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const payload = await getPayloadHMR({ config: configPromise })

    const customerId = searchParams.get('customerId')
    const orderNumber = searchParams.get('orderNumber')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    const where: any = {}

    if (customerId) {
      where.customer = { equals: customerId }
    }

    if (orderNumber) {
      where.orderNumber = { equals: orderNumber }
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
