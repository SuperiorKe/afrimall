'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/utils/formatting/formatPrice'
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
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600">
      {/* Featured Badge */}
      {product.featured && (
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-yellow-900 shadow-sm">
            ⭐ Featured
          </span>
        </div>
      )}

      {/* Stock Status Badge */}
      {isOutOfStock && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white shadow-sm">
            Out of Stock
          </span>
        </div>
      )}

      {/* Product Image */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
        {mainImage?.url ? (
          <Link href={`/products/${product.slug}`} className="block h-full w-full">
            <Image
              src={mainImage.url}
              alt={mainImage.alt || product.title}
              width={400}
              height={400}
              className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
        ) : (
          <div className="flex items-center justify-center h-full">
            <svg
              className="h-16 w-16 text-gray-300 dark:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5">
        {/* Categories */}
        {product.categories && product.categories.length > 0 && (
          <div className="mb-2">
            <Link
              href={`/products?category=${product.categories[0].id}`}
              className="inline-block text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 uppercase tracking-wide transition-colors"
            >
              {product.categories[0].title}
            </Link>
          </div>
        )}

        {/* Product Title */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2 mb-2 min-h-[3rem]">
            {product.title}
          </h3>
        </Link>

        {/* Product Description */}
        {product.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 min-h-[2.5rem]">
            {product.description}
          </p>
        )}

        {/* Price Section */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                  SAVE{' '}
                  {Math.round(
                    ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
                  )}
                  %
                </span>
              </>
            )}
          </div>
          {/* SKU */}
          <span className="text-xs text-gray-400 dark:text-gray-500">SKU: {product.sku}</span>
        </div>

        {/* Stock Info */}
        {product.inventory?.trackQuantity && (
          <div className="mb-3 text-sm font-medium">
            {product.inventory.quantity && product.inventory.quantity > 0 ? (
              <span className="inline-flex items-center text-green-600 dark:text-green-400">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {product.inventory.quantity} in stock
              </span>
            ) : product.inventory.allowBackorder ? (
              <span className="inline-flex items-center text-orange-600 dark:text-orange-400">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Backorder available
              </span>
            ) : (
              <span className="inline-flex items-center text-red-600 dark:text-red-400">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                Out of stock
              </span>
            )}
          </div>
        )}

        {/* Add to Cart Button */}
        <AddToCartButton
          product={product}
          disabled={isOutOfStock || false}
          className="w-full mt-auto"
        />
      </div>
    </div>
  )
}
