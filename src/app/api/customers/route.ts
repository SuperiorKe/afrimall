import { NextRequest } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { createSuccessResponse, withErrorHandling, ApiError } from '@/utilities/apiResponse'
import { logger } from '@/utilities/logger'

export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const payload = await getPayloadHMR({ config: configPromise })

    const {
      email,
      phone,
      firstName,
      lastName,
      subscribeToNewsletter = false,
      addresses = [],
    } = body

    // Validate required fields
    if (!email || !firstName || !lastName) {
      throw new ApiError('Email, first name, and last name are required', 400, 'MISSING_FIELDS')
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
      // Return existing customer
      const customer = existingCustomer.docs[0]

      logger.info('Customer already exists, returning existing customer', 'API:customers', {
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
          isNew: false,
        },
        200,
        'Customer already exists',
      )
    }

    // Create new customer (without password for checkout purposes)
    const customer = await payload.create({
      collection: 'customers',
      data: {
        email,
        phone,
        firstName,
        lastName,
        addresses,
        preferences: {
          newsletter: subscribeToNewsletter,
          currency: 'USD',
          language: 'en',
        },
        status: 'active',
        customerGroup: 'regular',
        // Generate a temporary password for checkout customers
        password: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        _verified: true, // Skip email verification for checkout customers
      },
    })

    logger.info('Customer created successfully', 'API:customers', {
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
        isNew: true,
      },
      201,
      'Customer created successfully',
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
      if (errorMessage.includes('password')) {
        throw new ApiError('Password is required for customer creation', 400, 'PASSWORD_REQUIRED')
      }
    }

    logger.apiError('Error creating customer', '/api/customers', error as Error)
    throw new ApiError('Failed to create customer', 500, 'CREATE_ERROR')
  }
})
