'use client'

import React from 'react'

interface ProductSkeletonProps {
  count?: number
  className?: string
}

export function ProductSkeleton({ count = 8, className }: ProductSkeletonProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className || ''}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          {/* Image skeleton */}
          <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>

          {/* Title skeleton */}
          <div className="space-y-2 mb-3">
            <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4"></div>
            <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-1/2"></div>
          </div>

          {/* Price skeleton */}
          <div className="flex items-center space-x-2 mb-2">
            <div className="bg-gray-200 dark:bg-gray-700 h-5 rounded w-16"></div>
            <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-12"></div>
          </div>

          {/* Button skeleton */}
          <div className="bg-gray-200 dark:bg-gray-700 h-10 rounded-md"></div>
        </div>
      ))}
    </div>
  )
}

// Compact skeleton for infinite scroll
export function ProductSkeletonCompact({ count = 4, className }: ProductSkeletonProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className || ''}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 h-40 rounded-lg mb-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
          <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-2/3 mb-2"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-1/3"></div>
        </div>
      ))}
    </div>
  )
}

// Shimmer animation styles
const shimmerStyles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`

// Inject shimmer styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = shimmerStyles
  document.head.appendChild(styleSheet)
}
