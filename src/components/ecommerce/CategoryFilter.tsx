'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, usePathname } from 'next/navigation'
import { cn } from '@/utils/helpers/ui'

interface Category {
  id: string
  title: string
  slug?: string | null
  image?: {
    url: string
    alt: string
  } | null
  description?: string | null
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory?: string
  searchQuery?: string
}

export function CategoryFilter({ categories, selectedCategory, searchQuery }: CategoryFilterProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const createFilterUrl = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams)

    if (categoryId) {
      params.set('category', categoryId)
    } else {
      params.delete('category')
    }

    // Reset to first page when changing filters
    params.delete('page')

    return `${pathname}?${params.toString()}`
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('category')
    params.delete('page')
    return `${pathname}?${params.toString()}`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Categories</h3>
        {selectedCategory && (
          <Link
            href={clearFilters()}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Clear
          </Link>
        )}
      </div>

      <div className="space-y-2">
        {/* All Categories Option */}
        <Link
          href={createFilterUrl(null)}
          className={cn(
            'flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200',
            !selectedCategory
              ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700',
          )}
        >
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                'text-sm font-medium truncate',
                !selectedCategory
                  ? 'text-blue-900 dark:text-blue-100'
                  : 'text-gray-900 dark:text-white',
              )}
            >
              All Categories
            </p>
            <p
              className={cn(
                'text-xs truncate',
                !selectedCategory
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-500 dark:text-gray-400',
              )}
            >
              Browse all products
            </p>
          </div>
        </Link>

        {/* Category Options */}
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id
          const itemCount = 0 // TODO: Get actual count from API

          return (
            <Link
              key={category.id}
              href={createFilterUrl(category.id)}
              className={cn(
                'flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200',
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700',
              )}
            >
              {/* Category Image or Icon */}
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                {category.image?.url ? (
                  <Image
                    src={category.image.url}
                    alt={category.image.alt || category.title}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Category Info */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-sm font-medium truncate',
                    isSelected
                      ? 'text-blue-900 dark:text-blue-100'
                      : 'text-gray-900 dark:text-white',
                  )}
                >
                  {category.title}
                </p>
                {category.description && (
                  <p
                    className={cn(
                      'text-xs truncate',
                      isSelected
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-500 dark:text-gray-400',
                    )}
                  >
                    {category.description}
                  </p>
                )}
              </div>

              {/* Item Count */}
              {itemCount > 0 && (
                <span
                  className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    isSelected
                      ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
                  )}
                >
                  {itemCount}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Search Results Note */}
      {searchQuery && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            Showing search results for "{searchQuery}". Use category filters to narrow down results.
          </p>
        </div>
      )}
    </div>
  )
}
