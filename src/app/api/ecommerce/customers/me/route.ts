import { NextRequest } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { createSuccessResponse, withErrorHandling, ApiError } from '@/lib/api/apiResponse'
import { logger } from '@/lib/api/logger'

export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    const payload = await getPayloadHMR({ config: configPromise })

    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('No authorization token provided', 401, 'NO_TOKEN')
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify the token and get user data
    const result = await payload.verifyJWT({
      token,
      collection: 'customers',
    })

    if (!result.user) {
      throw new ApiError('Invalid or expired token', 401, 'INVALID_TOKEN')
    }

    // Get fresh customer data
    const customer = await payload.findByID({
      collection: 'customers',
      id: result.user.id,
    })

    logger.info('Customer token validated successfully', 'API:customers:me', {
      customerId: customer.id,
      email: customer.email,
    })

    return createSuccessResponse(
      {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        status: customer.status,
        customerGroup: customer.customerGroup,
        preferences: customer.preferences,
        addresses: customer.addresses,
        totalSpent: customer.totalSpent,
        totalOrders: customer.totalOrders,
        lastOrderDate: customer.lastOrderDate,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      },
      200,
      'Token validated successfully',
    )
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // Handle JWT-specific errors
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as any).message
      if (errorMessage.includes('jwt') || errorMessage.includes('token')) {
        throw new ApiError('Invalid or expired token', 401, 'INVALID_TOKEN')
      }
    }

    logger.apiError('Error validating customer token', '/api/customers/me', error as Error)
    throw new ApiError('Failed to validate token', 500, 'VALIDATION_ERROR')
  }
})
