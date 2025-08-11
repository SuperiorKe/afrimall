// Client-side Stripe configuration
import { loadStripe, Stripe } from '@stripe/stripe-js'

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in environment variables')
}

// Singleton pattern for Stripe instance
let stripePromise: Promise<Stripe | null>

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

// Stripe Elements appearance configuration
export const stripeElementsAppearance = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#0070f3',
    colorBackground: '#ffffff',
    colorText: '#30313d',
    colorDanger: '#df1b41',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px',
  },
  rules: {
    '.Input': {
      border: '1px solid #e1e5e9',
      padding: '12px',
      fontSize: '14px',
    },
    '.Input:focus': {
      borderColor: '#0070f3',
      boxShadow: '0 0 0 2px rgba(0, 112, 243, 0.1)',
    },
    '.Label': {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '6px',
    },
  },
}

// Common Stripe Elements options
export const stripeElementsOptions = {
  appearance: stripeElementsAppearance,
  locale: 'en' as const,
}
