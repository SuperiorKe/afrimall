'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ShoppingBag, Trash2, Minus, Plus } from 'lucide-react'
import { formatPrice } from '@/utilities/formatPrice'
import { cn } from '@/utilities/ui'
import { useCart } from '@/contexts/CartContext'

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
      slug: string
    }>
  }
  variant?: {
    id: string
    title: string
    price: number
  } | null
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

interface ShoppingCartComponentProps {
  isOpen?: boolean
  onClose?: () => void
  asModal?: boolean
}

export function ShoppingCartComponent({
  isOpen = true,
  onClose,
  asModal = false,
}: ShoppingCartComponentProps = {}) {
  const { cart, loading, error, updateQuantity, removeFromCart, clearCart } = useCart()
  const [updating, setUpdating] = useState<string | null>(null)

  const handleUpdateQuantity = async (
    productId: string,
    variantId: string | undefined,
    newQuantity: number,
  ) => {
    if (!cart || newQuantity < 0) return

    const updateKey = `${productId}-${variantId || 'no-variant'}`
    setUpdating(updateKey)

    try {
      await updateQuantity(productId, variantId, newQuantity)
    } catch (error) {
      console.error('Error updating quantity:', error)
    } finally {
      setUpdating(null)
    }
  }

  const handleRemoveItem = async (productId: string, variantId: string | undefined) => {
    const updateKey = `${productId}-${variantId || 'no-variant'}`
    setUpdating(updateKey)

    try {
      await removeFromCart(productId, variantId)
    } catch (error) {
      console.error('Error removing item:', error)
    } finally {
      setUpdating(null)
    }
  }

  const handleClearCart = async () => {
    if (!cart) return

    try {
      await clearCart()
    } catch (error) {
      console.error('Error clearing cart:', error)
    }
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  if (loading) {
    if (asModal) {
      return (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b px-4 py-6">
                <h2 className="text-lg font-semibold">Shopping Cart</h2>
                <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading cart...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading cart...</p>
            </div>
          </div>
        </div>
      )
    }
  }

  if (error) {
    if (asModal) {
      return (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b px-4 py-6">
                <h2 className="text-lg font-semibold">Shopping Cart</h2>
                <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )
    }
  }

  if (asModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />
        <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-6">
              <h2 className="text-lg font-semibold">Shopping Cart</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto">
              {!cart || cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-4">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 text-center mb-6">
                    Add some items to your cart to get started.
                  </p>
                  <Link
                    href="/products"
                    className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    onClick={handleClose}
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <div className="px-4 py-6">
                  {/* Cart Items */}
                  <div className="space-y-4">
                    {cart.items.map((item) => (
                      <div
                        key={`${item.product.id}-${item.variant?.id || 'no-variant'}`}
                        className="flex items-center space-x-4"
                      >
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <div className="h-16 w-16 bg-gray-200 rounded-lg overflow-hidden">
                            {item.product.images &&
                            item.product.images.length > 0 &&
                            item.product.images[0].url ? (
                              <Image
                                src={item.product.images[0].url}
                                alt={item.product.images[0].alt || item.product.title}
                                width={64}
                                height={64}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400">
                                <ShoppingBag className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {item.product.title}
                          </h3>
                          {item.variant && (
                            <p className="text-xs text-gray-500 truncate">{item.variant.title}</p>
                          )}
                          <p className="text-sm font-medium text-gray-900">
                            {formatPrice(item.unitPrice)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <QuantityControls
                            quantity={item.quantity}
                            onQuantityChange={(newQuantity) =>
                              handleUpdateQuantity(item.product.id, item.variant?.id, newQuantity)
                            }
                            disabled={
                              updating === `${item.product.id}-${item.variant?.id || 'no-variant'}`
                            }
                          />
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.product.id, item.variant?.id)}
                          disabled={
                            updating === `${item.product.id}-${item.variant?.id || 'no-variant'}`
                          }
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Clear Cart Button */}
                  {cart.items.length > 0 && (
                    <div className="mt-6 pt-4 border-t">
                      <button
                        onClick={handleClearCart}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Clear Cart
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart && cart.items.length > 0 && (
              <div className="border-t bg-gray-50 px-4 py-6">
                <div className="flex items-center justify-between text-lg font-semibold mb-4">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors text-center block"
                    onClick={handleClose}
                  >
                    Proceed to Checkout
                  </Link>
                  <Link
                    href="/products"
                    className="w-full bg-white text-gray-900 py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-center block"
                    onClick={handleClose}
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Page mode - for dedicated cart page
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-6">
          <h2 className="text-2xl font-semibold">Shopping Cart</h2>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto">
          {!cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 py-16">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 text-center mb-6">
                Add some items to your cart to get started.
              </p>
              <Link
                href="/products"
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="px-6 py-6">
              {/* Cart Items */}
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.variant?.id || 'no-variant'}`}
                    className="flex items-center space-x-4"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="h-16 w-16 bg-gray-200 rounded-lg overflow-hidden">
                        {item.product.images &&
                        item.product.images.length > 0 &&
                        item.product.images[0].url ? (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.images[0].alt || item.product.title}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            <ShoppingBag className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.product.title}
                      </h3>
                      {item.variant && (
                        <p className="text-xs text-gray-500 truncate">{item.variant.title}</p>
                      )}
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(item.unitPrice)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <QuantityControls
                        quantity={item.quantity}
                        onQuantityChange={(newQuantity) =>
                          handleUpdateQuantity(item.product.id, item.variant?.id, newQuantity)
                        }
                        disabled={
                          updating === `${item.product.id}-${item.variant?.id || 'no-variant'}`
                        }
                      />
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.product.id, item.variant?.id)}
                      disabled={
                        updating === `${item.product.id}-${item.variant?.id || 'no-variant'}`
                      }
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Clear Cart Button */}
              {cart.items.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Clear Cart
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="border-t bg-gray-50 px-6 py-6">
            <div className="flex items-center justify-between text-lg font-semibold mb-4">
              <span>Subtotal</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <div className="space-y-3">
              <Link
                href="/checkout"
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors text-center block"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/products"
                className="w-full bg-white text-gray-900 py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-center block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Quantity Controls Component
function QuantityControls({
  quantity,
  onQuantityChange,
  disabled = false,
}: {
  quantity: number
  onQuantityChange: (quantity: number) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center border border-gray-300 rounded-lg">
      <button
        onClick={() => onQuantityChange(quantity - 1)}
        disabled={disabled || quantity <= 1}
        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">{quantity}</span>
      <button
        onClick={() => onQuantityChange(quantity + 1)}
        disabled={disabled}
        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
