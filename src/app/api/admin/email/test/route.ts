import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email/email'
import { emailQueue } from '@/lib/email/emailQueue'
import { withErrorHandling, createSuccessResponse, ApiError } from '@/lib/api/apiResponse'
import { logger } from '@/lib/api/logger'

// Test email configuration
export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    const configStatus = emailService.getConfigStatus()
    const queueStatus = emailQueue.getStatus()

    return createSuccessResponse(
      {
        emailService: {
          configured: configStatus.configured,
          host: configStatus.host,
          from: configStatus.from,
        },
        queue: {
          total: queueStatus.total,
          pending: queueStatus.pending,
          processing: queueStatus.processing,
        },
      },
      200,
      'Email system status retrieved successfully',
    )
  } catch (error) {
    logger.error('Error getting email system status', 'API:email/test', error as Error)
    throw new ApiError('Failed to get email system status', 500, 'STATUS_ERROR')
  }
})

// Test email connection
export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { action, testEmail } = body

    if (!action) {
      throw new ApiError('Action is required', 400, 'MISSING_ACTION')
    }

    switch (action) {
      case 'test_connection': {
        const isConnected = await emailService.testConnection()

        return createSuccessResponse(
          {
            connected: isConnected,
            message: isConnected
              ? 'Email service connection successful'
              : 'Email service connection failed',
          },
          200,
          'Connection test completed',
        )
      }

      case 'send_test_email': {
        if (!testEmail) {
          throw new ApiError('Test email address is required', 400, 'MISSING_EMAIL')
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(testEmail)) {
          throw new ApiError('Invalid email format', 400, 'INVALID_EMAIL')
        }

        // Send test email
        const success = await emailService.sendAdminNotification(
          'Test Email from AfriMall',
          `This is a test email sent at ${new Date().toLocaleString()}.\n\nIf you received this email, the email system is working correctly!`,
          testEmail,
        )

        return createSuccessResponse(
          {
            sent: success,
            message: success ? 'Test email sent successfully' : 'Failed to send test email',
          },
          200,
          'Test email completed',
        )
      }

      case 'queue_status': {
        const status = emailQueue.getStatus()

        return createSuccessResponse(status, 200, 'Queue status retrieved successfully')
      }

      case 'clear_queue': {
        emailQueue.clearQueue()

        return createSuccessResponse(
          {
            cleared: true,
            message: 'Email queue cleared successfully',
          },
          200,
          'Queue cleared successfully',
        )
      }

      default:
        throw new ApiError('Invalid action', 400, 'INVALID_ACTION')
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    logger.error('Error in email test endpoint', 'API:email/test', error as Error)
    throw new ApiError('Email test failed', 500, 'TEST_ERROR')
  }
})
