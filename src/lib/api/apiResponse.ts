import { NextResponse } from 'next/server'
import { logger } from './logger'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    timestamp: string
    path: string
    method: string
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    timestamp: string
    path: string
    method: string
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const createSuccessResponse = <T>(
  data: T,
  statusCode: number = 200,
  message?: string,
): NextResponse<ApiResponse<T>> => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      path: '', // Will be set by the route handler
      method: '', // Will be set by the route handler
    },
  }

  return NextResponse.json(response, { status: statusCode })
}

export const createErrorResponse = (
  error: string | Error | ApiError,
  statusCode: number = 500,
  details?: any,
): NextResponse<ApiResponse> => {
  let message: string
  let code: string | undefined
  let finalStatusCode = statusCode

  if (error instanceof ApiError) {
    message = error.message
    code = error.code
    finalStatusCode = error.statusCode
  } else if (error instanceof Error) {
    message = error.message
  } else {
    message = String(error)
  }

  const response: ApiResponse = {
    success: false,
    error: message,
    meta: {
      timestamp: new Date().toISOString(),
      path: '', // Will be set by the route handler
      method: '', // Will be set by the route handler
    },
  }

  if (code) {
    response.error = `${code}: ${message}`
  }

  // Log the error
  logger.apiError(message, '', new Error(message), { statusCode: finalStatusCode, details })

  return NextResponse.json(response, { status: finalStatusCode })
}

export const createPaginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string,
): NextResponse<PaginatedResponse<T>> => {
  const totalPages = Math.ceil(total / limit)

  const response: PaginatedResponse<T> = {
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      path: '', // Will be set by the route handler
      method: '', // Will be set by the route handler
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  }

  return NextResponse.json(response)
}

// Common error responses
export const notFoundResponse = (message: string = 'Resource not found') =>
  createErrorResponse(message, 404, 'NOT_FOUND')

export const unauthorizedResponse = (message: string = 'Unauthorized') =>
  createErrorResponse(message, 401, 'UNAUTHORIZED')

export const forbiddenResponse = (message: string = 'Forbidden') =>
  createErrorResponse(message, 403, 'FORBIDDEN')

export const badRequestResponse = (message: string = 'Bad request') =>
  createErrorResponse(message, 400, 'BAD_REQUEST')

export const validationErrorResponse = (message: string = 'Validation failed') =>
  createErrorResponse(message, 422, 'VALIDATION_ERROR')

export const internalServerErrorResponse = (message: string = 'Internal server error') =>
  createErrorResponse(message, 500, 'INTERNAL_ERROR')

// Helper to wrap route handlers with error handling
export const withErrorHandling = <T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
) => {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      logger.apiError('Unhandled error in route handler', '', error as Error)

      if (error instanceof ApiError) {
        return createErrorResponse(error)
      }

      return internalServerErrorResponse()
    }
  }
}
