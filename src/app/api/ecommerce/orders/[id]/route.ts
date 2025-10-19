import { NextRequest } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { createSuccessResponse, withErrorHandling, ApiError } from '@/lib/api/apiResponse'
import { logger } from '@/lib/api/logger'
import { ORDER_STATUSES, generateTrackingNumber } from '@/lib/orders/orderUtils'
import { queueOrderUpdateEmail } from '@/lib/email/emailQueue'
import { stripe } from '@/lib/payments/stripe'

// GET endpoint for retrieving a specific order
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(
    async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
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
    },
  )(request, { params })
}

// PATCH endpoint for updating order status and other fields
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(
    async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
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
          estimatedDelivery,
          refundAmount,
          refundReason,
          autoGenerateTracking,
        } = body

        // Validate status if provided
        if (status && !Object.values(ORDER_STATUSES).includes(status)) {
          throw new ApiError('Invalid order status', 400, 'INVALID_STATUS')
        }

        // Get current order to check status transitions
        const currentOrder = await payload.findByID({
          collection: 'orders',
          id: orderId,
        })

        if (!currentOrder) {
          throw new ApiError('Order not found', 404, 'NOT_FOUND')
        }

        // Prepare update data
        const updateData: any = {}
        let statusChanged = false
        let shouldSendEmail = false
        let emailStatusMessage = ''

        // Handle status changes with validation
        if (status && status !== currentOrder.status) {
          // Validate status transition
          if (!isValidStatusTransition(currentOrder.status, status)) {
            throw new ApiError(
              `Invalid status transition from ${currentOrder.status} to ${status}`,
              400,
              'INVALID_STATUS_TRANSITION',
            )
          }

          updateData.status = status
          statusChanged = true
          shouldSendEmail = true
          emailStatusMessage = getStatusMessage(status)
        }

        // Handle payment status changes
        if (paymentStatus && paymentStatus !== currentOrder.paymentStatus) {
          updateData['payment.status'] = paymentStatus

          // If refunding, process refund
          if (paymentStatus === 'refunded' && refundAmount) {
            await processRefund(currentOrder, refundAmount, refundReason, payload)
          }
        }

        // Handle shipping updates
        if (shippingStatus) {
          updateData['shipping.status'] = shippingStatus
        }

        // Handle tracking number
        if (trackingNumber || autoGenerateTracking) {
          const finalTrackingNumber = trackingNumber || generateTrackingNumber()
          updateData['shipping.trackingNumber'] = finalTrackingNumber

          if (!currentOrder.shipping.trackingNumber) {
            shouldSendEmail = true
            emailStatusMessage = `Your order has been shipped! Tracking number: ${finalTrackingNumber}`
          }
        }

        // Handle estimated delivery
        if (estimatedDelivery) {
          updateData['shipping.estimatedDelivery'] = estimatedDelivery
        }

        // Handle notes
        if (customerNotes !== undefined) {
          updateData.customerNotes = customerNotes
        }

        if (adminNotes !== undefined) {
          updateData.adminNotes = adminNotes
        }

        // Add metadata
        updateData.metadata = {
          ...(currentOrder as any).metadata,
          updatedAt: new Date().toISOString(),
          updatedBy: 'admin', // In a real app, this would be the user ID
          lastStatusChange: statusChanged
            ? new Date().toISOString()
            : (currentOrder as any).metadata?.lastStatusChange,
        }

        const updatedOrder = await payload.update({
          collection: 'orders',
          id: orderId,
          data: updateData,
        })

        // Send email notification if status changed
        if (shouldSendEmail && emailStatusMessage) {
          try {
            const emailQueueId = await queueOrderUpdateEmail(updatedOrder)
            logger.info(`Order update email queued: ${emailQueueId}`, 'API:orders:update')
          } catch (error) {
            logger.error('Failed to queue order update email', 'API:orders:update', error as Error)
          }
        }

        // Handle inventory restoration for cancelled orders
        if (
          status === ORDER_STATUSES.CANCELLED &&
          currentOrder.status !== ORDER_STATUSES.CANCELLED
        ) {
          await restoreInventoryForCancelledOrder(updatedOrder, payload)
        }

        logger.info('Order updated successfully', 'API:orders:update', {
          orderId: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          status: updatedOrder.status,
          updatedFields: Object.keys(updateData),
          statusChanged,
          emailSent: shouldSendEmail,
        })

        return createSuccessResponse(
          {
            order: updatedOrder,
            statusChanged,
            emailSent: shouldSendEmail,
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
    },
  )(request, { params })
}

// DELETE endpoint for cancelling an order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandling(
    async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
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
          throw new ApiError(
            'Cannot cancel order that has been shipped or delivered',
            400,
            'INVALID_OPERATION',
          )
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
    },
  )(request, { params })
}

// Helper function to validate status transitions
function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
  const validTransitions: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: ['refunded'],
    cancelled: [], // Cannot transition from cancelled
    refunded: [], // Cannot transition from refunded
  }

  return validTransitions[currentStatus]?.includes(newStatus) || false
}

// Helper function to get status message for emails
function getStatusMessage(status: string): string {
  const statusMessages: Record<string, string> = {
    confirmed: 'Your order has been confirmed and is being prepared for shipment.',
    processing: 'Your order is now being processed and prepared for shipment.',
    shipped: 'Great news! Your order has been shipped and is on its way to you.',
    delivered: 'Your order has been delivered! We hope you love your purchase.',
    cancelled:
      'Your order has been cancelled. If you have any questions, please contact our support team.',
    refunded:
      'Your order has been refunded. The refund will appear in your account within 3-5 business days.',
  }

  return statusMessages[status] || 'Your order status has been updated.'
}

// Helper function to process refunds
async function processRefund(order: any, refundAmount: number, refundReason: string, payload: any) {
  try {
    if (!order.payment?.stripePaymentIntentId) {
      throw new ApiError('No Stripe payment intent found for refund', 400, 'NO_PAYMENT_INTENT')
    }

    // Process refund through Stripe
    const refund = await stripe.refunds.create({
      payment_intent: order.payment.stripePaymentIntentId,
      amount: Math.round(refundAmount * 100), // Convert to cents
      reason: 'requested_by_customer',
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        reason: refundReason,
      },
    })

    // Update order with refund information
    await payload.update({
      collection: 'orders',
      id: order.id,
      data: {
        'payment.refundId': refund.id,
        'payment.refundAmount': refundAmount,
        'payment.refundReason': refundReason,
        'payment.refundStatus': refund.status,
      },
    })

    logger.info('Refund processed successfully', 'API:orders:refund', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      refundId: refund.id,
      refundAmount,
      refundReason,
    })

    return refund
  } catch (error) {
    logger.error('Failed to process refund', 'API:orders:refund', error as Error)
    throw new ApiError('Failed to process refund', 500, 'REFUND_ERROR')
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

        logger.info('Inventory restored for cancelled order', 'API:orders:cancel', {
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
      'Failed to restore inventory for cancelled order',
      'API:orders:cancel',
      error as Error,
    )
    // Don't throw error - inventory restoration failure shouldn't prevent order cancellation
  }
}
