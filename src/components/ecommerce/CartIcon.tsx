'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/utils/helpers/ui'
import { useCart } from '@/contexts/CartContext'

interface CartIconProps {
  className?: string
}

export function CartIcon({ className }: CartIconProps) {
  const { cart, isOnline, error } = useCart()
  const [itemCount, setItemCount] = useState(0)

  useEffect(() => {
    // Update count when cart changes
    if (cart) {
      setItemCount(cart.itemCount || 0)
    } else {
      setItemCount(0)
    }
  }, [cart])

  useEffect(() => {
    // Listen for cart update events from other components
    const handleCartUpdate = (event: CustomEvent) => {
      const updatedCart = event.detail
      if (updatedCart) {
        setItemCount(updatedCart.itemCount || 0)
      } else {
        setItemCount(0)
      }
    }

    window.addEventListener('cartUpdated', handleCartUpdate as EventListener)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate as EventListener)
  }, [])

  return (
    <Link
      href="/cart"
      className={cn(
        'relative inline-flex items-center p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors',
        className,
      )}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8"
        />
      </svg>

      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[1.25rem] h-5">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}

      {/* Connection status indicator */}
      {!isOnline && (
        <span
          className="absolute -bottom-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full border border-white"
          title="Offline - changes will sync when reconnected"
        />
      )}
      {error && (
        <span
          className="absolute -bottom-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"
          title="Sync error - click to retry"
        />
      )}
    </Link>
  )
}
