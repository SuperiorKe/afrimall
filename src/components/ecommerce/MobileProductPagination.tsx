'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, MoreHorizontal, Loader2 } from 'lucide-react'
import { cn } from '@/utilities/ui'

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

interface MobileProductPaginationProps {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
  loading?: boolean
  className?: string
  enableInfiniteScroll?: boolean
  onLoadMore?: () => void
  hasMoreProducts?: boolean
}

export function MobileProductPagination({
  pagination,
  onPageChange,
  loading = false,
  className,
  enableInfiniteScroll = false,
  onLoadMore,
  hasMoreProducts = false,
}: MobileProductPaginationProps) {
  const [isInfiniteScroll, setIsInfiniteScroll] = useState(enableInfiniteScroll)
  const [showPageSizeSelector, setShowPageSizeSelector] = useState(false)
  const [jumpToPage, setJumpToPage] = useState('')
  const [showJumpTo, setShowJumpTo] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const observerRef = useRef<HTMLDivElement>(null)
  const toggleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastLoadRef = useRef<number>(0)

  // Handle toggle with debounce and state reset
  const handleToggleInfiniteScroll = useCallback(() => {
    // Clear any pending toggle
    if (toggleTimeoutRef.current) {
      clearTimeout(toggleTimeoutRef.current)
    }

    setIsToggling(true)

    // Debounce the toggle action
    toggleTimeoutRef.current = setTimeout(() => {
      setIsInfiniteScroll((prev) => {
        const newValue = !prev
        
        // If switching to pagination mode, reset to page 1
        if (!newValue) {
          const params = new URLSearchParams(searchParams)
          params.set('page', '1')
          router.push(`${pathname}?${params.toString()}`)
        }
        
        return newValue
      })
      
      setIsToggling(false)
    }, 300)
  }, [searchParams, pathname, router])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (toggleTimeoutRef.current) {
        clearTimeout(toggleTimeoutRef.current)
      }
    }
  }, [])

  // Infinite scroll implementation with proper cleanup and throttling
  useEffect(() => {
    if (!isInfiniteScroll || !onLoadMore || !hasMoreProducts || isToggling) {
      return
    }

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && !loading) {
        // Throttle load more calls to once per 1 second
        const now = Date.now()
        if (now - lastLoadRef.current > 1000) {
          lastLoadRef.current = now
          onLoadMore()
        }
      }
    }

    const observer = new IntersectionObserver(handleIntersect, {
      threshold: 0.1,
      rootMargin: '100px',
    })

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [isInfiniteScroll, onLoadMore, hasMoreProducts, loading, isToggling])

  // Handle page size change
  const handlePageSizeChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('limit', newLimit.toString())
    params.set('page', '1') // Reset to first page
    router.push(`${pathname}?${params.toString()}`)
    setShowPageSizeSelector(false)
  }

  // Handle jump to page
  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPage)
    if (pageNum >= 1 && pageNum <= pagination.totalPages) {
      onPageChange(pageNum)
      setJumpToPage('')
      setShowJumpTo(false)
    }
  }

  // Generate page numbers for display
  const getPageNumbers = () => {
    const { page, totalPages } = pagination
    const pages: (number | 'ellipsis')[] = []

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Smart pagination logic
      if (page <= 4) {
        // Near the beginning
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (page >= totalPages - 3) {
        // Near the end
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // In the middle
        pages.push(1)
        pages.push('ellipsis')
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }

    return pages
  }

  // Mobile-optimized button component
  const MobileButton = ({
    children,
    onClick,
    disabled = false,
    variant = 'default',
    size = 'default',
    className: buttonClassName,
    ...props
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    variant?: 'default' | 'active' | 'ghost'
    size?: 'default' | 'sm'
    className?: string
    [key: string]: any
  }) => {
    const baseClasses =
      'touch-manipulation transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'

    const variantClasses = {
      default:
        'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed',
      active: 'bg-blue-600 text-white border-blue-600',
      ghost: 'text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed',
    }

    const sizeClasses = {
      default: 'min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-medium',
      sm: 'min-h-[36px] min-w-[36px] px-3 py-1.5 text-xs font-medium',
    }

    return (
      <button
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], buttonClassName)}
        onClick={onClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }

  // Don't render if only one page
  if (pagination.totalPages <= 1) {
    return null
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Pagination Controls */}
      {!isInfiniteScroll && (
        <div className="flex flex-col space-y-4">
          {/* Main pagination */}
          <div className="flex items-center justify-center space-x-2">
            {/* Previous button */}
            <MobileButton
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage || loading}
              className="flex items-center space-x-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </MobileButton>

            {/* Page numbers - responsive display */}
            <div className="flex items-center space-x-1">
              {getPageNumbers().map((pageNum, index) => {
                if (pageNum === 'ellipsis') {
                  return (
                    <div
                      key={`ellipsis-${index}`}
                      className="flex h-9 w-9 items-center justify-center"
                    >
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </div>
                  )
                }

                const isActive = pageNum === pagination.page
                return (
                  <MobileButton
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    disabled={loading}
                    variant={isActive ? 'active' : 'default'}
                    size="default"
                    className="rounded-md"
                    aria-label={`Go to page ${pageNum}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {pageNum}
                  </MobileButton>
                )
              })}
            </div>

            {/* Next button */}
            <MobileButton
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage || loading}
              className="flex items-center space-x-1"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </MobileButton>
          </div>

          {/* Page info and controls */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            {/* Page info */}
            <div className="flex items-center space-x-2">
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <span className="text-gray-400">•</span>
              <span>{pagination.totalDocs} products total</span>
            </div>

            {/* Control buttons */}
            <div className="flex items-center space-x-2">
              {/* Page size selector */}
              <div className="relative">
                <MobileButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPageSizeSelector(!showPageSizeSelector)}
                  className="text-xs"
                >
                  {pagination.limit} per page
                </MobileButton>

                {showPageSizeSelector && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    {[12, 24, 48].map((limit) => (
                      <button
                        key={limit}
                        onClick={() => handlePageSizeChange(limit)}
                        className={cn(
                          'w-full px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-md last:rounded-b-md',
                          pagination.limit === limit && 'bg-blue-50 text-blue-600',
                        )}
                      >
                        {limit} per page
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Jump to page */}
              {pagination.totalPages > 10 && (
                <div className="relative">
                  <MobileButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowJumpTo(!showJumpTo)}
                    className="text-xs"
                  >
                    Jump to
                  </MobileButton>

                  {showJumpTo && (
                    <div className="absolute right-0 top-full mt-1 w-24 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-2">
                      <input
                        type="number"
                        min="1"
                        max={pagination.totalPages}
                        value={jumpToPage}
                        onChange={(e) => setJumpToPage(e.target.value)}
                        placeholder="Page"
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleJumpToPage}
                        className="w-full mt-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Go
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Infinite scroll toggle and load more button */}
      <div className="flex items-center justify-center space-x-4">
        {/* Toggle infinite scroll */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Infinite scroll:</label>
          <button
            onClick={handleToggleInfiniteScroll}
            disabled={isToggling}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
              isInfiniteScroll ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700',
            )}
            aria-label={`${isInfiniteScroll ? 'Disable' : 'Enable'} infinite scroll`}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                isInfiniteScroll ? 'translate-x-6' : 'translate-x-1',
              )}
            />
          </button>
          {isToggling && (
            <span className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">
              Loading...
            </span>
          )}
        </div>

        {/* Load more button for infinite scroll */}
        {isInfiniteScroll && hasMoreProducts && (
          <MobileButton
            onClick={onLoadMore}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <span>Load More Products</span>
            )}
          </MobileButton>
        )}
      </div>

      {/* Infinite scroll trigger */}
      {isInfiniteScroll && <div ref={observerRef} className="h-4" />}

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading products...</span>
          </div>
        </div>
      )}
    </div>
  )
}
