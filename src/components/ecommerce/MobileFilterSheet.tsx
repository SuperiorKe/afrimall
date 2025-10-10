'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { X } from 'lucide-react'
import { cn } from '@/utilities/ui'

// Assuming Category type is defined elsewhere and imported
interface Category {
  id: string
  title: string
}

interface MobileFilterSheetProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
}

export function MobileFilterSheet({ isOpen, onClose, categories }: MobileFilterSheetProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || null)
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get('minPrice')) || 0,
    Number(searchParams.get('maxPrice')) || 1000,
  ])

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || null)
    setPriceRange([
      Number(searchParams.get('minPrice')) || 0,
      Number(searchParams.get('maxPrice')) || 1000,
    ])
  }, [searchParams])

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams)
    params.set('minPrice', priceRange[0].toString())
    params.set('maxPrice', priceRange[1].toString())
    if (selectedCategory) {
      params.set('category', selectedCategory)
    } else {
      params.delete('category')
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
    onClose()
  }

  const handleClearFilters = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('minPrice')
    params.delete('maxPrice')
    params.delete('category')
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={onClose}>
      <div
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl shadow-lg p-6 transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
        style={{ transform: isOpen ? 'translateY(0)' : 'translateY(100%)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Filters</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={24} />
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">Category</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'px-4 py-2 text-sm rounded-full border',
                !selectedCategory
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'px-4 py-2 text-sm rounded-full border',
                  selectedCategory === cat.id
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
                )}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Slider */}
        <div className="mb-8">
          <h4 className="font-medium mb-4">Price Range</h4>
          <div className="px-2">
            <Slider
              range
              min={0}
              max={1000}
              value={priceRange}
              onChange={(value) => setPriceRange(value as [number, number])}
              step={10}
              className='rc-slider-custom'
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleClearFilters}
            className="flex-1 py-3 px-4 rounded-lg border border-gray-300 dark:border-gray-600 text-center font-semibold"
          >
            Clear
          </button>
          <button
            onClick={handleApplyFilters}
            className="flex-1 py-3 px-4 rounded-lg bg-blue-600 text-white text-center font-semibold hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}

