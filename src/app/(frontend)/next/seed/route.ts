import { createLocalReq, getPayload } from 'payload'
import { seed } from '@/endpoints/seed'
import config from '@payload-config'
import { headers } from 'next/headers'

export const maxDuration = 60 // This function can run for a maximum of 60 seconds

export async function POST(): Promise<Response> {
  try {
    const payload = await getPayload({ config })
    const requestHeaders = await headers()

    // For initial setup, we'll try to seed directly without checking user count
    // since the users table might not exist yet
    let isInitialSetup = false
    let user = null

    try {
      // Try to check if users exist, but don't fail if tables don't exist
      const userCount = await payload.count({ collection: 'users' })
      isInitialSetup = userCount.totalDocs === 0
    } catch (error) {
      // If we can't count users (tables don't exist), assume this is initial setup
      payload.logger.info('Cannot count users - assuming initial setup')
      isInitialSetup = true
    }

    // Allow seeding without authentication during initial setup
    if (!isInitialSetup) {
      // Authenticate by passing request headers for subsequent seeding
      const authResult = await payload.auth({ headers: requestHeaders })
      user = authResult.user

      if (!user) {
        payload.logger.warn('Seed attempt without authentication')
        return new Response('Action forbidden. Please log in to the admin panel first.', {
          status: 403,
          headers: { 'Content-Type': 'text/plain' },
        })
      }

      payload.logger.info(`Seeding initiated by user: ${user.email}`)
    } else {
      payload.logger.info('Initial database setup - seeding without authentication')
    }

    // Create a Payload request object to pass to the Local API for transactions
    const payloadReq = isInitialSetup
      ? await createLocalReq({ user: undefined }, payload)
      : await createLocalReq({ user: user || undefined }, payload)

    await seed({ payload, req: payloadReq })

    payload.logger.info('Seeding completed successfully')
    return Response.json({
      success: true,
      message: isInitialSetup
        ? 'Initial database setup completed! Your Afrimall database has been created.'
        : 'Database seeded successfully! Your Afrimall categories have been created.',
    })
  } catch (e: any) {
    const errorMessage = e?.message || 'Unknown error occurred'
    const errorStack = e?.stack || 'No stack trace available'

    console.error('Seeding error details:', {
      message: errorMessage,
      stack: errorStack,
      error: e,
    })

    return Response.json(
      {
        success: false,
        error: errorMessage,
        details:
          process.env.NODE_ENV === 'development' ? errorStack : 'Check server logs for details',
      },
      { status: 500 },
    )
  }
}
