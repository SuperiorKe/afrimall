import { NextRequest } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import {
  createSuccessResponse,
  withErrorHandling,
  ApiError,
} from '@/utilities/apiResponse'
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

    // Create new customer
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

    logger.apiError('Error creating customer', '/api/customers', error as Error)
    throw new ApiError('Failed to create customer', 500, 'CREATE_ERROR')
  }
})
