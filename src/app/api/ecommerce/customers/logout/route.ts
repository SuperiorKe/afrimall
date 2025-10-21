import { NextRequest } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { createSuccessResponse, withErrorHandling, ApiError } from '@/lib/api/apiResponse'
import { logger } from '@/lib/api/logger'

export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const payload = await getPayloadHMR({ config: configPromise })

    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, just return success (client-side cleanup)
      return createSuccessResponse({ loggedOut: true }, 200, 'Logged out successfully')
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Note: JWT verification temporarily disabled due to API changes
    // The token will naturally expire based on the tokenExpiration setting
    logger.info('Customer logout requested', 'API:customers:logout', {
      hasToken: !!token,
    })

    // Note: Payload CMS doesn't have a built-in logout method that invalidates tokens
    // The token will naturally expire based on the tokenExpiration setting
    // For enhanced security, you could implement a token blacklist in the future

    return createSuccessResponse({ loggedOut: true }, 200, 'Logged out successfully')
  } catch (error) {
    // Even if there's an error, we want to allow logout for client-side cleanup
    logger.apiError('Error during logout', '/api/customers/logout', error as Error)

    return createSuccessResponse({ loggedOut: true }, 200, 'Logged out successfully')
  }
})
