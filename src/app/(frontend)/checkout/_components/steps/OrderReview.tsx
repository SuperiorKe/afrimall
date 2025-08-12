'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCheckout } from '../CheckoutContext'
import { Button } from '@/components/ui/button'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import Image from 'next/image'

export function OrderReview() {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  const { formData, setCurrentStep, stripePayment, resetPaymentState } = useCheckout()
  const { contactInfo, shippingAddress, billingAddress, sameAsBilling } = formData

  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Mock cart items - in a real app, this would come from your cart context
  const cartItems = [
    { id: 1, name: 'Product 1', price: 29.99, quantity: 1, image: '/placeholder-product.jpg' },
    { id: 2, name: 'Product 2', price: 49.99, quantity: 2, image: '/placeholder-product.jpg' },
  ]

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 9.99 // This would be calculated based on shipping method
  const tax = subtotal * 0.1 // Example tax calculation
  const total = subtotal + shipping + tax

  const createOrder = async (paymentIntentId: string) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Order details
          items: cartItems,
          total: total,
          currency: 'USD',

          // Customer information
          customer: {
            email: contactInfo.email,
            phone: contactInfo.phone,
          },

          // Addresses
          shippingAddress: shippingAddress,
          billingAddress: sameAsBilling ? shippingAddress : billingAddress,

          // Payment information
          paymentMethod: 'credit_card',
          paymentStatus: 'paid',
          paymentReference: paymentIntentId,
          stripePaymentIntentId: paymentIntentId,

          // Order status
          status: 'confirmed',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const order = await response.json()
      return order
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  }

  const handlePlaceOrder = async () => {
    if (!stripe || !elements || !stripePayment.clientSecret) {
      setPaymentError('Payment system not ready. Please try again.')
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(stripePayment.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
            email: contactInfo.email,
            phone: contactInfo.phone,
            address: {
              line1: sameAsBilling ? shippingAddress.address1 : billingAddress.address1,
              line2: sameAsBilling ? shippingAddress.address2 : billingAddress.address2,
              city: sameAsBilling ? shippingAddress.city : billingAddress.city,
              state: sameAsBilling ? shippingAddress.state : billingAddress.state,
              postal_code: sameAsBilling ? shippingAddress.postalCode : billingAddress.postalCode,
              country: sameAsBilling ? shippingAddress.country : billingAddress.country,
            },
          },
        },
      })

      if (error) {
        setPaymentError(error.message || 'Payment failed. Please try again.')
        setIsProcessing(false)
        return
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Create order in our system
        const order = await createOrder(paymentIntent.id)

        setPaymentSuccess(true)
        resetPaymentState()

        // Redirect to order confirmation page
        setTimeout(() => {
          router.push(`/order-confirmation/${order.id}`)
        }, 2000)
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
      setPaymentError(errorMessage)
      setIsProcessing(false)
    }
  }

  if (paymentSuccess) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mt-2 text-lg font-medium text-gray-900">Payment Successful!</h3>
        <p className="mt-1 text-sm text-gray-500">
          Your order has been confirmed. Redirecting to order details...
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-medium mb-4">Contact Information</h3>
        <p className="text-gray-700">{contactInfo.email}</p>
        <p className="text-gray-700">{contactInfo.phone}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
          <address className="not-italic text-gray-700">
            <p>
              {shippingAddress.firstName} {shippingAddress.lastName}
            </p>
            <p>{shippingAddress.address1}</p>
            {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
            <p>
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
            </p>
            <p>{shippingAddress.country}</p>
          </address>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Billing Address</h3>
          {sameAsBilling ? (
            <p className="text-gray-700">Same as shipping address</p>
          ) : (
            <address className="not-italic text-gray-700">
              <p>
                {billingAddress.firstName} {billingAddress.lastName}
              </p>
              <p>{billingAddress.address1}</p>
              {billingAddress.address2 && <p>{billingAddress.address2}</p>}
              <p>
                {billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}
              </p>
              <p>{billingAddress.country}</p>
            </address>
          )}
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-medium mb-4">Payment Method</h3>
        <div className="text-gray-700">
          <p>Credit Card (Stripe)</p>
          <p className="text-sm text-gray-500">Payment will be processed securely</p>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-medium mb-4">Order Items</h3>
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="ml-4">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Shipping</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1 font-medium text-lg mt-2">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Error */}
      {paymentError && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="text-sm text-red-800">{paymentError}</div>
        </div>
      )}

      {/* Payment Intent Status */}
      {!stripePayment.clientSecret && (
        <div className="rounded-md bg-yellow-50 p-4 mb-6">
          <div className="text-sm text-yellow-800">
            Please go back and complete the payment method step.
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(4)}
          disabled={isProcessing}
        >
          Back
        </Button>
        <Button
          onClick={handlePlaceOrder}
          disabled={isProcessing || !stripePayment.clientSecret}
          className="bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? 'Processing Payment...' : `Place Order - $${total.toFixed(2)}`}
        </Button>
      </div>
    </div>
  )
}
