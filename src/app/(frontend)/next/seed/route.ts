import { createLocalReq, getPayload } from 'payload'
import { seed } from '@/endpoints/seed'
import config from '@payload-config'
import { headers } from 'next/headers'

export const maxDuration = 60 // This function can run for a maximum of 60 seconds

export async function POST(): Promise<Response> {
  try {
    const payload = await getPayload({ config })
    const requestHeaders = await headers()

    // Authenticate by passing request headers
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) {
      payload.logger.warn('Seed attempt without authentication')
      return new Response('Action forbidden. Please log in to the admin panel first.', {
        status: 403,
        headers: { 'Content-Type': 'text/plain' },
      })
    }

    payload.logger.info(`Seeding initiated by user: ${user.email}`)

    // Create a Payload request object to pass to the Local API for transactions
    const payloadReq = await createLocalReq({ user }, payload)

    await seed({ payload, req: payloadReq })

    payload.logger.info('Seeding completed successfully')
    return Response.json({
      success: true,
      message: 'Database seeded successfully! Your Afrimall categories have been created.',
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
