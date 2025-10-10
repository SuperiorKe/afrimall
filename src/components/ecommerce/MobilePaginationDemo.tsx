'use client'

import React, { useState, useEffect } from 'react'
import { MobileProductPagination } from './MobileProductPagination'
import { ProductSkeleton } from './ProductSkeleton'

// Demo component to showcase mobile pagination features
export function MobilePaginationDemo() {
  const [pagination, setPagination] = useState({
    totalDocs: 156,
    totalPages: 13,
    page: 1,
    limit: 12,
    hasNextPage: true,
    hasPrevPage: false,
    nextPage: 2 as number | undefined,
    prevPage: undefined as number | undefined,
  })
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handlePageChange = (page: number) => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setPagination((prev) => ({
        totalDocs: prev.totalDocs,
        totalPages: prev.totalPages,
        page,
        limit: prev.limit,
        hasNextPage: page < prev.totalPages,
        hasPrevPage: page > 1,
        nextPage: page < prev.totalPages ? page + 1 : undefined,
        prevPage: page > 1 ? page - 1 : undefined,
      }))
      setLoading(false)
    }, 1000)
  }

  const handleLoadMore = () => {
    setLoading(true)

    // Simulate loading more products
    setTimeout(() => {
      setPagination((prev) => ({
        totalDocs: prev.totalDocs,
        totalPages: prev.totalPages,
        page: prev.page + 1,
        limit: prev.limit,
        hasNextPage: prev.page + 1 < prev.totalPages,
        hasPrevPage: prev.page + 1 > 1,
        nextPage: prev.page + 2 < prev.totalPages ? prev.page + 2 : undefined,
        prevPage: prev.page > 0 ? prev.page : undefined,
      }))
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Mobile-Friendly Pagination Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Experience the new mobile-optimized pagination system with touch-friendly controls,
          infinite scroll, and smart page navigation.
        </p>

        {/* Device indicator */}
        <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-full text-sm font-medium text-blue-800 dark:text-blue-200">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          {isMobile ? 'Mobile View' : 'Desktop View'}
        </div>
      </div>

      {/* Demo Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Current Pagination State
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{pagination.page}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Current Page</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{pagination.totalPages}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Pages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{pagination.limit}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Items per Page</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{pagination.totalDocs}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Items</div>
          </div>
        </div>

        {/* Quick navigation buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => handlePageChange(1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            First Page
          </button>
          <button
            onClick={() => handlePageChange(Math.ceil(pagination.totalPages / 2))}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Middle Page
          </button>
          <button
            onClick={() => handlePageChange(pagination.totalPages)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Last Page
          </button>
        </div>
      </div>

      {/* Mobile Pagination Component */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Mobile Pagination Component
        </h2>

        <MobileProductPagination
          pagination={pagination}
          onPageChange={handlePageChange}
          loading={loading}
          enableInfiniteScroll={true}
          onLoadMore={handleLoadMore}
          hasMoreProducts={pagination.hasNextPage}
          className="border-t border-gray-200 dark:border-gray-700 pt-6"
        />
      </div>

      {/* Features Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Touch-Friendly Features */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🎯 Touch-Friendly Features
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Large touch targets (44px+)
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Swipe-friendly navigation
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Visual feedback on touch
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Accessible keyboard navigation
            </li>
          </ul>
        </div>

        {/* Smart Pagination */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🧠 Smart Pagination
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Adaptive page number display
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Page size selector (12, 24, 48)
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Jump to page functionality
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              URL state management
            </li>
          </ul>
        </div>

        {/* Infinite Scroll */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ♾️ Infinite Scroll
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
              Seamless product loading
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
              Intersection Observer API
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
              Background preloading
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
              Toggle between modes
            </li>
          </ul>
        </div>

        {/* Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ⚡ Performance
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
              Mobile-optimized API limits
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
              Skeleton loading states
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
              Optimistic UI updates
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
              Error recovery handling
            </li>
          </ul>
        </div>
      </div>

      {/* Skeleton Demo */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Loading States Demo
        </h3>
        <ProductSkeleton count={4} />
      </div>
    </div>
  )
}
