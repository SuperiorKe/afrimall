import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createSuccessResponse, withErrorHandling, ApiError } from '@/lib/api/apiResponse'
import { logger } from '@/lib/api/logger'

export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const payload = await getPayload({ config: configPromise })

    const { token, password } = body

    // Validate required fields
    if (!token || !password) {
      throw new ApiError('Token and password are required', 400, 'MISSING_FIELDS')
    }

    // Validate password strength
    if (password.length < 8) {
      throw new ApiError('Password must be at least 8 characters long', 400, 'WEAK_PASSWORD')
    }

    // Find customer with the reset token
    const existingCustomer = await payload.find({
      collection: 'customers',
      where: {
        resetPasswordToken: {
          equals: token,
        },
      },
      limit: 1,
    })

    if (existingCustomer.docs.length === 0) {
      throw new ApiError('Invalid or expired reset token', 400, 'INVALID_TOKEN')
    }

    const customer = existingCustomer.docs[0]

    // Check if token is expired
    if (!customer.resetPasswordExpiration) {
      throw new ApiError('Invalid or expired reset token', 400, 'INVALID_TOKEN')
    }

    const expirationDate = new Date(customer.resetPasswordExpiration)
    const now = new Date()

    if (now > expirationDate) {
      // Clear expired token
      await payload.update({
        collection: 'customers',
        id: customer.id,
        data: {
          resetPasswordToken: null,
          resetPasswordExpiration: null,
        },
      })

      throw new ApiError(
        'Reset token has expired. Please request a new password reset.',
        400,
        'EXPIRED_TOKEN',
      )
    }

    // Use our custom password reset implementation
    // We don't use Payload's resetPassword because it expects a different token format
    try {
      // Update customer password and clear reset token
      await payload.update({
        collection: 'customers',
        id: customer.id,
        data: {
          password,
          resetPasswordToken: null,
          resetPasswordExpiration: null,
        },
        overrideAccess: true,
      })

      logger.info('Password reset completed successfully', 'API:customers:reset-password', {
        customerId: customer.id,
        email: customer.email,
      })

      return createSuccessResponse(
        { passwordReset: true },
        200,
        'Password has been reset successfully. You can now log in with your new password.',
      )
    } catch (updateError) {
      logger.error(
        `Failed to update password for customer ${customer.id} (${customer.email})`,
        'API:customers:reset-password',
        updateError as Error,
      )

      throw new ApiError('Failed to reset password', 500, 'PASSWORD_UPDATE_ERROR')
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    logger.apiError(
      'Error processing reset password request',
      '/api/customers/reset-password',
      error as Error,
    )
    throw new ApiError('Failed to reset password', 500, 'RESET_PASSWORD_ERROR')
  }
})

// GET endpoint to validate reset token
export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      throw new ApiError('Token is required', 400, 'MISSING_TOKEN')
    }

    const payload = await getPayload({ config: configPromise })

    // Find customer with the reset token
    const existingCustomer = await payload.find({
      collection: 'customers',
      where: {
        resetPasswordToken: {
          equals: token,
        },
      },
      limit: 1,
    })

    if (existingCustomer.docs.length === 0) {
      throw new ApiError('Invalid reset token', 400, 'INVALID_TOKEN')
    }

    const customer = existingCustomer.docs[0]

    // Check if token is expired
    if (!customer.resetPasswordExpiration) {
      throw new ApiError('Invalid reset token', 400, 'INVALID_TOKEN')
    }

    const expirationDate = new Date(customer.resetPasswordExpiration)
    const now = new Date()

    if (now > expirationDate) {
      throw new ApiError('Reset token has expired', 400, 'EXPIRED_TOKEN')
    }

    return createSuccessResponse(
      {
        valid: true,
        email: customer.email,
        firstName: customer.firstName,
      },
      200,
      'Reset token is valid',
    )
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    logger.apiError('Error validating reset token', '/api/customers/reset-password', error as Error)
    throw new ApiError('Failed to validate reset token', 500, 'TOKEN_VALIDATION_ERROR')
  }
})
