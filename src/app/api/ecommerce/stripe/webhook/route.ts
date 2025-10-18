import { NextRequest } from 'next/server'
import { stripe } from '@/lib/payments/stripe'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import {
  withErrorHandling,
  ApiError,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/api/apiResponse'
import { logger } from '@/lib/api/logger'
import { queueOrderUpdateEmail } from '@/lib/email/emailQueue'

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    logger.error('No Stripe signature found', 'API:stripe/webhook')
    throw new ApiError('No signature', 400, 'MISSING_SIGNATURE')
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    logger.error('STRIPE_WEBHOOK_SECRET not configured', 'API:stripe/webhook')
    throw new ApiError('Webhook not configured', 500, 'WEBHOOK_NOT_CONFIGURED')
  }

  let event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: unknown) {
    logger.error('Webhook signature verification failed', 'API:stripe/webhook', err as Error)
    throw new ApiError('Invalid signature', 400, 'INVALID_SIGNATURE')
  }

  const payload = await getPayloadHMR({ config: configPromise })

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        const orderId = paymentIntent.metadata.orderId

        if (orderId) {
          // Update order status to paid
          const updatedOrder = await payload.update({
            collection: 'orders',
            id: orderId,
            data: {
              paymentStatus: 'paid',
              paymentReference: paymentIntent.id,
              status: 'confirmed',
            },
          })

          logger.info(`Order ${orderId} marked as paid`, 'API:stripe/webhook')

          // Queue payment confirmation email
          try {
            const emailQueueId = await queueOrderUpdateEmail(updatedOrder)
            logger.info(`Payment confirmation email queued: ${emailQueueId}`, 'API:stripe/webhook')
          } catch (error) {
            logger.error(
              'Failed to queue payment confirmation email',
              'API:stripe/webhook',
              error as Error,
            )
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        const orderId = paymentIntent.metadata.orderId

        if (orderId) {
          // Update order status to failed
          const updatedOrder = await payload.update({
            collection: 'orders',
            id: orderId,
            data: {
              paymentStatus: 'failed',
              paymentReference: paymentIntent.id,
              status: 'cancelled',
            },
          })

          logger.info(`Order ${orderId} payment failed`, 'API:stripe/webhook')

          // Queue payment failure email
          try {
            const emailQueueId = await queueOrderUpdateEmail(updatedOrder)
            logger.info(`Payment failure email queued: ${emailQueueId}`, 'API:stripe/webhook')
          } catch (error) {
            logger.error(
              'Failed to queue payment failure email',
              'API:stripe/webhook',
              error as Error,
            )
          }
        }
        break
      }

      case 'payment_intent.requires_action': {
        const paymentIntent = event.data.object
        const orderId = paymentIntent.metadata.orderId

        if (orderId) {
          // Payment requires additional action (3D Secure, etc.)
          await payload.update({
            collection: 'orders',
            id: orderId,
            data: {
              paymentStatus: 'pending',
              paymentReference: paymentIntent.id,
              notes: [{
                id: Date.now().toString(),
                type: 'system',
                content: 'Payment requires additional authentication',
                author: 'system',
                isVisibleToCustomer: false,
                createdAt: new Date().toISOString(),
              }],
            } as any,
          })

          logger.info(`Order ${orderId} requires payment action`, 'API:stripe/webhook')
        }
        break
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object
        const chargeId = dispute.charge

        // Find order by payment reference
        const orders = await payload.find({
          collection: 'orders',
          where: {
            paymentReference: {
              equals: chargeId,
            },
          },
          limit: 1,
        })

        if (orders.docs.length > 0) {
          const order = orders.docs[0]
          await payload.update({
            collection: 'orders',
            id: order.id,
            data: {
              status: 'cancelled',
              notes: [{
                id: Date.now().toString(),
                type: 'system',
                content: `Dispute created: ${dispute.reason}`,
                author: 'system',
                isVisibleToCustomer: false,
                createdAt: new Date().toISOString(),
              }],
            } as any,
          })

          logger.info(`Dispute created for order ${order.id}`, 'API:stripe/webhook')
        }
        break
      }

      default:
        logger.info(`Unhandled event type: ${event.type}`, 'API:stripe/webhook')
    }

    return createSuccessResponse({ received: true })
  } catch (error: any) {
    logger.error('Error processing webhook', 'API:stripe/webhook', error)
    return createErrorResponse('Webhook processing failed', 500, 'WEBHOOK_PROCESSING_FAILED')
  }
})
