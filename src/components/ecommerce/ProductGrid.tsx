'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ProductCard } from './ProductCard'
import { MobileProductPagination } from './MobileProductPagination'
import { ProductSkeleton, ProductSkeletonCompact } from './ProductSkeleton'
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
  enableInfiniteScroll?: boolean
  onProductsUpdate?: (products: Product[], pagination: PaginationInfo) => void
}

export function ProductGrid({
  initialProducts = [],
  initialPagination,
  searchQuery,
  categoryFilter,
  enableInfiniteScroll = false,
  onProductsUpdate,
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [pagination, setPagination] = useState<PaginationInfo | undefined>(initialPagination)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInfiniteScroll, setIsInfiniteScroll] = useState(enableInfiniteScroll)
  const [loadingMore, setLoadingMore] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  // Ref to track current fetch request and prevent duplicate fetches
  const abortControllerRef = useRef<AbortController | null>(null)
  const isFetchingRef = useRef(false)

  // Fetch products from API
  const fetchProducts = useCallback(
    async (page: number = 1, append: boolean = false) => {
      // Prevent duplicate requests
      if (isFetchingRef.current && !append) {
        return
      }

      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new AbortController for this request
      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        isFetchingRef.current = true

        if (append) {
          setLoadingMore(true)
        } else {
          setLoading(true)
          setError(null)
        }

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

        const response = await fetch(`/api/products?${params.toString()}`, {
          signal: controller.signal,
        })
        const data = await response.json()

        if (data.success) {
          if (append) {
            // For infinite scroll, append new products using functional update
            setProducts((prev) => {
              const existingIds = new Set(prev.map(p => p.id))
              const newProducts = data.data.products.filter((p: Product) => !existingIds.has(p.id))
              return [...prev, ...newProducts]
            })
          } else {
            // For regular pagination, replace products
            setProducts(data.data.products)
          }

          setPagination(data.data.pagination)

          // Notify parent component of updates using functional approach
          if (onProductsUpdate) {
            if (append) {
              setProducts((currentProducts) => {
                onProductsUpdate(currentProducts, data.data.pagination)
                return currentProducts
              })
            } else {
              onProductsUpdate(data.data.products, data.data.pagination)
            }
          }
        } else {
          setError(data.message || 'Failed to fetch products')
        }
      } catch (err: any) {
        // Ignore abort errors
        if (err.name === 'AbortError') {
          console.log('Request cancelled')
          return
        }
        setError('Failed to fetch products. Please try again.')
        console.error('Error fetching products:', err)
      } finally {
        isFetchingRef.current = false
        if (append) {
          setLoadingMore(false)
        } else {
          setLoading(false)
        }
      }
    },
    [searchQuery, categoryFilter, searchParams, onProductsUpdate],
  )

  // Handle page changes
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
    fetchProducts(page)
  }

  // Handle infinite scroll load more
  const handleLoadMore = useCallback(() => {
    if (pagination && pagination.hasNextPage && !loadingMore && !isFetchingRef.current) {
      fetchProducts(pagination.page + 1, true)
    }
  }, [pagination, loadingMore, fetchProducts])

  // Cleanup function to cancel pending requests
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Reset products when filters change (but not on initial mount)
  useEffect(() => {
    // Skip on initial mount
    if (initialProducts.length > 0) {
      setProducts(initialProducts)
      setPagination(initialPagination)
    }
  }, [initialProducts, initialPagination])

  // Show loading state
  if (loading && !products.length) {
    return <ProductSkeleton count={8} />
  }

  // Show error state
  if (error && !products.length) {
    return (
      <div className="text-center py-12 sm:py-16 lg:py-20">
        <div className="max-w-md mx-auto px-4">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 sm:h-20 sm:w-20 text-red-400 dark:text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Error loading products
          </h3>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => fetchProducts(1)}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-all"
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
      <div className="text-center py-12 sm:py-16 lg:py-20">
        <div className="max-w-md mx-auto px-4">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 sm:h-20 sm:w-20 text-gray-300 dark:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m13 0H5"
              />
            </svg>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
            No products found
          </h3>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {searchQuery
              ? `No products found for "${searchQuery}"`
              : categoryFilter
                ? `No products found in this category`
                : 'Try adjusting your search or filter criteria.'}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-all"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Mobile-Friendly Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <MobileProductPagination
          pagination={pagination}
          onPageChange={handlePageChange}
          loading={loading || loadingMore}
          enableInfiniteScroll={isInfiniteScroll}
          onLoadMore={handleLoadMore}
          hasMoreProducts={pagination.hasNextPage}
        />
      )}

      {/* Loading indicator for infinite scroll */}
      {loadingMore && (
        <div className="mt-8">
          <ProductSkeletonCompact count={4} />
          <div className="text-center py-4">
            <div className="inline-flex items-center space-x-2 text-gray-600">
              <svg
                className="animate-spin h-5 w-5 text-blue-600"
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
              <span>Loading more products...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
