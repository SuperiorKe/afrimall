'use client'

import React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/utils/helpers/ui'

interface ProductRatingProps {
  rating: number
  reviewCount: number
  className?: string
}

export function ProductRating({ rating, reviewCount, className }: ProductRatingProps) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {/* Star Rating */}
      <div className="flex items-center space-x-1">
        {[...Array(fullStars)].map((_, index) => (
          <Star
            key={`full-${index}`}
            className="w-5 h-5 fill-yellow-400 text-yellow-400"
          />
        ))}
        
        {hasHalfStar && (
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        )}
        
        {[...Array(emptyStars)].map((_, index) => (
          <Star
            key={`empty-${index}`}
            className="w-5 h-5 text-gray-300 dark:text-gray-600"
          />
        ))}
      </div>
      
      {/* Rating Text */}
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {rating.toFixed(1)}
      </span>
      
      {/* Review Count */}
      <span className="text-sm text-gray-500 dark:text-gray-400">
        ({reviewCount} reviews)
      </span>
    </div>
  )
}
