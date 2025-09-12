import { z } from 'zod'

// Common validation patterns
const phoneRegex = /^(\+?1)?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/
const postalCodeRegex = /^[A-Za-z0-9\s\-]{3,10}$/
const countryOptions = [
  'NG',
  'KE',
  'ZA',
  'GH',
  'UG',
  'TZ',
  'ET',
  'MA',
  'EG',
  'DZ',
  'OTHER',
] as const

// Contact Information Schema
export const contactInfoSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(phoneRegex, 'Please enter a valid phone number (e.g., +1234567890)')
    .max(20, 'Phone number must be less than 20 characters'),
  subscribeToNewsletter: z.boolean().optional(),
})

// Address Schema (reusable for shipping and billing)
export const addressSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(
      /^[a-zA-Z\s\-']+$/,
      'First name can only contain letters, spaces, hyphens, and apostrophes',
    ),

  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(
      /^[a-zA-Z\s\-']+$/,
      'Last name can only contain letters, spaces, hyphens, and apostrophes',
    ),

  company: z.string().max(100, 'Company name must be less than 100 characters').optional(),

  address1: z
    .string()
    .min(1, 'Address is required')
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters'),

  address2: z.string().max(200, 'Address line 2 must be less than 200 characters').optional(),

  city: z
    .string()
    .min(1, 'City is required')
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'City can only contain letters, spaces, hyphens, and apostrophes'),

  state: z
    .string()
    .min(1, 'State/Province is required')
    .min(2, 'State/Province must be at least 2 characters')
    .max(100, 'State/Province must be less than 100 characters'),

  postalCode: z
    .string()
    .min(1, 'Postal code is required')
    .min(3, 'Postal code must be at least 3 characters')
    .max(10, 'Postal code must be less than 10 characters')
    .regex(postalCodeRegex, 'Please enter a valid postal code'),

  country: z.enum(countryOptions).refine((val) => countryOptions.includes(val), {
    message: 'Please select a valid country',
  }),
})

// Shipping Information Schema
export const shippingInfoSchema = addressSchema.extend({
  shippingMethod: z.enum(['standard', 'express', 'overnight', 'pickup']).default('standard'),

  specialInstructions: z
    .string()
    .max(500, 'Special instructions must be less than 500 characters')
    .optional(),
})

// Billing Information Schema
export const billingInfoSchema = z.object({
  sameAsShipping: z.boolean().default(true),
  billingAddress: addressSchema.optional(),
})

// Payment Method Schema
export const paymentMethodSchema = z.object({
  saveCard: z.boolean().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions to continue',
  }),
  acceptMarketing: z.boolean().optional(),
})

// Contact Form Schema
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),

  subject: z
    .string()
    .min(1, 'Subject is required')
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),

  message: z
    .string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),

  inquiryType: z.enum(['general', 'support', 'sales', 'partnership', 'other']).default('general'),

  subscribeToNewsletter: z.boolean().optional(),
})

// Complete Checkout Schema
export const checkoutSchema = z.object({
  contactInfo: contactInfoSchema,
  shippingInfo: shippingInfoSchema,
  billingInfo: billingInfoSchema,
  paymentMethod: paymentMethodSchema,
})

// Validation error types
export type ContactInfoFormData = z.infer<typeof contactInfoSchema>
export type ShippingInfoFormData = z.infer<typeof shippingInfoSchema>
export type BillingInfoFormData = z.infer<typeof billingInfoSchema>
export type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>
export type ContactFormData = z.infer<typeof contactFormSchema>
export type CheckoutFormData = z.infer<typeof checkoutSchema>

// Server-side validation schemas (more strict)
export const serverContactInfoSchema = contactInfoSchema.extend({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters')
    .transform((val) => val.toLowerCase().trim()),

  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(phoneRegex, 'Please enter a valid phone number')
    .max(20, 'Phone number must be less than 20 characters')
    .transform((val) => val.replace(/\s+/g, '')),
})

export const serverAddressSchema = addressSchema.extend({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .transform((val) => val.trim()),

  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .transform((val) => val.trim()),

  address1: z
    .string()
    .min(1, 'Address is required')
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters')
    .transform((val) => val.trim()),

  city: z
    .string()
    .min(1, 'City is required')
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be less than 100 characters')
    .transform((val) => val.trim()),

  state: z
    .string()
    .min(1, 'State/Province is required')
    .min(2, 'State/Province must be at least 2 characters')
    .max(100, 'State/Province must be less than 100 characters')
    .transform((val) => val.trim()),

  postalCode: z
    .string()
    .min(1, 'Postal code is required')
    .min(3, 'Postal code must be at least 3 characters')
    .max(10, 'Postal code must be less than 10 characters')
    .transform((val) => val.trim().toUpperCase()),
})

// Validation helper functions
export const validateField = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: z.ZodError } => {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

export const validateFieldAsync = async <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): Promise<{ success: true; data: T } | { success: false; errors: z.ZodError }> => {
  try {
    const result = await schema.parseAsync(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

// Error message formatters
export const formatValidationErrors = (errors: z.ZodError): Record<string, string> => {
  const formattedErrors: Record<string, string> = {}

  errors.issues.forEach((error) => {
    const field = error.path.join('.')
    formattedErrors[field] = error.message
  })

  return formattedErrors
}

export const getFieldError = (
  errors: Record<string, string>,
  field: string,
): string | undefined => {
  return errors[field]
}
