import { NextRequest } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { createSuccessResponse, withErrorHandling, ApiError } from '@/lib/api/apiResponse'
import { logger } from '@/lib/api/logger'
import { ORDER_STATUSES, generateTrackingNumber } from '@/lib/orders/orderUtils'
import { queueOrderUpdateEmail } from '@/lib/email/emailQueue'

// POST endpoint for bulk order operations
export async function POST(request: NextRequest) {
  return withErrorHandling(async (request: NextRequest) => {
    try {
      const body = await request.json()
      const payload = await getPayloadHMR({ config: configPromise })

      const { operation, orderIds, data = {}, notifyCustomers = true } = body

      // Validate required fields
      if (!operation) {
        throw new ApiError('Operation is required', 400, 'MISSING_OPERATION')
      }

      if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        throw new ApiError('Order IDs array is required', 400, 'MISSING_ORDER_IDS')
      }

      if (orderIds.length > 100) {
        throw new ApiError('Cannot process more than 100 orders at once', 400, 'TOO_MANY_ORDERS')
      }

      const results = {
        successful: [] as any[],
        failed: [] as any[],
        total: orderIds.length,
      }

      // Process each order
      for (const orderId of orderIds) {
        try {
          const result = await processBulkOperation(
            payload,
            orderId,
            operation,
            data,
            notifyCustomers,
          )
          results.successful.push(result)
        } catch (error) {
          results.failed.push({
            orderId,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      logger.info('Bulk operation completed', 'API:orders:bulk', {
        operation,
        totalOrders: orderIds.length,
        successful: results.successful.length,
        failed: results.failed.length,
      })

      return createSuccessResponse(
        {
          results,
        },
        200,
        `Bulk operation completed: ${results.successful.length}/${results.total} successful`,
      )
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      logger.apiError('Error in bulk operation', '/api/orders/bulk', error as Error)
      throw new ApiError('Failed to process bulk operation', 500, 'BULK_OPERATION_ERROR')
    }
  })(request)
}

// Helper function to process individual bulk operations
async function processBulkOperation(
  payload: any,
  orderId: string,
  operation: string,
  data: any,
  notifyCustomers: boolean,
) {
  // Get the order
  const order = await payload.findByID({
    collection: 'orders',
    id: orderId,
  })

  if (!order) {
    throw new Error(`Order ${orderId} not found`)
  }

  let updateData: any = {}
  let emailMessage = ''
  let shouldSendEmail = false

  switch (operation) {
    case 'mark_shipped':
      if (order.status === ORDER_STATUSES.SHIPPED) {
        throw new Error(`Order ${orderId} is already shipped`)
      }

      const trackingNumber = data.trackingNumber || generateTrackingNumber()
      updateData = {
        status: ORDER_STATUSES.SHIPPED,
        'shipping.status': 'shipped',
        'shipping.trackingNumber': trackingNumber,
        'shipping.shippedAt': new Date().toISOString(),
      }

      if (data.estimatedDelivery) {
        updateData['shipping.estimatedDelivery'] = data.estimatedDelivery
      }

      emailMessage = `Your order has been shipped! Tracking number: ${trackingNumber}`
      shouldSendEmail = true
      break

    case 'mark_delivered':
      if (order.status === ORDER_STATUSES.DELIVERED) {
        throw new Error(`Order ${orderId} is already delivered`)
      }

      updateData = {
        status: ORDER_STATUSES.DELIVERED,
        'shipping.status': 'delivered',
        'shipping.deliveredAt': new Date().toISOString(),
      }

      emailMessage = 'Your order has been delivered! We hope you love your purchase.'
      shouldSendEmail = true
      break

    case 'mark_processing':
      if (order.status === ORDER_STATUSES.PROCESSING) {
        throw new Error(`Order ${orderId} is already processing`)
      }

      updateData = {
        status: ORDER_STATUSES.PROCESSING,
        'shipping.status': 'processing',
      }

      emailMessage = 'Your order is now being processed and prepared for shipment.'
      shouldSendEmail = true
      break

    case 'cancel_orders':
      if (['shipped', 'delivered'].includes(order.status)) {
        throw new Error(`Cannot cancel order ${orderId} that has been shipped or delivered`)
      }

      updateData = {
        status: ORDER_STATUSES.CANCELLED,
        'payment.status': 'cancelled',
        adminNotes: data.reason || 'Order cancelled via bulk operation',
      }

      emailMessage =
        'Your order has been cancelled. If you have any questions, please contact our support team.'
      shouldSendEmail = true

      // Restore inventory for cancelled orders
      await restoreInventoryForCancelledOrder(order, payload)
      break

    case 'add_tracking':
      if (!data.trackingNumber) {
        throw new Error('Tracking number is required for add_tracking operation')
      }

      updateData = {
        'shipping.trackingNumber': data.trackingNumber,
        'shipping.status': 'shipped',
      }

      if (order.status !== ORDER_STATUSES.SHIPPED) {
        updateData.status = ORDER_STATUSES.SHIPPED
        emailMessage = `Your order has been shipped! Tracking number: ${data.trackingNumber}`
        shouldSendEmail = true
      }
      break

    case 'update_notes':
      if (data.adminNotes !== undefined) {
        updateData.adminNotes = data.adminNotes
      }
      if (data.customerNotes !== undefined) {
        updateData.customerNotes = data.customerNotes
      }
      break

    default:
      throw new Error(`Unknown operation: ${operation}`)
  }

  // Add metadata
  updateData.metadata = {
    ...order.metadata,
    updatedAt: new Date().toISOString(),
    updatedBy: 'bulk_operation',
    lastBulkOperation: operation,
  }

  // Update the order
  const updatedOrder = await payload.update({
    collection: 'orders',
    id: orderId,
    data: updateData,
  })

  // Send email notification if needed
  if (shouldSendEmail && notifyCustomers && emailMessage) {
    try {
      const emailQueueId = await queueOrderUpdateEmail(updatedOrder)
      logger.info(`Bulk operation email queued: ${emailQueueId}`, 'API:orders:bulk')
    } catch (error) {
      logger.error('Failed to queue bulk operation email', 'API:orders:bulk', error as Error)
    }
  }

  return {
    orderId,
    orderNumber: order.orderNumber,
    operation,
    status: updatedOrder.status,
    emailSent: shouldSendEmail && notifyCustomers,
  }
}

// Helper function to restore inventory for cancelled orders
async function restoreInventoryForCancelledOrder(order: any, payload: any) {
  try {
    for (const item of order.items) {
      if (!item.product || !item.quantity) continue

      // Get current product inventory
      const product = await payload.findByID({
        collection: 'products',
        id: item.product,
      })

      if (product && product.inventory?.trackQuantity) {
        const currentQuantity = product.inventory.quantity || 0
        const restoredQuantity = currentQuantity + item.quantity

        await payload.update({
          collection: 'products',
          id: item.product,
          data: {
            'inventory.quantity': restoredQuantity,
          },
        })

        logger.info('Inventory restored for bulk cancelled order', 'API:orders:bulk', {
          productId: item.product,
          productTitle: product.title,
          restoredQuantity: item.quantity,
          previousQuantity: currentQuantity,
          newQuantity: restoredQuantity,
        })
      }
    }
  } catch (error) {
    logger.error(
      'Failed to restore inventory for bulk cancelled order',
      'API:orders:bulk',
      error as Error,
    )
    // Don't throw error - inventory restoration failure shouldn't prevent order cancellation
  }
}
