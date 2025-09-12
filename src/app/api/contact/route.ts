import { NextRequest, NextResponse } from 'next/server'
import { contactFormSchema } from '@/lib/validation/checkout-schemas'
import { z } from 'zod'

// Server-side validation schema (more strict)
const serverContactFormSchema = contactFormSchema.extend({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .transform((val) => val.trim()),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters')
    .transform((val) => val.toLowerCase().trim()),

  subject: z
    .string()
    .min(1, 'Subject is required')
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters')
    .transform((val) => val.trim()),

  message: z
    .string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters')
    .transform((val) => val.trim()),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body
    const validationResult = serverContactFormSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 },
      )
    }

    const { name, email, subject, message, inquiryType, subscribeToNewsletter } =
      validationResult.data

    // TODO: Implement actual email sending logic here
    // For now, we'll just log the contact form submission
    console.log('Contact form submission:', {
      name,
      email,
      subject,
      message,
      inquiryType,
      subscribeToNewsletter,
      timestamp: new Date().toISOString(),
    })

    // In a real implementation, you would:
    // 1. Send an email to your support team
    // 2. Send a confirmation email to the user
    // 3. Store the inquiry in your database
    // 4. Set up notifications for urgent inquiries

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json(
      {
        success: true,
        message: 'Your message has been sent successfully!',
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Contact form API error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to send your message. Please try again later.',
      },
      { status: 500 },
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
