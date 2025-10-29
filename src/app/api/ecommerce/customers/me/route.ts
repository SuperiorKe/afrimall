import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createSuccessResponse, withErrorHandling, ApiError } from '@/lib/api/apiResponse'
import { logger } from '@/lib/api/logger'

export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    const payload = await getPayload({ config: configPromise })

    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('No authorization token provided', 401, 'NO_TOKEN')
    }

    // Authenticate using Payload - will throw if invalid/expired
    let user: any | null = null
    try {
      const authResult = await (payload as any).authenticate({
        headers: request.headers,
      })
      user = authResult?.user || null
    } catch (authError) {
      logger.info('Customer token authentication failed', 'API:customers:me')
      throw new ApiError('Invalid or expired token', 401, 'INVALID_TOKEN')
    }

    if (!user || user.collection !== 'customers') {
      throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED')
    }

    logger.info('Customer authenticated', 'API:customers:me', { customerId: user.id })

    return createSuccessResponse(
      {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      },
      200,
      'Authenticated',
    )
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    logger.apiError('Error validating customer token', '/api/customers/me', error as Error)
    throw new ApiError('Failed to validate token', 500, 'VALIDATION_ERROR')
  }
})
