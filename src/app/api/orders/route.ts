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
    } = body

    // Validate required fields
    if (!items || !total || !customer || !shippingAddress) {
      throw new ApiError('Missing required fields', 400, 'MISSING_FIELDS')
    }

    // Create the order
    const order = await payload.create({
      collection: 'orders',
      data: {
        // Order items (you may need to adjust this based on your Orders collection structure)
        items: items.map((item: any) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),

        // Order totals
        subtotal: items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
        total: total,
        currency: currency || 'USD',

        // Customer information
        customerEmail: customer.email,
        customerPhone: customer.phone,

        // Shipping address
        shippingAddress: {
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          address1: shippingAddress.address1,
          address2: shippingAddress.address2 || '',
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
        },

        // Billing address
        billingAddress: {
          firstName: billingAddress.firstName,
          lastName: billingAddress.lastName,
          address1: billingAddress.address1,
          address2: billingAddress.address2 || '',
          city: billingAddress.city,
          state: billingAddress.state,
          postalCode: billingAddress.postalCode,
          country: billingAddress.country,
        },

        // Payment information
        paymentMethod: paymentMethod || 'credit_card',
        paymentStatus: paymentStatus || 'pending',
        paymentReference: paymentReference,
        stripePaymentIntentId: stripePaymentIntentId,

        // Order status
        status: status || 'pending',

        // Timestamps
        orderDate: new Date().toISOString(),
      },
    })

    logger.info('Order created successfully', 'API:orders', {
      orderId: order.id,
      total: order.total,
      status: order.status,
    })

    return createSuccessResponse(
      {
        id: order.id,
        orderNumber: order.id, // You might want to generate a custom order number
        total: order.total,
        status: order.status,
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
