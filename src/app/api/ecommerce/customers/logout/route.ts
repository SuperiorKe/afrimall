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

    try {
      // Verify the token to get user info before logout
      const result = await payload.verifyJWT({
        token,
        collection: 'customers',
      })

      if (result.user) {
        // Log the logout event
        logger.info('Customer logged out successfully', 'API:customers:logout', {
          customerId: result.user.id,
          email: result.user.email,
        })
      }
    } catch (verifyError) {
      // Token is invalid, but we still want to return success for client-side cleanup
      logger.warn('Invalid token during logout', 'API:customers:logout', {
        error: verifyError instanceof Error ? verifyError.message : 'Unknown error',
      })
    }

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
