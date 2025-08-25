import { NextRequest } from 'next/server'
import {
  serverContactInfoSchema,
  serverAddressSchema,
  validateFieldAsync,
} from '@/lib/validation/checkout-schemas'
import { createSuccessResponse, createErrorResponse } from '@/utilities/apiResponse'
import { logger } from '@/utilities/logger'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { formType, data } = body

    if (!formType || !data) {
      return createErrorResponse('Form type and data are required', 400)
    }

    let validationResult

    switch (formType) {
      case 'contactInfo':
        validationResult = await validateFieldAsync(serverContactInfoSchema, data)
        break

      case 'shippingAddress':
        validationResult = await validateFieldAsync(serverAddressSchema, data)
        break

      case 'billingAddress':
        validationResult = await validateFieldAsync(serverAddressSchema, data)
        break

      default:
        return createErrorResponse(`Unknown form type: ${formType}`, 400)
    }

    if (!validationResult.success) {
      const formattedErrors = validationResult.errors.issues.map((error: any) => ({
        field: error.path.join('.'),
        message: error.message,
        code: error.code,
      }))

      logger.info('Form validation failed', 'API:validation:checkout', {
        formType,
        errorCount: formattedErrors.length,
        errors: formattedErrors,
      })

      return createSuccessResponse(
        {
          isValid: false,
          errors: formattedErrors,
          formType,
        },
        200,
        'Validation failed',
      )
    }

    logger.info('Form validation successful', 'API:validation:checkout', {
      formType,
      dataKeys: Object.keys(validationResult.data),
    })

    return createSuccessResponse(
      {
        isValid: true,
        data: validationResult.data,
        formType,
      },
      200,
      'Validation successful',
    )
  } catch (error) {
    logger.error('Validation API error', 'API:validation:checkout', error as Error)
    return createErrorResponse('Validation service error', 500)
  }
}

// GET method for validation rules
export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const formType = searchParams.get('formType')

    if (!formType) {
      return createErrorResponse('Form type is required', 400)
    }

    let validationRules

    switch (formType) {
      case 'contactInfo':
        validationRules = {
          email: {
            required: true,
            type: 'email',
            maxLength: 100,
            pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
          },
          phone: {
            required: true,
            type: 'tel',
            maxLength: 20,
            pattern: '^(\\+?1)?[-.\\s]?\\(?([0-9]{3})\\)?[-.\\s]?([0-9]{3})[-.\\s]?([0-9]{4})$',
          },
        }
        break

      case 'address':
        validationRules = {
          firstName: {
            required: true,
            minLength: 2,
            maxLength: 50,
            pattern: "^[a-zA-Z\\s\\-']+$",
          },
          lastName: {
            required: true,
            minLength: 2,
            maxLength: 50,
            pattern: "^[a-zA-Z\\s\\-']+$",
          },
          address1: {
            required: true,
            minLength: 5,
            maxLength: 200,
          },
          city: {
            required: true,
            minLength: 2,
            maxLength: 100,
            pattern: "^[a-zA-Z\\s\\-']+$",
          },
          state: {
            required: true,
            minLength: 2,
            maxLength: 100,
          },
          postalCode: {
            required: true,
            minLength: 3,
            maxLength: 10,
            pattern: '^[A-Za-z0-9\\s\\-]{3,10}$',
          },
          country: {
            required: true,
            type: 'select',
            options: ['NG', 'KE', 'ZA', 'GH', 'UG', 'TZ', 'ET', 'MA', 'EG', 'DZ', 'OTHER'],
          },
        }
        break

      default:
        return createErrorResponse(`Unknown form type: ${formType}`, 400)
    }

    return createSuccessResponse(
      {
        formType,
        validationRules,
        timestamp: new Date().toISOString(),
      },
      200,
      'Validation rules retrieved',
    )
  } catch (error) {
    logger.error('Validation rules API error', 'API:validation:checkout', error as Error)
    return createErrorResponse('Failed to retrieve validation rules', 500)
  }
}
