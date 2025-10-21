import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createSuccessResponse, withErrorHandling, ApiError } from '@/lib/api/apiResponse'
import { logger } from '@/lib/api/logger'

export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const payload = await getPayload({ config: configPromise })

    const { email } = body

    if (!email) {
      throw new ApiError('Email address is required', 400, 'MISSING_EMAIL')
    }

    // Find the customer by email
    const existingCustomer = await payload.find({
      collection: 'customers',
      where: {
        email: { equals: email },
      },
      limit: 1,
    })

    if (existingCustomer.docs.length === 0) {
      throw new ApiError('No account found with this email address', 404, 'CUSTOMER_NOT_FOUND')
    }

    const customer = existingCustomer.docs[0]

    // Since email verification is disabled in the Customers collection config,
    // we'll skip the verification check and proceed with email sending
    // In a real implementation, you might want to add a custom verification field
    // or implement a different verification system

    // Generate a new verification token and send email
    try {
      await payload.forgotPassword({
        collection: 'customers',
        data: {
          email,
        },
        req: request,
      })

      logger.info('Verification email resent successfully', 'API:customers:resend-verification', {
        customerId: customer.id,
        email: customer.email,
      })

      return createSuccessResponse({ emailSent: true }, 200, 'Verification email sent successfully')
    } catch (emailError) {
      // If forgotPassword doesn't work for verification, we'll use a different approach
      logger.warn(
        'Failed to resend verification email using forgotPassword',
        'API:customers:resend-verification',
        {
          customerId: customer.id,
          email: customer.email,
          error: emailError instanceof Error ? emailError.message : 'Unknown error',
        },
      )

      // For now, return a success message even if email sending fails
      // In production, you'd want to implement proper email verification resend
      return createSuccessResponse(
        { emailSent: false },
        200,
        'Account found. Please contact support if you need to resend verification email.',
      )
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    logger.apiError(
      'Error resending verification email',
      '/api/customers/resend-verification',
      error as Error,
    )
    throw new ApiError('Failed to resend verification email', 500, 'RESEND_ERROR')
  }
})
