'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/utilities/formatPrice'
import { AddToCartButton } from './AddToCartButton'

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
  status: 'draft' | 'active' | 'archived'
  featured?: boolean | null
  slug: string
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images?.[0]
  const isOutOfStock =
    product.inventory?.trackQuantity &&
    !product.inventory?.allowBackorder &&
    (product.inventory?.quantity || 0) <= 0

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Featured Badge */}
      {product.featured && (
        <div className="absolute top-2 left-2 z-10">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Featured
          </span>
        </div>
      )}

      {/* Stock Status Badge */}
      {isOutOfStock && (
        <div className="absolute top-2 right-2 z-10">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Out of Stock
          </span>
        </div>
      )}

      {/* Product Image */}
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200 dark:bg-gray-700">
        {mainImage?.url ? (
          <Link href={`/products/${product.slug}`}>
            <Image
              src={mainImage.url}
              alt={mainImage.alt || product.title}
              width={400}
              height={400}
              className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity duration-200"
            />
          </Link>
        ) : (
          <div className="flex items-center justify-center h-full">
            <svg
              className="h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Categories */}
        {product.categories && product.categories.length > 0 && (
          <div className="mb-2">
            <Link
              href={`/products?category=${product.categories[0].id}`}
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {product.categories[0].title}
            </Link>
          </div>
        )}

        {/* Product Title */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
            {product.title}
          </h3>
        </Link>

        {/* Product Description */}
        {product.description && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* SKU */}
          <span className="text-xs text-gray-400 dark:text-gray-500">{product.sku}</span>
        </div>

        {/* Add to Cart Button */}
        <div className="mt-3">
          <AddToCartButton product={product} disabled={isOutOfStock || false} className="w-full" />
        </div>

        {/* Stock Info */}
        {product.inventory?.trackQuantity && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {product.inventory.quantity && product.inventory.quantity > 0 ? (
              <span className="text-green-600 dark:text-green-400">
                {product.inventory.quantity} in stock
              </span>
            ) : product.inventory.allowBackorder ? (
              <span className="text-orange-600 dark:text-orange-400">Backorder available</span>
            ) : (
              <span className="text-red-600 dark:text-red-400">Out of stock</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
