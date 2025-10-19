'use client'

import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { useCheckout } from './CheckoutContext'
import { useCart } from '@/contexts/CartContext'
import { ContactInfoForm } from './steps/ContactInfoForm'
import { ShippingInfoForm } from './steps/ShippingInfoForm'
import { BillingInfoForm } from './steps/BillingInfoForm'
import { PaymentMethodForm } from './steps/PaymentMethodForm'
import { OrderReview } from './steps/OrderReview'
import { Button } from '@/components/ui/button'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

export function CheckoutForm() {
  const { currentStep, setCurrentStep, stripePayment, createPaymentIntent } = useCheckout()
  const { cart, loading: cartLoading } = useCart()

  const steps = [
    { id: 1, name: 'Contact', component: <ContactInfoForm /> },
    { id: 2, name: 'Shipping', component: <ShippingInfoForm /> },
    { id: 3, name: 'Billing', component: <BillingInfoForm /> },
    { id: 4, name: 'Payment', component: <PaymentMethodForm /> },
    { id: 5, name: 'Review', component: <OrderReview /> },
  ]

  const handleNext = async () => {
    if (currentStep < steps.length) {
      // For now, let's move to next step without complex form validation
      // The forms should auto-save their data as users type

      // If moving to payment step (step 4), create payment intent
      if (currentStep === 3 && cart?.subtotal) {
        // Calculate total with dynamic shipping (10% of subtotal) and tax
        const shipping = cart.subtotal * 0.1
        const tax = cart.subtotal * 0.1
        const total = cart.subtotal + shipping + tax
        // Pass the amount in dollars - the API will convert to cents
        await createPaymentIntent(Math.round(total * 100) / 100, 'usd')
      }
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Afrimall Checkout Header */}
      <div className="bg-gradient-to-r from-afrimall-orange to-afrimall-red p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Secure Checkout</h1>
            <p className="text-afrimall-gold/90 mt-1">Complete your African marketplace purchase</p>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-2 text-white/80">
              <span className="text-afrimall-gold">🔒</span>
              <span className="text-sm font-medium">SSL Secured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <nav className="flex items-center justify-center">
          <ol className="flex items-center w-full max-w-2xl">
            {steps.map((step, index) => (
              <li
                key={step.id}
                className={`flex items-center ${index !== steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      currentStep === step.id
                        ? 'bg-gradient-to-r from-afrimall-orange to-afrimall-red text-white shadow-lg scale-110'
                        : currentStep > step.id
                          ? 'bg-gradient-to-r from-afrimall-green to-green-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  <span
                    className={`text-sm mt-2 transition-colors ${
                      currentStep >= step.id
                        ? 'text-afrimall-orange dark:text-afrimall-gold font-semibold'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index !== steps.length - 1 && (
                  <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-600 mx-4 rounded-full">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        currentStep > step.id
                          ? 'bg-gradient-to-r from-afrimall-green to-green-500'
                          : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div data-step={currentStep}>
            {currentStep >= 4 && stripePayment.clientSecret ? (
              <Elements
                options={{
                  clientSecret: stripePayment.clientSecret,
                  appearance: { theme: 'stripe' as const },
                }}
                stripe={stripePromise}
              >
                {steps.find((step) => step.id === currentStep)?.component}
              </Elements>
            ) : currentStep >= 4 && !stripePayment.clientSecret ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-afrimall-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Preparing secure payment...</p>
                </div>
              </div>
            ) : (
              steps.find((step) => step.id === currentStep)?.component
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              onClick={handleBack}
              className="border-afrimall-orange text-afrimall-orange hover:bg-afrimall-orange hover:text-white"
            >
              ← Back
            </Button>
          ) : (
            <div />
          )}
          {currentStep < steps.length && (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-afrimall-orange to-afrimall-red hover:from-afrimall-red hover:to-afrimall-orange text-white font-semibold"
            >
              Continue to {steps.find((step) => step.id === currentStep + 1)?.name} →
            </Button>
          )}
        </div>
      </div>

      {/* African Pattern Footer */}
      <div className="bg-gradient-to-r from-afrimall-brown/10 to-afrimall-orange/10 p-4">
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <span className="text-afrimall-gold">🌍</span>
            <span>Supporting African Artisans</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <span className="text-afrimall-green">✓</span>
            <span>Secure Payment</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <span className="text-afrimall-orange">🚚</span>
            <span>Free Shipping Over $50</span>
          </div>
        </div>
      </div>
    </div>
  )
}
