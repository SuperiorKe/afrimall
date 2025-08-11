import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/Logo/Logo'

export const metadata: Metadata = {
  title: 'Afrimall - African Marketplace',
  description: 'Discover authentic African products, crafts, and goods from across the continent.',
}

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section with Logo */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-8">
          <Logo className="h-24 w-24" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Welcome to <span className="text-green-600">Afri</span>
          <span className="text-orange-500">mall</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
          Discover authentic African products, crafts, and goods from across the continent. Support
          talented African entrepreneurs and bring the beauty of Africa into your home.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
          >
            Shop Now
          </Link>
          <Link
            href="/categories"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
          >
            Browse Categories
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Authentic Products
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Handcrafted items from skilled African artisans
          </p>
        </div>

        <div className="text-center p-6">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Direct from Africa
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Supporting local communities and fair trade
          </p>
        </div>

        <div className="text-center p-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Fast Shipping
          </h3>
          <p className="text-gray-600 dark:text-gray-300">Reliable delivery to your doorstep</p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-green-50 to-orange-50 dark:from-green-900/20 dark:to-orange-900/20 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to Explore Africa?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Start your journey through African craftsmanship today
        </p>
        <Link
          href="/products"
          className="inline-block bg-gradient-to-r from-green-600 to-orange-500 hover:from-green-700 hover:to-orange-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
        >
          Start Shopping
        </Link>
      </div>
    </div>
  )
}
