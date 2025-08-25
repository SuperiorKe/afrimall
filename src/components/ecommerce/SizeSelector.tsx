'use client'

import React from 'react'
import { cn } from '@/utilities/ui'

interface SizeSelectorProps {
  sizes: string[]
  selectedSize: string | null
  onSizeSelect: (size: string) => void
  className?: string
}

export function SizeSelector({ sizes, selectedSize, onSizeSelect, className }: SizeSelectorProps) {
  if (!sizes || sizes.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-3', className)}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Size
      </label>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onSizeSelect(size)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-200 hover:scale-105',
              selectedSize === size
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            )}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  )
}
