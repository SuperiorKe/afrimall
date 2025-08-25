'use client'

import { createContext, useContext, useState } from 'react'
import { z } from 'zod'
import { useCart } from '@/contexts/CartContext'
import { 
  contactInfoSchema, 
  addressSchema, 
  shippingInfoSchema,
  type ContactInfoFormData,
  type ShippingInfoFormData
} from '@/lib/validation/checkout-schemas'

// Create AddressFormData type from the schema
type AddressFormData = z.infer<typeof addressSchema>

// Payment method schema for Stripe integration
const _paymentMethodSchema = z.object({
  saveCard: z.boolean().optional(),
  acceptTerms: z.boolean().optional(),
  acceptMarketing: z.boolean().optional(),
})

type CheckoutData = {
  contactInfo: ContactInfoFormData
  shippingAddress: AddressFormData
  billingAddress: AddressFormData
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
  updateFormData: (data: Partial<CheckoutData>) => Promise<void>
  // Stripe payment methods
  stripePayment: StripePaymentState
  createPaymentIntent: (amount: number, currency?: string) => Promise<boolean>
  resetPaymentState: () => void
  // Customer management
  createCustomer: () => Promise<string | null>
  customerId: string | null

  // Order management
  createOrder: (paymentIntentId: string) => Promise<any>
  orderId: string | null
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
    country: 'NG' as const,
    state: '',
    postalCode: '',
  },
  billingAddress: {
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    country: 'NG' as const,
    state: '',
    postalCode: '',
  },
  paymentMethod: {
    saveCard: false,
    acceptTerms: false,
    acceptMarketing: false,
  },
  shippingMethod: 'standard',
  sameAsBilling: true,
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined)

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<CheckoutData>(initialState)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [stripePayment, setStripePayment] = useState<StripePaymentState>({
    clientSecret: null,
    paymentIntentId: null,
    isProcessing: false,
    error: null,
  })

  const updateFormData = async (data: Partial<CheckoutData>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }))

    // If we're updating contact info, try to create/retrieve customer
    if (data.contactInfo && !customerId) {
      await createCustomer()
    }
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

  const createCustomer = async (): Promise<string | null> => {
    try {
      const { contactInfo, shippingAddress } = formData

      if (
        !contactInfo.email ||
        !contactInfo.phone ||
        !shippingAddress.firstName ||
        !shippingAddress.lastName
      ) {
        return null
      }

      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: contactInfo.email,
          phone: contactInfo.phone,
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          subscribeToNewsletter: contactInfo.subscribeToNewsletter,
          addresses: [
            {
              type: 'shipping',
              isDefault: true,
              firstName: shippingAddress.firstName,
              lastName: shippingAddress.lastName,
              address1: shippingAddress.address1,
              address2: shippingAddress.address2,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postalCode: shippingAddress.postalCode,
              country: shippingAddress.country,
            },
          ],
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCustomerId(data.data.id)
        return data.data.id
      } else {
        console.error('Failed to create customer:', data.message)
        return null
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      return null
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

  const createOrder = async (paymentIntentId: string): Promise<any> => {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required')
      }

      if (!formData.shippingAddress?.firstName) {
        throw new Error('Shipping address is required')
      }

      const orderData = {
        items: [], // This will be populated from cart context
        total: 0, // This will be calculated from cart
        currency: 'USD',
        customer: customerId,
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.sameAsBilling
          ? formData.shippingAddress
          : formData.billingAddress,
        paymentMethod: 'credit_card',
        paymentStatus: 'paid',
        paymentReference: paymentIntentId,
        stripePaymentIntentId: paymentIntentId,
        shippingMethod: formData.shippingMethod || 'standard',
        specialInstructions: '',
        status: 'confirmed',
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const result = await response.json()
      const newOrderId = result.data.id
      setOrderId(newOrderId)
      return result
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
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
        createCustomer,
        customerId,
        createOrder,
        orderId,
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
