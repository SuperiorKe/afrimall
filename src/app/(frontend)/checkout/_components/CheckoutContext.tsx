'use client'

import { createContext, useContext, useState } from 'react'
import { z } from 'zod'
import { useCart } from '@/contexts/CartContext'
import {
  contactInfoSchema,
  addressSchema,
  shippingInfoSchema,
  type ContactInfoFormData,
  type ShippingInfoFormData,
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
  createPaymentIntent: (amount: number, currency?: string, orderId?: string) => Promise<boolean>
  resetPaymentState: () => void
  // Customer management
  createCustomer: () => Promise<string | null>
  customerId: string | null

  // Order management
  createOrder: (paymentIntentId: string) => Promise<any>
  createOrderBeforePayment: (
    items: any[],
    total: number,
    customerId: string,
  ) => Promise<string | null>
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
    const newFormData = {
      ...formData,
      ...data,
    }

    console.log('CheckoutContext: Updating form data:', {
      previousData: formData,
      newData: data,
      mergedData: newFormData,
    })

    setFormData(newFormData)

    // If we have all required info and no customer ID, try to create customer
    if (
      !customerId &&
      newFormData.contactInfo?.email &&
      newFormData.contactInfo?.phone &&
      newFormData.shippingAddress?.firstName &&
      newFormData.shippingAddress?.lastName
    ) {
      console.log('CheckoutContext: All required data available, attempting customer creation...')
      // Wait a bit for the state to update, then try to create customer
      setTimeout(async () => {
        await createCustomer()
      }, 100)
    }
  }

  const createPaymentIntent = async (
    amount: number,
    currency = 'usd',
    orderId?: string,
  ): Promise<boolean> => {
    setStripePayment((prev) => ({ ...prev, isProcessing: true, error: null }))

    try {
      // Only include email if it's valid
      const email = formData.contactInfo.email?.trim()
      const hasValidEmail = email && email.includes('@')

      const response = await fetch('/api/ecommerce/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          orderId: orderId || '', // Include orderId in the request
          ...(hasValidEmail && { customerEmail: email }),
          metadata: {
            customerName: `${formData.shippingAddress.firstName} ${formData.shippingAddress.lastName}`,
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payment intent')
      }

      // Extract data from the API response wrapper
      const { clientSecret, paymentIntentId } = result.data

      setStripePayment((prev) => ({
        ...prev,
        clientSecret,
        paymentIntentId,
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
        console.log('Missing required fields for customer creation:', {
          email: !!contactInfo.email,
          phone: !!contactInfo.phone,
          firstName: !!shippingAddress.firstName,
          lastName: !!shippingAddress.lastName,
        })
        return null
      }

      console.log('Creating customer with data:', {
        email: contactInfo.email,
        phone: contactInfo.phone,
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
      })

      const response = await fetch('/api/ecommerce/customers', {
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

      console.log('Customer API response:', { status: response.status, data })

      if (data.success) {
        console.log('Customer created successfully:', data.data.id)
        setCustomerId(data.data.id)
        return data.data.id
      } else {
        console.error('Failed to create customer:', {
          message: data.message,
          error: data.error,
          details: data.details,
        })
        return null
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
        })
      }
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

  const createOrderBeforePayment = async (
    items: any[],
    total: number,
    customerIdParam: string,
  ): Promise<string | null> => {
    try {
      if (!customerIdParam) {
        console.error('Customer ID is required to create order')
        return null
      }

      if (!items || items.length === 0) {
        console.error('Cannot create order with empty items')
        return null
      }

      if (!formData.shippingAddress?.firstName || !formData.shippingAddress?.lastName) {
        console.error('Shipping address is incomplete')
        return null
      }

      console.log('Creating order BEFORE payment with data:', {
        itemCount: items.length,
        total,
        customerId: customerIdParam,
      })

      // Calculate shipping and tax
      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
      const shipping = subtotal * 0.1
      const tax = subtotal * 0.1

      const response = await fetch('/api/ecommerce/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Order details
          items: items.map((item) => ({
            product: item.product.id,
            variant: item.variant?.id || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            productSnapshot: {
              title: item.product.title,
              sku: item.product.sku || item.product.id,
            },
          })),
          total: total,
          currency: 'USD',

          // Customer information
          customer: customerIdParam,

          // Addresses
          shippingAddress: formData.shippingAddress,
          billingAddress: formData.sameAsBilling
            ? formData.shippingAddress
            : formData.billingAddress,

          // Payment information - set as pending
          paymentMethod: 'credit_card',
          paymentStatus: 'pending',
          paymentReference: '',
          stripePaymentIntentId: '',

          // Shipping information
          shippingMethod: formData.shippingMethod || 'standard',
          specialInstructions: '',

          // Order status - start as pending
          status: 'pending',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || errorData.message || 'Failed to create order'
        
        // Check for specific inventory errors
        if (errorMessage.includes('Insufficient inventory') || errorMessage.includes('INSUFFICIENT_INVENTORY')) {
          console.error('Inventory error:', errorMessage)
          throw new Error('OUT_OF_STOCK')
        }
        
        console.error('Failed to create order before payment:', errorMessage)
        throw new Error(errorMessage)
      }

      const order = await response.json()
      const createdOrderId = order?.data?.id || order?.id

      if (createdOrderId) {
        console.log('Order created successfully before payment:', createdOrderId)
        setOrderId(createdOrderId)
        return createdOrderId
      }

      console.error('No order ID returned from create order API')
      throw new Error('No order ID received from server')
    } catch (error) {
      console.error('Error creating order before payment:', error)
      // Re-throw the error to be handled by the caller
      throw error
    }
  }

  const createOrder = async (paymentIntentId: string): Promise<any> => {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required')
      }

      if (!formData.shippingAddress?.firstName) {
        throw new Error('Shipping address is required')
      }

      // Note: This function is not currently used in the checkout flow
      // The actual order creation happens in OrderReview.tsx with proper cart data
      // This function is kept for potential future use or API consistency

      throw new Error(
        'This createOrder function is deprecated. Use the one in OrderReview.tsx instead.',
      )
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
        createOrderBeforePayment,
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
