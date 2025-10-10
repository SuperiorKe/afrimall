'use client'

import React from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { cn } from '@/utilities/ui'

interface SortPopoverProps {
  isOpen: boolean
  onClose: () => void
  anchorEl: HTMLElement | null
}

const sortOptions = [
  { value: 'createdAt', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'title-asc', label: 'Name: A to Z' },
  { value: 'title-desc', label: 'Name: Z to A' },
]

export function SortPopover({ isOpen, onClose, anchorEl }: SortPopoverProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const currentSort = searchParams.get('sort') || 'createdAt'
  const currentOrder = searchParams.get('order') || 'desc'
  const activeSort = `${currentSort}-${currentOrder}`

  const handleSortChange = (value: string) => {
    const [sort, order] = value.split('-')
    const params = new URLSearchParams(searchParams)
    params.set('sort', sort)
    params.set('order', order)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
    onClose()
  }

  if (!isOpen || !anchorEl) return null

  const rect = anchorEl.getBoundingClientRect()

  return (
    <div className="fixed inset-0 z-50 lg:hidden" onClick={onClose}>
      <div
        className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-2"
        style={{
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
          width: rect.width,
        }}
      >
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSortChange(option.value)}
            className="w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span>{option.label}</span>
            {activeSort === option.value && <Check size={16} className="text-blue-500" />}
          </button>
        ))}
      </div>
    </div>
  )
}

