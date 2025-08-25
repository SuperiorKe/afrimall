import { NextRequest } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import {
  createSuccessResponse,
  withErrorHandling,
  ApiError,
} from '@/utilities/apiResponse'
import { logger } from '@/utilities/logger'
import { ORDER_STATUSES } from '@/utilities/orderUtils'

// GET endpoint for retrieving a specific order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const payload = await getPayloadHMR({ config: configPromise })
      const { id: orderId } = await params

      const order = await payload.findByID({
        collection: 'orders',
        id: orderId,
      })

      if (!order) {
        throw new ApiError('Order not found', 404, 'NOT_FOUND')
      }

      return createSuccessResponse(
        {
          order,
        },
        200,
        'Order retrieved successfully',
      )
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      const { id } = await params
      logger.apiError('Error retrieving order', `/api/orders/${id}`, error as Error)
      throw new ApiError('Failed to retrieve order', 500, 'RETRIEVE_ERROR')
    }
  })(request, { params })
}

// PATCH endpoint for updating order status and other fields
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const body = await request.json()
      const payload = await getPayloadHMR({ config: configPromise })
      const { id: orderId } = await params

      const {
        status,
        paymentStatus,
        shippingStatus,
        trackingNumber,
        customerNotes,
        adminNotes,
      } = body

      // Validate status if provided
      if (status && !Object.values(ORDER_STATUSES).includes(status)) {
        throw new ApiError('Invalid order status', 400, 'INVALID_STATUS')
      }

      // Prepare update data
      const updateData: any = {}

      if (status) {
        updateData.status = status
      }

      if (paymentStatus) {
        updateData['payment.status'] = paymentStatus
      }

      if (shippingStatus) {
        updateData['shipping.status'] = shippingStatus
      }

      if (trackingNumber) {
        updateData['shipping.trackingNumber'] = trackingNumber
      }

      if (customerNotes !== undefined) {
        updateData.customerNotes = customerNotes
      }

      if (adminNotes !== undefined) {
        updateData.adminNotes = adminNotes
      }

      // Add metadata
      updateData.metadata = {
        updatedAt: new Date().toISOString(),
        updatedBy: 'system', // In a real app, this would be the user ID
      }

      const updatedOrder = await payload.update({
        collection: 'orders',
        id: orderId,
        data: updateData,
      })

      logger.info('Order updated successfully', 'API:orders:update', {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        updatedFields: Object.keys(updateData),
      })

      return createSuccessResponse(
        {
          order: updatedOrder,
        },
        200,
        'Order updated successfully',
      )
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      const { id } = await params
      logger.apiError('Error updating order', `/api/orders/${id}`, error as Error)
      throw new ApiError('Failed to update order', 500, 'UPDATE_ERROR')
    }
  })(request, { params })
}

// DELETE endpoint for cancelling an order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const payload = await getPayloadHMR({ config: configPromise })
      const { id: orderId } = await params

      // Get the order first to check if it can be cancelled
      const order = await payload.findByID({
        collection: 'orders',
        id: orderId,
      })

      if (!order) {
        throw new ApiError('Order not found', 404, 'NOT_FOUND')
      }

      // Check if order can be cancelled (not shipped or delivered)
      if (['shipped', 'delivered'].includes(order.status)) {
        throw new ApiError('Cannot cancel order that has been shipped or delivered', 400, 'INVALID_OPERATION')
      }

      // Update order status to cancelled
      const cancelledOrder = await payload.update({
        collection: 'orders',
        id: orderId,
        data: {
          status: ORDER_STATUSES.CANCELLED,
        },
      })

      logger.info('Order cancelled successfully', 'API:orders:cancel', {
        orderId: cancelledOrder.id,
        orderNumber: cancelledOrder.orderNumber,
      })

      return createSuccessResponse(
        {
          order: cancelledOrder,
        },
        200,
        'Order cancelled successfully',
      )
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      const { id } = await params
      logger.apiError('Error cancelling order', `/api/orders/${id}`, error as Error)
      throw new ApiError('Failed to cancel order', 500, 'CANCEL_ERROR')
    }
  })(request, { params })
}
