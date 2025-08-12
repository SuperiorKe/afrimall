import { NextRequest } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import {
  createSuccessResponse,
  withErrorHandling,
  ApiError,
} from '@/utilities/apiResponse'
import { logger } from '@/utilities/logger'

export const GET = withErrorHandling(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const payload = await getPayloadHMR({ config: configPromise })
      const { id: orderId } = await params

      if (!orderId) {
        throw new ApiError('Order ID is required', 400, 'MISSING_ORDER_ID')
      }

      // Fetch the order
      const order = await payload.findByID({
        collection: 'orders',
        id: orderId,
      })

      if (!order) {
        throw new ApiError('Order not found', 404, 'ORDER_NOT_FOUND')
      }

      logger.info('Order fetched successfully', 'API:orders/[id]', {
        orderId: order.id,
        status: order.status,
      })

      // Return sanitized order data
      return createSuccessResponse(
        {
          id: order.id,
          total: order.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
          customerEmail: order.customerEmail,
          orderDate: order.createdAt,
          currency: order.currency,
          items: order.items,
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
        },
        200,
        'Order fetched successfully',
      )
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      logger.apiError('Error fetching order', `/api/orders/${orderId}`, error as Error)
      throw new ApiError('Failed to fetch order', 500, 'FETCH_ERROR')
    }
  },
)
