'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/utilities/formatPrice'
import { AddToCartButton } from './AddToCartButton'

interface Product {
  id: number
  title: string
  description: string
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
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)

  const primaryImage = product.images?.[0]
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const discountPercentage = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0

  const imageUrl = primaryImage?.image?.filename
    ? `/api/media/file/${primaryImage.image.filename}`
    : '/placeholder-product.jpg'

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-afrimall-orange/30">
      {/* African Pattern Border */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-afrimall-orange/5 via-transparent to-afrimall-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Product Image */}
      <Link href={`/products/${product.id}`} className="block relative">
        <div className="aspect-square overflow-hidden bg-gray-50 dark:bg-gray-700 relative">
          {!imageError ? (
            <Image
              src={imageUrl}
              alt={primaryImage?.alt || product.title}
              width={400}
              height={400}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
              <div className="text-center">
                <svg
                  className="w-16 h-16 text-afrimall-orange/50 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-xs text-gray-400">African Product</p>
              </div>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.featured && (
            <span className="bg-gradient-to-r from-afrimall-gold to-afrimall-orange text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
              ⭐ Featured
            </span>
          )}
          {hasDiscount && (
            <span className="bg-gradient-to-r from-afrimall-red to-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
              -{discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* African Heritage Badge */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
            <span className="text-afrimall-orange text-lg">🌍</span>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5 relative z-10">
        {/* Categories */}
        {product.categories && product.categories.length > 0 && (
          <div className="mb-2">
            <span className="text-xs font-medium text-afrimall-orange bg-afrimall-orange/10 px-2 py-1 rounded-full">
              {product.categories[0].title}
            </span>
          </div>
        )}

        {/* Title */}
        <Link href={`/products/${product.id}`}>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-afrimall-orange transition-colors leading-tight">
            {product.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-bold text-afrimall-orange">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <AddToCartButton
          productId={product.id}
          productTitle={product.title}
          price={product.price}
          className="w-full bg-gradient-to-r from-afrimall-orange to-afrimall-red hover:from-afrimall-red hover:to-afrimall-orange text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
        />

        {/* African Cultural Element */}
        <div className="mt-3 flex items-center justify-center">
          <div className="flex space-x-1 opacity-30">
            <div className="w-2 h-2 bg-afrimall-gold rounded-full"></div>
            <div className="w-2 h-2 bg-afrimall-orange rounded-full"></div>
            <div className="w-2 h-2 bg-afrimall-red rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
