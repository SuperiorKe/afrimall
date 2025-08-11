'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/utilities/ui'

interface ProductFiltersProps {
  minPrice?: string
  maxPrice?: string
  sort?: string
  order?: string
}

export function ProductFilters({ minPrice, maxPrice, sort, order }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [priceRange, setPriceRange] = useState({
    min: minPrice || '',
    max: maxPrice || '',
  })

  const handleSortChange = (newSort: string, newOrder: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', newSort)
    params.set('order', newOrder)
    params.delete('page') // Reset to first page

    router.push(`/products?${params.toString()}`)
  }

  const handlePriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString())

    if (priceRange.min) {
      params.set('minPrice', priceRange.min)
    } else {
      params.delete('minPrice')
    }

    if (priceRange.max) {
      params.set('maxPrice', priceRange.max)
    } else {
      params.delete('maxPrice')
    }

    params.delete('page') // Reset to first page

    router.push(`/products?${params.toString()}`)
  }

  const clearPriceFilter = () => {
    setPriceRange({ min: '', max: '' })
    const params = new URLSearchParams(searchParams.toString())
    params.delete('minPrice')
    params.delete('maxPrice')
    params.delete('page')

    router.push(`/products?${params.toString()}`)
  }

  const sortOptions = [
    { value: 'createdAt', order: 'desc', label: 'Newest First' },
    { value: 'createdAt', order: 'asc', label: 'Oldest First' },
    { value: 'price', order: 'asc', label: 'Price: Low to High' },
    { value: 'price', order: 'desc', label: 'Price: High to Low' },
    { value: 'title', order: 'asc', label: 'Name: A to Z' },
    { value: 'title', order: 'desc', label: 'Name: Z to A' },
  ]

  const currentSort =
    sortOptions.find((option) => option.value === sort && option.order === order) || sortOptions[0]

  return (
    <div className="space-y-6">
      {/* Sort Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sort By</h3>

        <div className="space-y-2">
          {sortOptions.map((option) => (
            <button
              key={`${option.value}-${option.order}`}
              onClick={() => handleSortChange(option.value, option.order)}
              className={cn(
                'w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
                currentSort.value === option.value && currentSort.order === option.order
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Price Range</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={priceRange.min}
                onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="1000"
                value={priceRange.max}
                onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePriceFilter}
              className="flex-1 bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Apply
            </button>
            <button
              onClick={clearPriceFilter}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
