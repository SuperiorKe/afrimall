import { NextRequest } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { createSuccessResponse, withErrorHandling, ApiError } from '@/lib/api/apiResponse'
import { logger } from '@/lib/api/logger'

export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const payload = await getPayloadHMR({ config: configPromise })

    const { token } = body

    if (!token) {
      throw new ApiError('Verification token is required', 400, 'MISSING_TOKEN')
    }

    // Verify the email token
    const result = await payload.verifyEmail({
      collection: 'customers',
      token,
    })

    if (!result) {
      throw new ApiError('Invalid or expired verification token', 400, 'INVALID_TOKEN')
    }

    // Get the customer data after verification
    const customer = await payload.find({
      collection: 'customers',
      where: {
        email: {
          equals: token, // This might need adjustment based on how verifyEmail works
        },
      },
      limit: 1,
    })

    if (!customer.docs.length) {
      throw new ApiError('Customer not found after verification', 404, 'CUSTOMER_NOT_FOUND')
    }

    const verifiedCustomer = customer.docs[0]

    logger.info('Customer email verified successfully', 'API:customers:verify-email', {
      customerId: verifiedCustomer.id,
      email: verifiedCustomer.email,
    })

    return createSuccessResponse(
      {
        id: verifiedCustomer.id,
        email: verifiedCustomer.email,
        firstName: verifiedCustomer.firstName,
        lastName: verifiedCustomer.lastName,
        phone: verifiedCustomer.phone,
        verified: true,
      },
      200,
      'Email verified successfully',
    )
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // Handle verification-specific errors
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as any).message
      if (errorMessage.includes('token') || errorMessage.includes('verification')) {
        throw new ApiError('Invalid or expired verification token', 400, 'INVALID_TOKEN')
      }
    }

    logger.apiError('Error verifying email', '/api/customers/verify-email', error as Error)
    throw new ApiError('Failed to verify email', 500, 'VERIFICATION_ERROR')
  }
})

// GET endpoint for verifying email via URL parameter
export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      throw new ApiError('Verification token is required', 400, 'MISSING_TOKEN')
    }

    const payload = await getPayloadHMR({ config: configPromise })

    // Verify the email token
    const result = await payload.verifyEmail({
      collection: 'customers',
      token,
    })

    if (!result) {
      throw new ApiError('Invalid or expired verification token', 400, 'INVALID_TOKEN')
    }

    // Get the customer data after verification
    const customer = await payload.find({
      collection: 'customers',
      where: {
        email: {
          equals: token, // This might need adjustment based on how verifyEmail works
        },
      },
      limit: 1,
    })

    if (!customer.docs.length) {
      throw new ApiError('Customer not found after verification', 404, 'CUSTOMER_NOT_FOUND')
    }

    const verifiedCustomer = customer.docs[0]

    logger.info('Customer email verified successfully via GET', 'API:customers:verify-email', {
      customerId: verifiedCustomer.id,
      email: verifiedCustomer.email,
    })

    return createSuccessResponse(
      {
        id: verifiedCustomer.id,
        email: verifiedCustomer.email,
        firstName: verifiedCustomer.firstName,
        lastName: verifiedCustomer.lastName,
        phone: verifiedCustomer.phone,
        verified: true,
      },
      200,
      'Email verified successfully',
    )
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // Handle verification-specific errors
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as any).message
      if (errorMessage.includes('token') || errorMessage.includes('verification')) {
        throw new ApiError('Invalid or expired verification token', 400, 'INVALID_TOKEN')
      }
    }

    logger.apiError('Error verifying email via GET', '/api/customers/verify-email', error as Error)
    throw new ApiError('Failed to verify email', 500, 'VERIFICATION_ERROR')
  }
})
