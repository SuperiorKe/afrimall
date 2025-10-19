'use client'

import React, { useState } from 'react'
import { cn } from '@/utils/helpers/ui'
import { useCart } from '@/contexts/CartContext'

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
  const [isSuccess, setIsSuccess] = useState(false)
  const { addToCart, loading } = useCart()

  const handleAddToCart = async () => {
    if (disabled || loading) return

    try {
      const success = await addToCart(product.id, variantId, quantity)

      if (success) {
        setIsSuccess(true)
        // Reset success state after 2 seconds
        setTimeout(() => setIsSuccess(false), 2000)
      }
    } catch (error) {
      console.error('AddToCartButton: Error in handleAddToCart', error)
    }
  }

  const getButtonText = () => {
    if (isSuccess) return 'Added to Cart! ✓'
    if (loading) return 'Adding...'
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
    if (loading) {
      return 'bg-blue-600 text-white cursor-wait'
    }
    return 'bg-blue-600 hover:bg-blue-700 text-white'
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleAddToCart}
        disabled={disabled || loading}
        className={cn(
          'w-full px-4 py-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
          getButtonStyles(),
          className,
        )}
      >
        {getButtonText()}
      </button>

      {/* Success Message */}
      {isSuccess && (
        <p className="text-xs text-green-600 dark:text-green-400 text-center">
          Item added successfully!
        </p>
      )}
    </div>
  )
}
