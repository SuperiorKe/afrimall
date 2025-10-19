import { NextRequest } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { createSuccessResponse, withErrorHandling, ApiError } from '@/lib/api/apiResponse'
import { logger } from '@/lib/api/logger'

export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const payload = await getPayloadHMR({ config: configPromise })

    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      throw new ApiError('Email and password are required', 400, 'MISSING_FIELDS')
    }

    // Authenticate customer using Payload's login method
    const result = await payload.login({
      collection: 'customers',
      data: {
        email,
        password,
      },
      req: request,
    })

    logger.info('Customer logged in successfully', 'API:customers:login', {
      customerId: result.user.id,
      email: result.user.email,
    })

    return createSuccessResponse(
      {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        phone: result.user.phone,
        token: result.token,
        user: result.user,
      },
      200,
      'Login successful',
    )
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // Handle authentication errors
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as any).message
      if (errorMessage.includes('Invalid credentials') || errorMessage.includes('authentication')) {
        throw new ApiError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
      }
    }

    logger.apiError('Error logging in customer', '/api/customers/login', error as Error)
    throw new ApiError('Failed to login', 500, 'LOGIN_ERROR')
  }
})
