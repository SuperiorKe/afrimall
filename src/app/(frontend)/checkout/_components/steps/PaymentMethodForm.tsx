'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useCheckout } from '../CheckoutContext'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { getStripe, stripeElementsOptions } from '@/utilities/stripe-client'

const paymentMethodSchema = z.object({
  saveCard: z.boolean().optional(),
})

type FormData = z.infer<typeof paymentMethodSchema>

// Stripe Elements component
function StripePaymentForm() {
  const stripe = useStripe()
  const elements = useElements()
  const { formData, updateFormData, setCurrentStep, stripePayment, createPaymentIntent } =
    useCheckout()
  const [isCardComplete, setIsCardComplete] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: formData.paymentMethod,
  })

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

  const handleCardChange = (event: any) => {
    setIsCardComplete(event.complete)
    setCardError(event.error ? event.error.message : null)
  }

  const onSubmit = async (data: FormData) => {
    if (!stripe || !elements || !isCardComplete) {
      return
    }

    // Mock cart total - in real app, this would come from cart context
    const mockTotal = 129.97 // This should come from your cart/order total

    // Create payment intent
    const success = await createPaymentIntent(mockTotal, 'usd')

    if (success) {
      updateFormData({ paymentMethod: data })
      setCurrentStep(5) // Move to review step
    }
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
        <div className="flex items-center space-x-2">
          <Checkbox id="saveCard" {...register('saveCard')} />
          <Label htmlFor="saveCard" className="text-sm text-gray-700">
            Save card for future purchases
          </Label>
        </div>

        {/* Payment processing error */}
        {stripePayment.error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{stripePayment.error}</div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <Button type="button" variant="outline" onClick={() => setCurrentStep(3)}>
          Back
        </Button>
        <Button type="submit" disabled={!stripe || !isCardComplete || stripePayment.isProcessing}>
          {stripePayment.isProcessing ? 'Processing...' : 'Review Order'}
        </Button>
      </div>
    </form>
  )
}

// Main component that provides Stripe context
export function PaymentMethodForm() {
  const [stripePromise] = useState(() => getStripe())

  return (
    <Elements stripe={stripePromise} options={stripeElementsOptions}>
      <StripePaymentForm />
    </Elements>
  )
}
