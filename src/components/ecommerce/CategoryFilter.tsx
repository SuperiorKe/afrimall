'use client'

import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/utilities/ui'

interface Category {
  id: string
  title: string
  slug: string
  productCount?: number
  image?: {
    url: string
    alt: string
    filename: string
  }
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory?: string
}

export function CategoryFilter({ categories, selectedCategory }: CategoryFilterProps) {
  const searchParams = useSearchParams()

  const buildUrl = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (categoryId) {
      params.set('category', categoryId)
    } else {
      params.delete('category')
    }

    // Reset to first page when changing category
    params.delete('page')

    return `/products?${params.toString()}`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>

      <div className="space-y-2">
        {/* All Categories Link */}
        <Link
          href={buildUrl(null)}
          className={cn(
            'block px-3 py-2 text-sm rounded-md transition-colors',
            !selectedCategory
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
          )}
        >
          All Categories
        </Link>

        {/* Category Links */}
        {categories.map((category) => (
          <Link
            key={category.id}
            href={buildUrl(category.id)}
            className={cn(
              'block px-3 py-2 text-sm rounded-md transition-colors',
              selectedCategory === category.id
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
            )}
          >
            <div className="flex justify-between items-center">
              <span>{category.title}</span>
              {category.productCount !== undefined && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({category.productCount})
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
