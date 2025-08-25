'use client'

import React from 'react'
import { ProductCard } from './ProductCard'

interface Product {
  id: number
  title: string
  description: string
  images: {
    image:
      | number
      | {
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
  categories?:
    | (
        | number
        | {
            id: number
            title: string
            slug?: string | null
          }
      )[]
    | null
  tags?:
    | {
        tag: string
        id?: string | null
      }[]
    | null
  status: 'draft' | 'active' | 'archived'
  featured?: boolean | null
  weight?: number | null
  dimensions?: {
    length?: number | null
    width?: number | null
    height?: number | null
  } | null
}

interface RelatedProductsProps {
  products: Product[]
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Products</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product as any} />
        ))}
      </div>
    </div>
  )
}
