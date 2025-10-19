import { NextRequest } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { createSuccessResponse, withErrorHandling, ApiError } from '@/lib/api/apiResponse'
import { logger } from '@/lib/api/logger'

export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const payload = await getPayloadHMR({ config: configPromise })

    const { email, password, firstName, lastName, phone, preferences = {} } = body

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      throw new ApiError(
        'Email, password, first name, and last name are required',
        400,
        'MISSING_FIELDS',
      )
    }

    // Validate password strength
    if (password.length < 6) {
      throw new ApiError('Password must be at least 6 characters long', 400, 'WEAK_PASSWORD')
    }

    // Check if customer already exists
    const existingCustomer = await payload.find({
      collection: 'customers',
      where: {
        email: { equals: email },
      },
      limit: 1,
    })

    if (existingCustomer.docs.length > 0) {
      throw new ApiError('A customer with this email already exists', 409, 'EMAIL_EXISTS')
    }

    // Create new customer with authentication
    const customer = await payload.create({
      collection: 'customers',
      data: {
        email,
        password, // Payload will automatically hash this
        firstName,
        lastName,
        phone,
        preferences: {
          newsletter: preferences.newsletter || false,
          currency: 'USD',
          language: 'en',
        },
        status: 'active',
        customerGroup: 'regular',
      },
    })

    // Generate authentication token for the new customer
    const token = await payload.login({
      collection: 'customers',
      data: {
        email,
        password,
      },
      req: request,
    })

    logger.info('Customer registered successfully', 'API:customers:register', {
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
        token: token.token,
        user: token.user,
      },
      201,
      'Customer registered successfully',
    )
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // Handle Payload-specific errors
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as any).message
      if (errorMessage.includes('email') && errorMessage.includes('unique')) {
        throw new ApiError('A customer with this email already exists', 409, 'EMAIL_EXISTS')
      }
    }

    logger.apiError('Error registering customer', '/api/customers/register', error as Error)
    throw new ApiError('Failed to register customer', 500, 'REGISTER_ERROR')
  }
})
