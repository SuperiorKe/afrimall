'use client'

import React, { useState } from 'react'
import { cn } from '@/utilities/ui'

interface AddToCartButtonProps {
  productId: string
  productTitle: string
  price: number
  variantId?: string
  quantity?: number
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function AddToCartButton({
  productId,
  productTitle,
  price,
  variantId,
  quantity = 1,
  disabled = false,
  className,
  size = 'md',
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  const handleAddToCart = async () => {
    if (disabled || isLoading) return

    setIsLoading(true)

    try {
      // Get or create session ID for guest users
      let sessionId = localStorage.getItem('afrimall_session_id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('afrimall_session_id', sessionId)
      }

      // TODO: Check if user is logged in and use customer ID instead
      const customerId = null // This would come from auth context

      // Get current cart
      const cartResponse = await fetch(
        `/api/cart?${customerId ? `customerId=${customerId}` : `sessionId=${sessionId}`}`,
      )
      const cartData = await cartResponse.json()

      let currentItems = cartData.data?.items || []

      // Check if item already exists in cart
      const existingItemIndex = currentItems.findIndex(
        (item: any) => item.product === productId && item.variant === variantId,
      )

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        currentItems[existingItemIndex].quantity += quantity
        currentItems[existingItemIndex].totalPrice =
          currentItems[existingItemIndex].quantity * currentItems[existingItemIndex].unitPrice
      } else {
        // Add new item to cart
        const newItem = {
          product: productId,
          variant: variantId,
          quantity,
          unitPrice: price,
          totalPrice: price * quantity,
          addedAt: new Date().toISOString(),
        }
        currentItems.push(newItem)
      }

      // Update cart
      const updateResponse = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          sessionId: !customerId ? sessionId : undefined,
          items: currentItems,
        }),
      })

      if (updateResponse.ok) {
        setIsAdded(true)
        // TODO: Trigger cart update in global state/context

        // Reset the "added" state after 2 seconds
        setTimeout(() => setIsAdded(false), 2000)
      } else {
        throw new Error('Failed to add to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      // TODO: Show error toast/notification
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        sizeClasses[size],
        isAdded
          ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
          : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
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
          Adding...
        </>
      ) : isAdded ? (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Added to Cart
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8"
            />
          </svg>
          Add to Cart
        </>
      )}
    </button>
  )
}
