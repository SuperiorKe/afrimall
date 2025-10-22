import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createSuccessResponse, withErrorHandling, ApiError } from '@/lib/api/apiResponse'
import { logger } from '@/lib/api/logger'
import { EmailService } from '@/lib/email/email'

export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const payload = await getPayload({ config: configPromise })

    const { email } = body

    // Validate required fields
    if (!email) {
      throw new ApiError('Email is required', 400, 'MISSING_EMAIL')
    }

    // Check if customer exists
    const existingCustomer = await payload.find({
      collection: 'customers',
      where: {
        email: {
          equals: email.toLowerCase().trim(),
        },
      },
      limit: 1,
    })

    if (existingCustomer.docs.length === 0) {
      // For security, don't reveal if email exists or not
      // Return success message regardless
      logger.info(
        'Password reset requested for non-existent email',
        'API:customers:forgot-password',
        {
          email,
        },
      )

      return createSuccessResponse(
        { messageSent: true },
        200,
        'If an account with that email exists, a password reset link has been sent.',
      )
    }

    const customer = existingCustomer.docs[0]

    // Use our custom forgot password implementation
    // We don't use Payload's forgotPassword because we want full control over the email content and token format
    try {
      // Generate reset token manually
      const crypto = await import('crypto')
      const resetToken = crypto.randomBytes(32).toString('hex')
      const resetExpiration = new Date(Date.now() + 3600000) // 1 hour from now

      // Update customer with reset token
      await payload.update({
        collection: 'customers',
        id: customer.id,
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpiration: resetExpiration.toISOString(),
        },
      })

      // Send password reset email using our email service
      const emailService = new EmailService()

      if (emailService.isReady()) {
        // Get the server URL from various sources
        // Note: NEXT_PUBLIC_* variables are client-side only, use SERVER_URL for API routes
        const serverUrl =
          process.env.SERVER_URL ||
          process.env.VERCEL_URL ||
          (request.headers.get('host')
            ? `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`
            : 'http://localhost:3000')

        try {
          await emailService.sendPasswordResetEmail({
            email: customer.email,
            firstName: customer.firstName || 'Customer',
            resetToken,
            resetUrl: `${serverUrl}/auth/reset-password?token=${resetToken}`,
          })

          logger.info(
            'Custom password reset email sent successfully',
            'API:customers:forgot-password',
            {
              customerId: customer.id,
              email: customer.email,
            },
          )
        } catch (emailError) {
          logger.error(
            'Failed to send password reset email',
            'API:customers:forgot-password',
            emailError as Error,
          )
          // Don't fail the request if email fails, but log the error
        }
      } else {
        logger.warn(
          'Email service not configured, password reset token generated but no email sent',
          'API:customers:forgot-password',
          {
            customerId: customer.id,
            email: customer.email,
            resetToken,
          },
        )
      }

      return createSuccessResponse(
        { messageSent: true },
        200,
        'If an account with that email exists, a password reset link has been sent.',
      )
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      logger.apiError(
        'Error processing forgot password request',
        '/api/customers/forgot-password',
        error as Error,
      )
      throw new ApiError('Failed to process password reset request', 500, 'FORGOT_PASSWORD_ERROR')
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    logger.apiError(
      'Error processing forgot password request',
      '/api/customers/forgot-password',
      error as Error,
    )
    throw new ApiError('Failed to process password reset request', 500, 'FORGOT_PASSWORD_ERROR')
  }
})