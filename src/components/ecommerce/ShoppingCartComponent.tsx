'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/utilities/formatPrice'
import { cn } from '@/utilities/ui'

interface CartItem {
  id: string
  product: {
    id: string
    title: string
    price: number
    images?: Array<{
      url: string | null
      alt: string
    }>
    categories?: Array<{
      id: string
      title: string
      slug?: string | null
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
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadCart()

    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      loadCart()
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
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
      } else {
        setCart(null)
      }
    } catch (error) {
      console.error('Error loading cart:', error)
      setCart(null)
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
      // Get session ID
      let sessionId = localStorage.getItem('afrimall_session_id')
      if (!sessionId) return

      const customerId = null

      const response = await fetch('/api/cart/items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          sessionId,
          productId,
          variantId,
          quantity: newQuantity,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCart(data.data)
        // Trigger cart update event
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: data.data }))
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
    } finally {
      setUpdating(updateKey)
    }
  }

  const removeItem = async (productId: string, variantId: string | undefined) => {
    if (!cart) return

    try {
      // Get session ID
      let sessionId = localStorage.getItem('afrimall_session_id')
      if (!sessionId) return

      const customerId = null

      const response = await fetch(
        `/api/cart/items?${customerId ? `customerId=${customerId}` : `sessionId=${sessionId}`}&productId=${productId}${variantId ? `&variantId=${variantId}` : ''}`,
        {
          method: 'DELETE',
        },
      )

      const data = await response.json()

      if (data.success) {
        setCart(data.data)
        // Trigger cart update event
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: data.data }))
      } else {
        console.error('Failed to remove item:', data.message || 'Unknown error')
        // Optionally show user-friendly error message
      }
    } catch (error) {
      console.error('Error removing item:', error)
      // Optionally show user-friendly error message
    }
  }

  const clearCart = async () => {
    if (!cart) return

    try {
      // Get session ID
      let sessionId = localStorage.getItem('afrimall_session_id')
      if (!sessionId) return

      const customerId = null

      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          sessionId,
          action: 'clear',
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCart(null)
        // Trigger cart update event
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: null }))
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-gray-600 hover:text-afrimall-orange dark:text-gray-300 dark:hover:text-afrimall-orange transition-colors duration-200"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8"
            />
          </svg>
          <div className="absolute -top-1 -right-1 bg-afrimall-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Cart Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-afrimall-orange dark:text-gray-300 dark:hover:text-afrimall-orange transition-colors duration-200"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8"
          />
        </svg>

        {/* Cart Badge */}
        {cart && cart.itemCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-afrimall-orange text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
            {cart.itemCount > 99 ? '99+' : cart.itemCount}
          </div>
        )}
      </button>

      {/* Cart Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-afrimall-orange to-afrimall-red px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8"
                  />
                </svg>
                Shopping Cart
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors duration-200"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6">
            {!cart || cart.items.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="h-8 w-8 text-gray-400"
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Start shopping to discover authentic African products.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center px-6 py-3 bg-afrimall-orange hover:bg-afrimall-red text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {cart.items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.variant?.id || 'no-variant'}`}
                      className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700"
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {item.product.images?.[0]?.url ? (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.images[0].alt || item.product.title}
                            width={56}
                            height={56}
                            className="rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gradient-to-br from-afrimall-orange/20 to-afrimall-red/20 rounded-lg flex items-center justify-center border border-afrimall-orange/30">
                            <svg
                              className="h-7 w-7 text-afrimall-orange"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                          {item.product.title}
                        </h4>
                        {item.variant && (
                          <p className="text-xs text-afrimall-orange font-medium mb-2 bg-afrimall-orange/10 px-2 py-1 rounded-full inline-block">
                            {item.variant.title}
                          </p>
                        )}
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                          {formatPrice(item.unitPrice)} × {item.quantity}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.variant?.id, item.quantity - 1)
                              }
                              disabled={
                                updating ===
                                  `${item.product.id}-${item.variant?.id || 'no-variant'}` ||
                                item.quantity <= 1
                              }
                              className="px-3 py-1.5 text-gray-600 hover:text-afrimall-orange dark:text-gray-400 dark:hover:text-afrimall-orange disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 12H4"
                                />
                              </svg>
                            </button>
                            <span className="px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white min-w-[2rem] text-center bg-gray-50 dark:bg-gray-600">
                              {updating === `${item.product.id}-${item.variant?.id || 'no-variant'}`
                                ? '...'
                                : item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.variant?.id, item.quantity + 1)
                              }
                              disabled={
                                updating ===
                                `${item.product.id}-${item.variant?.id || 'no-variant'}`
                              }
                              className="px-3 py-1.5 text-gray-600 hover:text-afrimall-orange dark:text-gray-400 dark:hover:text-afrimall-orange disabled:opacity-50 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item.product.id, item.variant?.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                            title="Remove item"
                          >
                            <svg
                              className="h-4 w-4"
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
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">Subtotal</h4>
                    <span className="text-xl font-bold text-afrimall-orange">
                      {formatPrice(cart.subtotal)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-lg">
                    <svg
                      className="h-4 w-4 inline mr-2 text-afrimall-green"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Shipping and taxes calculated at checkout
                  </p>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Link
                      href="/checkout"
                      className="w-full bg-gradient-to-r from-afrimall-orange to-afrimall-red hover:from-afrimall-red hover:to-afrimall-orange text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] text-center block"
                    >
                      Proceed to Checkout
                    </Link>

                    <button
                      onClick={clearCart}
                      className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors duration-200 border border-gray-200 dark:border-gray-600"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
