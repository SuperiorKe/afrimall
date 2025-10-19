'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'

export function OrderSummary() {
  const { cart, updateQuantity, removeFromCart } = useCart()
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)

  const cartItems = cart?.items || []
  const subtotal = cart?.subtotal || 0
  const shipping = subtotal * 0.1 // 10% of subtotal for dynamic shipping
  const tax = subtotal * 0.1 // Example tax calculation
  const total = subtotal + shipping + tax - discount

  const handleUpdateQuantity = async (
    productId: string,
    variantId: string | undefined,
    newQuantity: number,
  ) => {
    if (newQuantity < 1) return
    await updateQuantity(productId, variantId, newQuantity)
  }

  const handleRemoveItem = async (productId: string, variantId?: string) => {
    await removeFromCart(productId, variantId)
  }

  const applyPromoCode = () => {
    // In a real app, you would validate the promo code with your backend
    if (promoCode === 'DISCOUNT10') {
      setDiscount(subtotal * 0.1) // 10% off
    } else if (promoCode) {
      alert('Invalid promo code')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>

      <div className="space-y-4 mb-6">
        {cartItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Your cart is empty</p>
            <p className="text-sm">Add some products to continue</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center">
                <Image
                  src={item.product.images[0]?.url || '/placeholder-product.jpg'}
                  alt={item.product.title}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="ml-4">
                  <p className="font-medium text-gray-900 dark:text-white">{item.product.title}</p>
                  {item.variant && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.variant.title}</p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ${item.unitPrice.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() =>
                    handleUpdateQuantity(item.product.id, item.variant?.id, item.quantity - 1)
                  }
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-l-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                >
                  -
                </button>
                <span className="w-10 text-center text-gray-900 dark:text-white">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    handleUpdateQuantity(item.product.id, item.variant?.id, item.quantity + 1)
                  }
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-r-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                >
                  +
                </button>
                <button
                  onClick={() => handleRemoveItem(item.product.id, item.variant?.id)}
                  className="ml-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  aria-label="Remove item"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mb-4">
        <div className="flex">
          <Input
            type="text"
            placeholder="Promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="flex-1 rounded-r-none"
          />
          <Button onClick={applyPromoCode} variant="outline" className="rounded-l-none border-l-0">
            Apply
          </Button>
        </div>
      </div>

      <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex justify-between text-gray-900 dark:text-white">
          <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>Discount</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-900 dark:text-white">
          <span className="text-gray-600 dark:text-gray-400">Shipping</span>
          <span>${shipping.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-gray-900 dark:text-white">
          <span className="text-gray-600 dark:text-gray-400">Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>

        <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 mt-2 font-medium text-gray-900 dark:text-white">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">We accept:</p>
        <div className="flex space-x-2">
          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1 rounded">
            Visa
          </span>
          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1 rounded">
            Mastercard
          </span>
          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1 rounded">
            PayPal
          </span>
        </div>
      </div>
    </div>
  )
}
