'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCheckout } from '../CheckoutContext'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import Image from 'next/image'
import { CustomerAuthGate } from '@/components/ecommerce/CustomerAuthGate'
import { ErrorDisplay } from '@/components/checkout/ErrorDisplay'
import { LoadingState } from '@/components/checkout/LoadingState'
import { SuccessState } from '@/components/checkout/SuccessState'
import { getDetailedErrorMessage, DetailedError } from '@/lib/checkout/errorHandling'

export function OrderReview() {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  const { formData, setCurrentStep, stripePayment, resetPaymentState, customerId, createCustomer, createPaymentIntent } =
    useCheckout()
  const { contactInfo, shippingAddress, billingAddress, sameAsBilling } = formData
  const { cart, clearCart } = useCart()

  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<DetailedError | null>(null)
  const [isCardComplete, setIsCardComplete] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Try to create customer when component mounts if all required data is available
  useEffect(() => {
    console.log('OrderReview: Current form data:', {
      contactInfo,
      shippingAddress,
      customerId,
    })

    if (
      !customerId &&
      contactInfo.email &&
      contactInfo.phone &&
      shippingAddress.firstName &&
      shippingAddress.lastName
    ) {
      console.log('OrderReview: Attempting to create customer on mount...')
      createCustomer()
    }
  }, [customerId, contactInfo, shippingAddress, createCustomer])
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Enhanced form validation
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!isCardComplete) {
      errors.card = 'Please enter complete card details'
    }
    
    if (!customerId) {
      errors.customer = 'Customer account required'
    }
    
    if (!stripePayment.clientSecret) {
      errors.payment = 'Payment not initialized'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Enhanced error action handler
  const handleErrorAction = async (action: string) => {
    switch (action) {
      case 'retry':
        await handleRetryPayment()
        break
      case 'change_card':
        setPaymentError(null)
        // Focus on card element for user to re-enter details
        const cardElement = elements?.getElement(CardElement)
        if (cardElement) {
          cardElement.focus()
        }
        break
      case 'contact_bank':
        // Open support or provide bank contact info
        window.open('https://support.afrimall.com', '_blank')
        break
      case 'support':
        window.open('https://support.afrimall.com', '_blank')
        break
      case 'refresh':
        window.location.reload()
        break
      case 'check_order':
        // Navigate to order history or provide order lookup
        router.push('/account')
        break
      case 'authenticate':
        // Handle 3D Secure authentication
        setPaymentError(null)
        await handlePlaceOrder()
        break
      default:
        console.log('Unknown error action:', action)
    }
  }

  // Enhanced retry functionality
  const handleRetryPayment = async () => {
    setPaymentError(null)
    setValidationErrors({})
    setIsProcessing(true)
    
    try {
      // Clear previous payment intent
      resetPaymentState()
      
      // Create new payment intent
      const success = await createPaymentIntent(total, 'usd')
      
      if (success) {
        // Retry the payment
        await handlePlaceOrder()
      } else {
        const error = getDetailedErrorMessage({
          code: 'processing_error',
          message: 'Failed to initialize payment. Please try again.'
        })
        setPaymentError(error)
        setIsProcessing(false)
      }
    } catch (error) {
      const detailedError = getDetailedErrorMessage(error)
      setPaymentError(detailedError)
      setIsProcessing(false)
    }
  }

  // Use real cart data
  const cartItems = cart?.items || []
  const subtotal = cart?.subtotal || 0
  const shipping = subtotal * 0.1 // Dynamic shipping: 10% of subtotal
  const tax = subtotal * 0.1 // Example tax calculation
  const total = subtotal + shipping + tax

  const createOrder = async (paymentIntentId: string) => {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required')
      }

      if (!cartItems || cartItems.length === 0) {
        throw new Error('Cart is empty - cannot create order')
      }

      if (!shippingAddress?.firstName || !shippingAddress?.lastName) {
        throw new Error('Shipping address is incomplete')
      }

      console.log('Creating order with data:', {
        itemCount: cartItems.length,
        subtotal,
        total,
        customerId,
        paymentIntentId,
      })

      const response = await fetch('/api/ecommerce/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Order details
          items: cartItems.map((item) => ({
            product: item.product.id,
            variant: item.variant?.id || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            productSnapshot: {
              title: item.product.title,
              sku: item.product.sku || item.product.id, // Use actual SKU if available
              // Image field omitted - upload type doesn't accept URL strings
            },
          })),
          total: total,
          currency: 'USD',

          // Customer information
          customer: customerId,

          // Addresses
          shippingAddress: shippingAddress,
          billingAddress: sameAsBilling ? shippingAddress : billingAddress,

          // Payment information
          paymentMethod: 'credit_card',
          paymentStatus: 'paid',
          paymentReference: paymentIntentId,
          stripePaymentIntentId: paymentIntentId,

          // Shipping information
          shippingMethod: formData.shippingMethod || 'standard',
          specialInstructions: '',

          // Order status
          status: 'confirmed',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const order = await response.json()
      console.log('Order creation response:', order)
      return order
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  }

  const handlePlaceOrder = async () => {
    // Prevent double submission
    if (isProcessing) {
      console.log('Order already being processed, ignoring duplicate request')
      return
    }

    // Enhanced validation with detailed error messages
    if (!validateForm()) {
      return
    }

    // Additional validation checks
    if (!stripe || !elements) {
      const error = getDetailedErrorMessage({
        code: 'processing_error',
        message: 'Payment system not ready. Please try again.'
      })
      setPaymentError(error)
      return
    }

    if (cartItems.length === 0) {
      const error = getDetailedErrorMessage({
        code: 'processing_error',
        message: 'Your cart is empty. Please add items to continue.'
      })
      setPaymentError(error)
      return
    }

    setIsProcessing(true)
    setPaymentError(null)
    setValidationErrors({})

    try {
      // Get the CardElement
      const cardElement = elements.getElement(CardElement)

      if (!cardElement) {
        const error = getDetailedErrorMessage({
          code: 'processing_error',
          message: 'Payment method not found. Please enter your card details above.'
        })
        setPaymentError(error)
        setIsProcessing(false)
        return
      }

      console.log('Confirming payment with Stripe...', {
        clientSecret: stripePayment.clientSecret,
        hasCardElement: !!cardElement,
      })

      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(stripePayment.clientSecret!, {
        payment_method: {
          card: cardElement,
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

      console.log('Stripe response:', { error, paymentIntent })

      if (error) {
        console.error('Stripe payment error:', error)
        
        // Use enhanced error handling
        const detailedError = getDetailedErrorMessage(error)
        setPaymentError(detailedError)
        setIsProcessing(false)
        return
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Create order in our system
        const order = await createOrder(paymentIntent.id)

        setPaymentSuccess(true)
        resetPaymentState()

        // Clear cart after successful order
        const cartCleared = await clearCart()
        if (cartCleared) {
          console.log('Cart cleared successfully after order creation')
        } else {
          console.warn('Failed to clear cart after order creation - order was still successful')
          // Don't block the success flow if cart clearing fails
          // The order was created successfully, so we proceed
        }

        // Extract order ID from response (handle different response structures)
        const orderId = order?.data?.id || order?.id || order?.data?.doc?.id

        console.log('Redirecting to order confirmation with ID:', orderId)

        if (!orderId) {
          console.error('No order ID found in response:', order)
          const error = getDetailedErrorMessage({
            code: 'processing_error',
            message: 'Order created but confirmation page unavailable. Please check your order history.'
          })
          setPaymentError(error)
          setIsProcessing(false)
          return
        }

        // Redirect to order confirmation page
        setTimeout(() => {
          router.push(`/order-confirmation/${orderId}`)
        }, 2000)
      }
    } catch (error: unknown) {
      console.error('Unexpected error in handlePlaceOrder:', error)
      const detailedError = getDetailedErrorMessage({
        code: 'processing_error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
      })
      setPaymentError(detailedError)
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
    <CustomerAuthGate requireAuth={false}>
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
                    src={item.product.images[0]?.url || '/placeholder-image.jpg'}
                    alt={item.product.images[0]?.alt || item.product.title}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="ml-4">
                    <p className="font-medium">{item.product.title}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
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

        {/* Enhanced Payment Error Display */}
        {paymentError && (
          <ErrorDisplay 
            error={paymentError} 
            onAction={handleErrorAction}
            className="mb-6"
          />
        )}

        {/* Validation Errors */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">Please fix the following issues:</h3>
                <ul className="mt-2 text-sm text-orange-700 list-disc list-inside space-y-1">
                  {Object.entries(validationErrors).map(([key, message]) => (
                    <li key={key}>{message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isProcessing && (
          <LoadingState 
            title="Processing Payment"
            message="Please don't close this page while we process your payment..."
            className="mb-6"
          />
        )}

        {/* Success State */}
        {paymentSuccess && (
          <SuccessState 
            title="Payment Successful!"
            message="Redirecting to order confirmation..."
            className="mb-6"
          />
        )}

        {/* Payment Intent Status */}
        {!stripePayment.clientSecret && !isProcessing && (
          <div className="rounded-md bg-yellow-50 p-4 mb-6">
            <div className="text-sm text-yellow-800">
              Please go back and complete the payment method step.
            </div>
          </div>
        )}

        {/* Payment Method - CardElement for Stripe */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment Method</h3>
          <div className="border border-gray-300 dark:border-gray-600 rounded-md p-3 bg-white dark:bg-gray-900">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
                hidePostalCode: true,
              }}
              onChange={(e) => {
                setIsCardComplete(e.complete)
                if (e.error) {
                  const detailedError = getDetailedErrorMessage(e.error)
                  setPaymentError(detailedError)
                } else {
                  setPaymentError(null)
                }
              }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {isCardComplete ? (
              <span className="text-green-600">✓ Card details complete</span>
            ) : (
              'Please enter your card details to complete the payment.'
            )}
          </p>
        </div>

        {/* Customer Status */}
        {!customerId && (
          <div className="rounded-md bg-yellow-50 p-4 mb-6">
            <div className="text-sm text-yellow-800">
              Please complete the contact information step to create your customer account.
            </div>
            <div className="mt-2 text-xs text-yellow-700">
              Debug: Contact info - Email: {contactInfo.email ? '✓' : '✗'}, Phone:{' '}
              {contactInfo.phone ? '✓' : '✗'} | Shipping - First:{' '}
              {shippingAddress.firstName ? '✓' : '✗'}, Last: {shippingAddress.lastName ? '✓' : '✗'}
            </div>
            <div className="mt-3 space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  console.log('Manually triggering customer creation...')
                  await createCustomer()
                }}
                className="text-xs"
              >
                Try Create Customer Again
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('Current form data:', {
                    contactInfo,
                    shippingAddress,
                    billingAddress,
                    customerId,
                  })
                  alert(
                    `Debug Info:\nEmail: ${contactInfo.email || 'Missing'}\nPhone: ${contactInfo.phone || 'Missing'}\nFirst Name: ${shippingAddress.firstName || 'Missing'}\nLast Name: ${shippingAddress.lastName || 'Missing'}`,
                  )
                }}
                className="text-xs"
              >
                Debug Data
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(4)}
            disabled={isProcessing}
            className="transition-colors"
          >
            ← Back to Payment
          </Button>

          <div className="text-sm text-gray-500">Step 5 of 5 • Order Review</div>

          <Button
            onClick={handlePlaceOrder}
            disabled={isProcessing || !stripePayment.clientSecret || !customerId || !isCardComplete}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing Payment...
              </>
            ) : (
              `Place Order - $${total.toFixed(2)}`
            )}
          </Button>
        </div>
      </div>
    </CustomerAuthGate>
  )
}
