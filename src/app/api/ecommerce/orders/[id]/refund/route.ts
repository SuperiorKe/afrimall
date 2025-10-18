import { NextRequest } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { createSuccessResponse, withErrorHandling, ApiError } from '@/lib/api/apiResponse'
import { logger } from '@/lib/api/logger'
import { ORDER_STATUSES } from '@/lib/orders/orderUtils'
import { stripe } from '@/lib/payments/stripe'
import { queueOrderUpdateEmail } from '@/lib/email/emailQueue'

// POST endpoint for processing refunds
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(
    async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
      try {
        const body = await request.json()
        const payload = await getPayloadHMR({ config: configPromise })
        const { id: orderId } = await params

        const {
          refundAmount,
          refundReason,
          refundType = 'full', // 'full' or 'partial'
          notifyCustomer = true,
        } = body

        // Validate required fields
        if (!refundAmount || refundAmount <= 0) {
          throw new ApiError('Invalid refund amount', 400, 'INVALID_AMOUNT')
        }

        if (!refundReason) {
          throw new ApiError('Refund reason is required', 400, 'MISSING_REASON')
        }

        // Get the order
        const order = await payload.findByID({
          collection: 'orders',
          id: orderId,
        })

        if (!order) {
          throw new ApiError('Order not found', 404, 'NOT_FOUND')
        }

        // Validate order can be refunded
        if (order.status === ORDER_STATUSES.CANCELLED) {
          throw new ApiError('Cannot refund a cancelled order', 400, 'INVALID_OPERATION')
        }

        if (order.paymentStatus === 'refunded') {
          throw new ApiError('Order is already fully refunded', 400, 'ALREADY_REFUNDED')
        }

        // Check if partial refund amount is valid
        const totalOrderAmount = order.total
        const existingRefundAmount = (order as any).payment?.refundAmount || 0
        const maxRefundAmount = totalOrderAmount - existingRefundAmount

        if (refundAmount > maxRefundAmount) {
          throw new ApiError(
            `Refund amount cannot exceed ${maxRefundAmount}. Order total: ${totalOrderAmount}, Already refunded: ${existingRefundAmount}`,
            400,
            'INVALID_REFUND_AMOUNT',
          )
        }

        // Process refund through Stripe
        if (!(order as any).payment?.stripePaymentIntentId) {
          throw new ApiError('No Stripe payment intent found for refund', 400, 'NO_PAYMENT_INTENT')
        }

        const refund = await stripe.refunds.create({
          payment_intent: (order as any).payment.stripePaymentIntentId,
          amount: Math.round(refundAmount * 100), // Convert to cents
          reason: 'requested_by_customer',
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            reason: refundReason,
            refundType,
          },
        })

        // Calculate new refund totals
        const newTotalRefunded = existingRefundAmount + refundAmount
        const isFullyRefunded = newTotalRefunded >= totalOrderAmount

        // Update order with refund information
        const updateData: any = {
          'payment.refundId': refund.id,
          'payment.refundAmount': newTotalRefunded,
          'payment.refundReason': refundReason,
          'payment.refundStatus': refund.status,
          'payment.lastRefundDate': new Date().toISOString(),
        }

        // Update order status if fully refunded
        if (isFullyRefunded) {
          updateData.status = ORDER_STATUSES.REFUNDED
          updateData['payment.status'] = 'refunded'
        } else {
          updateData['payment.status'] = 'partially_refunded'
        }

        const updatedOrder = await payload.update({
          collection: 'orders',
          id: orderId,
          data: updateData,
        })

        // Send email notification to customer
        if (notifyCustomer) {
          try {
            const emailMessage = isFullyRefunded
              ? `Your order has been fully refunded. The refund amount of $${refundAmount} will appear in your account within 3-5 business days.`
              : `A partial refund of $${refundAmount} has been processed for your order. The refund will appear in your account within 3-5 business days.`

            const emailQueueId = await queueOrderUpdateEmail(updatedOrder)
            logger.info(`Refund notification email queued: ${emailQueueId}`, 'API:orders:refund')
          } catch (error) {
            logger.error(
              'Failed to queue refund notification email',
              'API:orders:refund',
              error as Error,
            )
          }
        }

        logger.info('Refund processed successfully', 'API:orders:refund', {
          orderId: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          refundId: refund.id,
          refundAmount,
          refundType,
          isFullyRefunded,
          totalRefunded: newTotalRefunded,
          refundReason,
        })

        return createSuccessResponse(
          {
            refund: {
              id: refund.id,
              amount: refundAmount,
              status: refund.status,
              reason: refundReason,
              type: refundType,
              isFullyRefunded,
              totalRefunded: newTotalRefunded,
            },
            order: updatedOrder,
          },
          200,
          'Refund processed successfully',
        )
      } catch (error) {
        if (error instanceof ApiError) {
          throw error
        }

        const { id } = await params
        logger.apiError('Error processing refund', `/api/orders/${id}/refund`, error as Error)
        throw new ApiError('Failed to process refund', 500, 'REFUND_ERROR')
      }
    },
  )(request, { params })
}

// GET endpoint for retrieving refund information
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

        // Get refund information from Stripe if available
        let stripeRefunds: any[] = []
        if ((order as any).payment?.stripePaymentIntentId) {
          try {
            const paymentIntent = await stripe.paymentIntents.retrieve(
              (order as any).payment.stripePaymentIntentId,
              { expand: ['charges.data.refunds'] },
            )
            if ((paymentIntent as any).charges?.data?.[0]?.refunds) {
              stripeRefunds = (paymentIntent as any).charges.data[0].refunds.data
            }
          } catch (error) {
            logger.warn('Failed to retrieve Stripe refunds', 'API:orders:refund', error as Error)
          }
        }

        const refundInfo = {
          orderId: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.total,
          refundedAmount: (order as any).payment?.refundAmount || 0,
          refundStatus: (order as any).payment?.refundStatus,
          refundReason: (order as any).payment?.refundReason,
          lastRefundDate: (order as any).payment?.lastRefundDate,
          canRefund:
            order.status !== ORDER_STATUSES.CANCELLED && order.paymentStatus !== 'refunded',
          maxRefundAmount: order.total - ((order as any).payment?.refundAmount || 0),
          stripeRefunds,
        }

        return createSuccessResponse(
          {
            refundInfo,
          },
          200,
          'Refund information retrieved successfully',
        )
      } catch (error) {
        if (error instanceof ApiError) {
          throw error
        }

        const { id } = await params
        logger.apiError(
          'Error retrieving refund information',
          `/api/orders/${id}/refund`,
          error as Error,
        )
        throw new ApiError('Failed to retrieve refund information', 500, 'RETRIEVE_ERROR')
      }
    },
  )(request, { params })
}
