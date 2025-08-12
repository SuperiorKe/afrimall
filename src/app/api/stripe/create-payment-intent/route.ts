import { NextRequest } from 'next/server'
import { stripe, formatAmountForStripe, STRIPE_CONFIG } from '@/utilities/stripe'
import {
  createSuccessResponse,
  withErrorHandling,
  ApiError,
} from '@/utilities/apiResponse'
import { logger } from '@/utilities/logger'

export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { amount, currency = 'usd', orderId, customerEmail, metadata = {} } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      throw new ApiError('Invalid amount provided', 400, 'INVALID_AMOUNT')
    }

    // Validate currency
    if (!STRIPE_CONFIG.supportedCurrencies.includes(currency)) {
      throw new ApiError(`Currency ${currency} is not supported`, 400, 'UNSUPPORTED_CURRENCY')
    }

    // Convert amount to Stripe format (cents for most currencies)
    const stripeAmount = formatAmountForStripe(amount, currency)

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency: currency.toLowerCase(),
      payment_method_types: [...STRIPE_CONFIG.paymentMethods],
      receipt_email: customerEmail,
      metadata: {
        orderId: orderId || '',
        ...metadata,
      },
      // Enable automatic payment methods for better conversion
      automatic_payment_methods: {
        enabled: true,
      },
    })

    logger.info('Payment intent created successfully', 'API:stripe/create-payment-intent', {
      paymentIntentId: paymentIntent.id,
      amount: stripeAmount,
      currency,
    })

    return createSuccessResponse(
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
      201,
      'Payment intent created successfully',
    )
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    logger.apiError(
      'Error creating PaymentIntent',
      '/api/stripe/create-payment-intent',
      error as Error,
    )
    throw new ApiError('Failed to create payment intent', 500, 'CREATE_ERROR')
  }
})
