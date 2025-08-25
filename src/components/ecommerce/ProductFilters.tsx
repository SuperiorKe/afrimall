'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { cn } from '@/utilities/ui'

interface ProductFiltersProps {
  searchQuery?: string
  selectedCategory?: string
  currentSort?: string
  currentOrder?: string
  currentMinPrice?: string
  currentMaxPrice?: string
}

export function ProductFilters({
  searchQuery,
  selectedCategory,
  currentSort = 'createdAt',
  currentOrder = 'desc',
  currentMinPrice,
  currentMaxPrice,
}: ProductFiltersProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const [minPrice, setMinPrice] = useState(currentMinPrice || '')
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice || '')
  const [sortBy, setSortBy] = useState(currentSort)
  const [sortOrder, setSortOrder] = useState(currentOrder)

  // Update local state when URL params change
  useEffect(() => {
    setMinPrice(currentMinPrice || '')
    setMaxPrice(currentMaxPrice || '')
    setSortBy(currentSort)
    setSortOrder(currentOrder)
  }, [currentMinPrice, currentMaxPrice, currentSort, currentOrder])

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams)

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    // Reset to first page when changing filters
    params.delete('page')

    router.push(`${pathname}?${params.toString()}`)
  }

  const handlePriceFilter = () => {
    updateFilters({
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
    })
  }

  const handleSortChange = (newSort: string) => {
    updateFilters({ sortBy: newSort })
  }

  const handleOrderChange = (newOrder: string) => {
    updateFilters({ sortOrder: newOrder })
  }

  const clearFilters = () => {
    updateFilters({
      minPrice: null,
      maxPrice: null,
      sortBy: null,
      sortOrder: null,
    })
  }

  const hasActiveFilters =
    currentMinPrice || currentMaxPrice || currentSort !== 'createdAt' || currentOrder !== 'desc'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Price Range Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Price Range</h4>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="minPrice"
                className="block text-xs text-gray-600 dark:text-gray-400 mb-1"
              >
                Min Price
              </label>
              <input
                type="number"
                id="minPrice"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="maxPrice"
                className="block text-xs text-gray-600 dark:text-gray-400 mb-1"
              >
                Max Price
              </label>
              <input
                type="number"
                id="maxPrice"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="1000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handlePriceFilter}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors"
            >
              Apply Price Filter
            </button>
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Sort By</h4>
          <div className="space-y-2">
            {[
              { value: 'relevance', label: 'Relevance' },
              { value: 'createdAt', label: 'Newest First' },
              { value: 'price', label: 'Price' },
              { value: 'title', label: 'Name' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
                  sortBy === option.value
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Order */}
        {sortBy === 'price' || sortBy === 'title' ? (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Sort Order</h4>
            <div className="space-y-2">
              {[
                { value: 'asc', label: 'Low to High' },
                { value: 'desc', label: 'High to Low' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOrderChange(option.value)}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
                    sortOrder === option.value
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
                  )}
                >
                  {option.value === 'asc' ? '↑' : '↓'} {option.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Active Filters
            </h4>
            <div className="space-y-1">
              {currentMinPrice && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Min Price:</span>
                  <span className="text-gray-900 dark:text-white">${currentMinPrice}</span>
                </div>
              )}
              {currentMaxPrice && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Max Price:</span>
                  <span className="text-gray-900 dark:text-white">${currentMaxPrice}</span>
                </div>
              )}
              {currentSort !== 'createdAt' && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Sort:</span>
                  <span className="text-gray-900 dark:text-white">
                    {currentSort === 'relevance'
                      ? 'Relevance'
                      : currentSort === 'price'
                        ? 'Price'
                        : currentSort === 'title'
                          ? 'Name'
                          : currentSort}
                  </span>
                </div>
              )}
              {currentOrder !== 'desc' && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Order:</span>
                  <span className="text-gray-900 dark:text-white">
                    {currentOrder === 'asc' ? 'Low to High' : 'High to Low'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
