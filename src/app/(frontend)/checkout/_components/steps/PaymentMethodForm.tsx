'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useCheckout } from '../CheckoutContext'
import { useCart } from '@/contexts/CartContext'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { paymentMethodSchema, type PaymentMethodFormData } from '@/lib/validation/checkout-schemas'

// Stripe Elements component
function StripePaymentForm() {
  const stripe = useStripe()
  const elements = useElements()
  const { updateFormData, formData, createPaymentIntent, stripePayment } = useCheckout()
  const { cart } = useCart()
  const [isCardComplete, setIsCardComplete] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const methods = useForm<PaymentMethodFormData>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      ...formData.paymentMethod,
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    trigger,
    watch,
  } = methods

  // Watch form values for real-time updates
  const watchedValues = watch()

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        padding: '12px',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true, // We collect this in billing address
  }

  const handleCardChange = (event: { complete: boolean; error?: { message: string } }) => {
    setIsCardComplete(event.complete)
    setCardError(event.error ? event.error.message : null)
  }

  const onSubmit = async (data: PaymentMethodFormData) => {
    if (!stripe || !elements || !isCardComplete) {
      return
    }

    if (!cart || cart.items.length === 0) {
      setCardError('Cart is empty. Please add items to continue.')
      return
    }

    if (!data.acceptTerms) {
      setCardError('You must accept the terms and conditions to continue.')
      return
    }

    try {
      setIsSubmitting(true)
      setCardError(null)

      await updateFormData({ paymentMethod: data })
      // The parent component will handle navigation

    } catch (error) {
      console.error('Error updating payment method:', error)
      setCardError('Failed to save payment method. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFieldChange = async (field: keyof PaymentMethodFormData, value: any) => {
    setValue(field, value)
    await trigger(field)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-xl font-semibold mb-6">Payment Method</h2>

      <div className="space-y-6">
        {/* Stripe Card Element */}
        <div>
          <Label htmlFor="card-element" className="block text-sm font-medium text-gray-700 mb-2">
            Card information
          </Label>
          <div className="border border-gray-300 rounded-md p-3 bg-white">
            <CardElement
              id="card-element"
              options={cardElementOptions}
              onChange={handleCardChange}
            />
          </div>
          {cardError && <p className="mt-2 text-sm text-red-600">{cardError}</p>}
        </div>

        {/* Save card option */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <Checkbox
            id="saveCard"
            checked={watchedValues.saveCard || false}
            onCheckedChange={(checked) => handleFieldChange('saveCard', checked)}
          />
          <Label htmlFor="saveCard" className="text-sm text-gray-700 cursor-pointer">
            Save card for future purchases
          </Label>
        </div>

        {/* Terms and conditions */}
        <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Checkbox
            id="acceptTerms"
            required
            checked={watchedValues.acceptTerms || false}
            onCheckedChange={(checked) => handleFieldChange('acceptTerms', checked)}
          />
          <div className="flex-1">
            <Label
              htmlFor="acceptTerms"
              className="text-sm font-medium text-blue-900 cursor-pointer"
            >
              I accept the terms and conditions *
            </Label>
            <p className="text-xs text-blue-700 mt-1">
              By checking this box, you agree to our terms of service and privacy policy.
            </p>
            {errors.acceptTerms && (
              <p className="text-xs text-red-600 mt-1">{errors.acceptTerms.message}</p>
            )}
          </div>
        </div>

        {/* Marketing consent */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <Checkbox
            id="acceptMarketing"
            checked={watchedValues.acceptMarketing || false}
            onCheckedChange={(checked) => handleFieldChange('acceptMarketing', checked)}
          />
          <Label htmlFor="acceptMarketing" className="text-sm text-gray-700 cursor-pointer">
            Send me updates about new products and special offers
          </Label>
        </div>

        {/* Payment processing error */}
        {stripePayment.error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{stripePayment.error}</div>
          </div>
        )}
      </div>

      <div className="mt-8 pt-4 border-t">
        <div className="text-sm text-gray-500 text-center">Step 4 of 5 • Payment Method</div>
      </div>
    </form>
  )
}

// Main component that provides Stripe context
export function PaymentMethodForm() {
  return <StripePaymentForm />
}
