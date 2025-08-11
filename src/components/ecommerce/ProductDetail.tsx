'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/utilities/formatPrice'
import { AddToCartButton } from './AddToCartButton'
import { ProductGallery } from './ProductGallery'
import { ProductVariant } from '@/payload-types'
import { cn } from '@/utilities/ui'

interface Product {
  id: number
  title: string
  description: string
  fullDescription?: {
    root: {
      type: string
      children: {
        type: string
        version: number
        [k: string]: unknown
      }[]
      direction: ('ltr' | 'rtl') | null
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | ''
      indent: number
      version: number
    }
    [k: string]: unknown
  } | null
  images: {
    image: number | {
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
  categories?: (number | {
    id: number
    title: string
    slug?: string | null
  })[] | null
  tags?: {
    tag: string
    id?: string | null
  }[] | null
  status: 'draft' | 'active' | 'archived'
  featured?: boolean | null
  weight?: number | null
  dimensions?: {
    length?: number | null
    width?: number | null
    height?: number | null
  } | null
  variants?: ProductVariant[]
}

interface ProductDetailProps {
  product: Product
  variants: ProductVariant[]
}

export function ProductDetail({ product, variants }: ProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.find((v) => v.status === 'active') || null,
  )
  const [quantity, setQuantity] = useState(1)

  // Get current price (variant price or product price)
  const currentPrice = selectedVariant?.price ?? product.price
  const currentComparePrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice

  // Get current inventory
  const currentInventory = selectedVariant
    ? selectedVariant.inventory.available
    : product.inventory.quantity

  const hasDiscount = currentComparePrice && currentComparePrice > currentPrice
  const discountPercentage = hasDiscount
    ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
    : 0

  const isOutOfStock =
    product.inventory.trackQuantity && currentInventory <= 0 && !product.inventory.allowBackorder
  const isLowStock =
    product.inventory.trackQuantity &&
    currentInventory <= product.inventory.lowStockThreshold &&
    currentInventory > 0

  // Group variants by option name for display
  const variantOptions: { [key: string]: string[] } = {}
  variants.forEach((variant) => {
    variant.options.forEach((option) => {
      if (!variantOptions[option.name]) {
        variantOptions[option.name] = []
      }
      if (!variantOptions[option.name].includes(option.value)) {
        variantOptions[option.name].push(option.value)
      }
    })
  })

  const handleVariantChange = (optionName: string, optionValue: string) => {
    // Find variant that matches the selected option
    const matchingVariant = variants.find((variant) =>
      variant.options.some((opt) => opt.name === optionName && opt.value === optionValue),
    )

    if (matchingVariant) {
      setSelectedVariant(matchingVariant)
    }
  }

  return (
    <div className="space-y-6">
      {/* Product Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.title}</h1>

        {/* Categories */}
        {product.categories && product.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {product.categories.map((category) => (
              <span
                key={category.id}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {category.title}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">
          {formatPrice(currentPrice)}
        </span>
        {hasDiscount && (
          <>
            <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
              {formatPrice(currentComparePrice!)}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              -{discountPercentage}% OFF
            </span>
          </>
        )}
      </div>

      {/* Stock Status */}
      <div className="space-y-2">
        {isOutOfStock ? (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span className="font-medium">Out of Stock</span>
          </div>
        ) : isLowStock ? (
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span className="font-medium">Only {currentInventory} left in stock!</span>
          </div>
        ) : product.inventory.trackQuantity ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="font-medium">In Stock ({currentInventory} available)</span>
          </div>
        ) : null}
      </div>

      {/* Description */}
      <div>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</p>
      </div>

      {/* Variant Options */}
      {Object.keys(variantOptions).length > 0 && (
        <div className="space-y-4">
          {Object.entries(variantOptions).map(([optionName, values]) => (
            <div key={optionName}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {optionName}
              </label>
              <div className="flex flex-wrap gap-2">
                {values.map((value) => {
                  const isSelected = selectedVariant?.options.some(
                    (opt) => opt.name === optionName && opt.value === value,
                  )

                  return (
                    <button
                      key={value}
                      onClick={() => handleVariantChange(optionName, value)}
                      className={cn(
                        'px-4 py-2 text-sm font-medium rounded-md border transition-colors',
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
                      )}
                    >
                      {value}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quantity Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Quantity
        </label>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max={isOutOfStock ? 0 : currentInventory}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-2 py-2 text-center border-0 focus:ring-0 dark:bg-gray-800 dark:text-white"
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              disabled={
                isOutOfStock || (product.inventory.trackQuantity && quantity >= currentInventory)
              }
              className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="pt-4">
        <AddToCartButton
          productId={product.id}
          productTitle={product.title}
          price={currentPrice}
          variantId={selectedVariant?.id}
          quantity={quantity}
          disabled={isOutOfStock}
          size="lg"
          className="w-full"
        />
      </div>

      {/* Product Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500 dark:text-gray-400">SKU:</dt>
            <dd className="text-sm text-gray-900 dark:text-white font-mono">
              {selectedVariant?.sku || product.sku}
            </dd>
          </div>

          {product.tags && product.tags.length > 0 && (
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400 mb-2">Tags:</dt>
              <dd className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  >
                    {tag.tag}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}
