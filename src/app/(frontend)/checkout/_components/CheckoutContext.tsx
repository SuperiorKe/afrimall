'use client'

import { createContext, useContext, useState } from 'react'
import { z } from 'zod'

export const contactInfoSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  subscribeToNewsletter: z.boolean().optional(),
})

export const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State/Province is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
})

// Simplified payment method schema for Stripe integration
const _paymentMethodSchema = z.object({
  saveCard: z.boolean().optional(),
})

type CheckoutData = {
  contactInfo: z.infer<typeof contactInfoSchema>
  shippingAddress: z.infer<typeof addressSchema>
  billingAddress: z.infer<typeof addressSchema>
  paymentMethod: z.infer<typeof _paymentMethodSchema>
  shippingMethod: string
  sameAsBilling: boolean
}

// Stripe payment state
type StripePaymentState = {
  clientSecret: string | null
  paymentIntentId: string | null
  isProcessing: boolean
  error: string | null
}

type CheckoutContextType = {
  currentStep: number
  setCurrentStep: (step: number) => void
  formData: CheckoutData
  updateFormData: (data: Partial<CheckoutData>) => void
  // Stripe payment methods
  stripePayment: StripePaymentState
  createPaymentIntent: (amount: number, currency?: string) => Promise<boolean>
  resetPaymentState: () => void
}

const initialState: CheckoutData = {
  contactInfo: {
    email: '',
    phone: '',
    subscribeToNewsletter: false,
  },
  shippingAddress: {
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    country: '',
    state: '',
    postalCode: '',
  },
  billingAddress: {
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    country: '',
    state: '',
    postalCode: '',
  },
  paymentMethod: {
    saveCard: false,
  },
  shippingMethod: 'standard',
  sameAsBilling: true,
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined)

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<CheckoutData>(initialState)
  const [stripePayment, setStripePayment] = useState<StripePaymentState>({
    clientSecret: null,
    paymentIntentId: null,
    isProcessing: false,
    error: null,
  })

  const updateFormData = (data: Partial<CheckoutData>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }))
  }

  const createPaymentIntent = async (amount: number, currency = 'usd'): Promise<boolean> => {
    setStripePayment((prev) => ({ ...prev, isProcessing: true, error: null }))

    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          customerEmail: formData.contactInfo.email,
          metadata: {
            customerName: `${formData.shippingAddress.firstName} ${formData.shippingAddress.lastName}`,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent')
      }

      setStripePayment((prev) => ({
        ...prev,
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId,
        isProcessing: false,
      }))

      return true
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      setStripePayment((prev) => ({
        ...prev,
        error: errorMessage,
        isProcessing: false,
      }))
      return false
    }
  }

  const resetPaymentState = () => {
    setStripePayment({
      clientSecret: null,
      paymentIntentId: null,
      isProcessing: false,
      error: null,
    })
  }

  return (
    <CheckoutContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        formData,
        updateFormData,
        stripePayment,
        createPaymentIntent,
        resetPaymentState,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  )
}

export const useCheckout = () => {
  const context = useContext(CheckoutContext)
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider')
  }
  return context
}
