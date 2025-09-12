import React from 'react'
import { ShoppingCartComponent } from '@/components/ecommerce/ShoppingCartComponent'
import type { Metadata } from 'next'
import { Logo } from '@/components/Logo/Logo'

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo className="h-16 w-16" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Shopping Cart</h1>
        </div>

        <ShoppingCartComponent asModal={false} />
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Shopping Cart - Afrimall',
  description: 'Review and manage items in your shopping cart.',
}
