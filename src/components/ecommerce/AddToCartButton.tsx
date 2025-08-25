'use client'

import React, { useState } from 'react'
import { cn } from '@/utilities/ui'

interface Product {
  id: string
  title: string
  price: number
  images?: {
    id: string
    url: string | null
    alt: string
  }[]
}

interface AddToCartButtonProps {
  product: Product
  variantId?: string
  quantity?: number
  disabled?: boolean
  className?: string
}

export function AddToCartButton({
  product,
  variantId,
  quantity = 1,
  disabled = false,
  className,
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddToCart = async () => {
    if (disabled || isLoading) return

    try {
      setIsLoading(true)
      setError(null)

      // Get session ID for guest users
      let sessionId = localStorage.getItem('afrimall_session_id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('afrimall_session_id', sessionId)
      }

      // TODO: Check if user is logged in and use customer ID instead
      const customerId = null

      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          sessionId,
          productId: product.id,
          variantId,
          quantity,
          currency: 'USD',
        }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        // Trigger cart update event for other components
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: data.data }))

        // Reset success state after 2 seconds
        setTimeout(() => setIsSuccess(false), 2000)
      } else {
        setError(data.message || 'Failed to add item to cart')
      }
    } catch (err) {
      setError('Failed to add item to cart. Please try again.')
      console.error('Error adding to cart:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonText = () => {
    if (isSuccess) return 'Added to Cart! ✓'
    if (isLoading) return 'Adding...'
    if (disabled) return 'Out of Stock'
    return 'Add to Cart'
  }

  const getButtonStyles = () => {
    if (isSuccess) {
      return 'bg-green-600 hover:bg-green-700 text-white'
    }
    if (disabled) {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed'
    }
    if (isLoading) {
      return 'bg-blue-600 text-white cursor-wait'
    }
    return 'bg-blue-600 hover:bg-blue-700 text-white'
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleAddToCart}
        disabled={disabled || isLoading}
        className={cn(
          'w-full px-4 py-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
          getButtonStyles(),
          className,
        )}
      >
        {getButtonText()}
      </button>

      {/* Error Message */}
      {error && <p className="text-xs text-red-600 dark:text-red-400 text-center">{error}</p>}

      {/* Success Message */}
      {isSuccess && (
        <p className="text-xs text-green-600 dark:text-green-400 text-center">
          Item added successfully!
        </p>
      )}
    </div>
  )
}
