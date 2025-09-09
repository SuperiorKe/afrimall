'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ProductCard } from './ProductCard'
import { Pagination } from '@/components/ui/pagination'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

interface Product {
  id: string
  title: string
  description: string
  images: {
    id: string
    url: string | null
    alt: string
    width: number
    height: number
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
  categories?:
    | {
        id: string
        title: string
        slug?: string | null
      }[]
    | null
  tags?:
    | {
        id: string
        tag: string
      }[]
    | null
  status: 'draft' | 'active' | 'archived'
  featured?: boolean | null
  slug: string
}

interface PaginationInfo {
  totalDocs: number
  totalPages: number
  page: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPage?: number
  prevPage?: number
}

interface ProductGridProps {
  initialProducts?: Product[]
  initialPagination?: PaginationInfo
  searchQuery?: string
  categoryFilter?: string
}

export function ProductGrid({
  initialProducts = [],
  initialPagination,
  searchQuery,
  categoryFilter,
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [pagination, setPagination] = useState<PaginationInfo | undefined>(initialPagination)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Fetch products from API
  const fetchProducts = useCallback(async (page: number = 1) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', '12')

      // Add search query if present
      if (searchQuery) {
        params.set('search', searchQuery)
      }

      // Add category filter if present
      if (categoryFilter) {
        params.set('category', categoryFilter)
      }

      // Add current filters from URL
      const currentSearch = searchParams.get('search')
      const currentCategory = searchParams.get('category')
      const currentSort = searchParams.get('sortBy') || 'createdAt'
      const currentOrder = searchParams.get('sortOrder') || 'desc'
      const currentMinPrice = searchParams.get('minPrice')
      const currentMaxPrice = searchParams.get('maxPrice')

      if (currentSearch) params.set('search', currentSearch)
      if (currentCategory) params.set('category', currentCategory)
      params.set('sortBy', currentSort)
      params.set('sortOrder', currentOrder)
      if (currentMinPrice) params.set('minPrice', currentMinPrice)
      if (currentMaxPrice) params.set('maxPrice', currentMaxPrice)

      const response = await fetch(`/api/products?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setProducts(data.data.products)
        setPagination(data.data.pagination)
      } else {
        setError(data.message || 'Failed to fetch products')
      }
    } catch (err) {
      setError('Failed to fetch products. Please try again.')
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, categoryFilter])

  // Handle page changes
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
    fetchProducts(page)
  }

  // Fetch products when component mounts or filters change
  useEffect(() => {
    if (!initialProducts.length) {
      fetchProducts(1)
    }
  }, [searchQuery, categoryFilter, fetchProducts, initialProducts.length])

  // Show loading state
  if (loading && !products.length) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  // Show error state
  if (error && !products.length) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Error loading products
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => fetchProducts(1)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Show empty state
  if (!loading && products.length === 0) {
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
            {searchQuery
              ? `No products found for "${searchQuery}"`
              : categoryFilter
                ? `No products found in this category`
                : 'Try adjusting your search or filter criteria.'}
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
    <div className="space-y-8">
      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <nav className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Loading indicator for pagination */}
      {loading && products.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </div>
        </div>
      )}
    </div>
  )
}
