import { CheckoutProvider } from './_components/CheckoutContext'
import { CartProvider } from '@/contexts/CartContext'
import { CheckoutForm } from './_components/CheckoutForm'
import { OrderSummary } from './_components/OrderSummary'
import { Logo } from '@/components/Logo/Logo'

export default function CheckoutPage() {
  return (
    <CartProvider>
      <CheckoutProvider>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo className="h-16 w-16" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Checkout</h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CheckoutForm />
            </div>
            <div className="lg:col-span-1">
              <OrderSummary />
            </div>
          </div>
        </div>
      </CheckoutProvider>
    </CartProvider>
  )
}
