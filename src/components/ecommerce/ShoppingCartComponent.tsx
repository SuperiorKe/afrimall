'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/utilities/formatPrice'
import { cn } from '@/utilities/ui'

interface CartItem {
  product: {
    id: string
    title: string
    price: number
    images?: Array<{
      image: {
        filename: string
        alt: string
      }
      alt: string
    }>
  }
  variant?: {
    id: string
    title: string
    price: number
  }
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Cart {
  id: string
  items: CartItem[]
  subtotal: number
  itemCount: number
  currency: string
}

export function ShoppingCartComponent() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      setLoading(true)

      // Get session ID for guest users
      let sessionId = localStorage.getItem('afrimall_session_id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('afrimall_session_id', sessionId)
      }

      // TODO: Check if user is logged in and use customer ID instead
      const customerId = null

      const response = await fetch(
        `/api/cart?${customerId ? `customerId=${customerId}` : `sessionId=${sessionId}`}`,
      )
      const data = await response.json()

      if (data.success) {
        setCart(data.data)
      }
    } catch (error) {
      console.error('Error loading cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (
    productId: string,
    variantId: string | undefined,
    newQuantity: number,
  ) => {
    if (!cart || newQuantity < 0) return

    const updateKey = `${productId}-${variantId || 'no-variant'}`
    setUpdating(updateKey)

    try {
      // Update local state immediately for better UX
      const updatedItems = cart.items
        .map((item) => {
          if (item.product.id === productId && item.variant?.id === variantId) {
            const updatedItem = {
              ...item,
              quantity: newQuantity,
              totalPrice: newQuantity * item.unitPrice,
            }
            return updatedItem
          }
          return item
        })
        .filter((item) => item.quantity > 0) // Remove items with 0 quantity

      const updatedCart = {
        ...cart,
        items: updatedItems,
        subtotal: updatedItems.reduce((sum, item) => sum + item.totalPrice, 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      }

      setCart(updatedCart)

      // Update cart on server
      const sessionId = localStorage.getItem('afrimall_session_id')
      const customerId = null // TODO: Get from auth context

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          sessionId: !customerId ? sessionId : undefined,
          items: updatedItems,
          currency: cart.currency,
        }),
      })

      if (!response.ok) {
        // Revert local state if server update failed
        loadCart()
      }
    } catch (error) {
      console.error('Error updating cart:', error)
      // Revert local state
      loadCart()
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = (productId: string, variantId?: string) => {
    updateQuantity(productId, variantId, 0)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Start shopping to add items to your cart.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cart Items ({cart.itemCount})
            </h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {cart.items.map((item) => {
              const updateKey = `${item.product.id}-${item.variant?.id || 'no-variant'}`
              const isUpdating = updating === updateKey
              const imageUrl = item.product.images?.[0]?.image?.filename
                ? `/api/media/file/${item.product.images[0].image.filename}`
                : '/placeholder-product.jpg'

              return (
                <div key={updateKey} className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <Link href={`/products/${item.product.id}`}>
                        <Image
                          src={imageUrl}
                          alt={item.product.images?.[0]?.alt || item.product.title}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </Link>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product.id}`}
                        className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {item.product.title}
                      </Link>

                      {item.variant && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Variant: {item.variant.title}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatPrice(item.unitPrice, cart.currency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.variant?.id, item.quantity - 1)
                          }
                          disabled={isUpdating || item.quantity <= 1}
                          className="px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-sm font-medium text-gray-900 dark:text-white min-w-[2rem] text-center">
                          {isUpdating ? '...' : item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.variant?.id, item.quantity + 1)
                          }
                          disabled={isUpdating}
                          className="px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.product.id, item.variant?.id)}
                        disabled={isUpdating}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove item"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
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

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatPrice(item.totalPrice, cart.currency)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Order Summary
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Subtotal ({cart.itemCount} items)
              </span>
              <span className="text-gray-900 dark:text-white font-medium">
                {formatPrice(cart.subtotal, cart.currency)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Shipping</span>
              <span className="text-gray-900 dark:text-white font-medium">
                Calculated at checkout
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Tax</span>
              <span className="text-gray-900 dark:text-white font-medium">
                Calculated at checkout
              </span>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="flex justify-between">
                <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(cart.subtotal, cart.currency)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              href="/checkout"
              className="w-full bg-blue-600 text-white px-6 py-3 text-center font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors block"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/products"
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 text-center font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors block"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
