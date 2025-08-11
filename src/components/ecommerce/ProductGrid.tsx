'use client'

import React from 'react'
import Link from 'next/link'
import { ProductCard } from './ProductCard'
import { Pagination } from '@/components/ui/pagination'

interface Product {
  id: number
  title: string
  description: string
  images: {
    image: number | {
      id: number
      url?: string | null
      alt?: string | null
      width?: number | null
      height?: number | null
    }
    alt: string
    id?: string | null
  }[]
  price: number
  compareAtPrice?: number | null
  sku: string
  inventory?: {
    trackQuantity?: boolean | null
    quantity?: number | null
    allowBackorder?: boolean | null
    lowStockThreshold?: number | null
  } | null
  categories?: (number | {
    id: number
    title: string
    slug?: string | null
  })[] | null
  tags?: {
    tag: string
    id?: string | null
  }[] | null
  status: 'draft' | 'active' | 'archived'
  featured?: boolean | null
  weight?: number | null
  dimensions?: {
    length?: number | null
    width?: number | null
    height?: number | null
  } | null
}

interface PaginationInfo {
  totalDocs: number
  totalPages: number
  page: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface ProductGridProps {
  products: Product[]
  pagination: PaginationInfo
}

export function ProductGrid({ products, pagination }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m13 0H5"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No products found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View all products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            hasNextPage={pagination.hasNextPage}
            hasPrevPage={pagination.hasPrevPage}
          />
        </div>
      )}
    </div>
  )
}
