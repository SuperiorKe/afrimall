'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/utilities/ui'

interface CartIconProps {
  className?: string
}

export function CartIcon({ className }: CartIconProps) {
  const [itemCount, setItemCount] = useState(0)

  useEffect(() => {
    loadCartCount()

    // Listen for cart updates (you can implement this with a global state manager later)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'afrimall_cart_updated') {
        loadCartCount()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const loadCartCount = async () => {
    try {
      // Get session ID for guest users
      const sessionId = localStorage.getItem('afrimall_session_id')
      if (!sessionId) return

      // TODO: Check if user is logged in and use customer ID instead
      const customerId = null

      const response = await fetch(
        `/api/cart?${customerId ? `customerId=${customerId}` : `sessionId=${sessionId}`}`,
      )
      const data = await response.json()

      if (data.success && data.data) {
        setItemCount(data.data.itemCount || 0)
      }
    } catch (error) {
      console.error('Error loading cart count:', error)
    }
  }

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
    </Link>
  )
}
