'use client'

import React, { useState, useRef } from 'react'
import { ProductGrid } from '@/components/ecommerce/ProductGrid'
import { CategoryFilter } from '@/components/ecommerce/CategoryFilter'
import { ProductFilters } from '@/components/ecommerce/ProductFilters'
import { MobileFilterSheet } from '@/components/ecommerce/MobileFilterSheet'
import { SortPopover } from '@/components/ecommerce/SortPopover'
import { Filter, ArrowUpDown } from 'lucide-react'

// Define types based on what products/page.tsx will pass
// These should match the transformed data structures
type Product = any // Replace with a more specific type if available
type Category = { id: string; title: string; [key: string]: any } // Loosely typed for now
type Pagination = any // Replace with a more specific type

interface ProductsClientProps {
  initialProducts: Product[]
  initialPagination: Pagination
  categories: Category[]
  searchQuery?: string
  categoryFilter?: string
}

export function ProductsClient({ 
  initialProducts,
  initialPagination,
  categories,
  searchQuery,
  categoryFilter
}: ProductsClientProps) {
  const [isFilterSheetOpen, setFilterSheetOpen] = useState(false)
  const [isSortPopoverOpen, setSortPopoverOpen] = useState(false)
  const sortButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Filters - Hidden on Mobile */}
      <div className="hidden lg:block lg:col-span-1">
        <div className="sticky top-28 space-y-6">
          <CategoryFilter categories={categories} selectedCategory={categoryFilter} />
          <ProductFilters />
        </div>
      </div>

      {/* Products Grid */}
      <div className="lg:col-span-3">
        {/* Mobile Filter/Sort Buttons */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <button
            onClick={() => setFilterSheetOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg"
          >
            <Filter size={16} />
            <span>Filters</span>
          </button>
          <button
            ref={sortButtonRef}
            onClick={() => setSortPopoverOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg"
          >
            <ArrowUpDown size={16} />
            <span>Sort By</span>
          </button>
        </div>

        <MobileFilterSheet
          isOpen={isFilterSheetOpen}
          onClose={() => setFilterSheetOpen(false)}
          categories={categories}
        />
        <SortPopover
          isOpen={isSortPopoverOpen}
          onClose={() => setSortPopoverOpen(false)}
          anchorEl={sortButtonRef.current}
        />

        <ProductGrid
          initialProducts={initialProducts}
          initialPagination={initialPagination}
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
          enableInfiniteScroll={false}
        />
      </div>
    </div>
  )
}

