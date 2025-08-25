'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/utilities/formatPrice'
import { AddToCartButton } from './AddToCartButton'
import { SizeSelector } from './SizeSelector'
import { QuantityControls } from './QuantityControls'
import { ProductFeatures } from './ProductFeatures'
import { ProductRating } from './ProductRating'
import { Heart } from 'lucide-react'
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
    image:
      | number
      | {
          id: number
          url?: string | null
          alt?: string | null
          width?: string | null
          height?: string | null
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
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  // Get current price (variant price or product price)
  const currentPrice = selectedVariant?.price ?? product.price
  const currentComparePrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice

  // Get current inventory
  const currentInventory = selectedVariant
    ? selectedVariant.inventory?.available
    : product.inventory?.quantity

  const hasDiscount = currentComparePrice && currentComparePrice > currentPrice
  const discountPercentage = hasDiscount
    ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
    : 0

  const isOutOfStock = Boolean(
    product.inventory?.trackQuantity &&
      (currentInventory || 0) <= 0 &&
      !product.inventory?.allowBackorder,
  )
  const isLowStock = Boolean(
    product.inventory?.trackQuantity &&
      (currentInventory || 0) <= (product.inventory?.lowStockThreshold || 0) &&
      (currentInventory || 0) > 0,
  )

  // Extract available sizes from variants
  const availableSizes = Array.from(
    new Set(
      variants
        .filter((v) => v.status === 'active')
        .flatMap((v) => v.options.filter((opt) => opt.name === 'Size').map((opt) => opt.value)),
    ),
  )

  // Mock rating data (replace with actual data when available)
  const rating = 4.8
  const reviewCount = 45

  const handleVariantChange = (optionName: string, optionValue: string) => {
    // Find variant that matches the selected option
    const matchingVariant = variants.find((variant) =>
      variant.options.some((opt) => opt.name === optionName && opt.value === optionValue),
    )

    if (matchingVariant) {
      setSelectedVariant(matchingVariant)
    }
  }

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size)
    handleVariantChange('Size', size)
  }

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
  }

  return (
    <div className="space-y-8">
      {/* Product Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{product.title}</h1>

        {/* Product Description */}
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Rating */}
      <ProductRating rating={rating} reviewCount={reviewCount} />

      {/* Price Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatPrice(currentPrice)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                {formatPrice(currentComparePrice!)}
              </span>
              <Badge
                variant="secondary"
                className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              >
                -{discountPercentage}% OFF
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Size Selection */}
      {availableSizes.length > 0 && (
        <SizeSelector
          sizes={availableSizes}
          selectedSize={selectedSize}
          onSizeSelect={handleSizeSelect}
        />
      )}

      {/* Quantity Controls */}
      <QuantityControls
        quantity={quantity}
        onQuantityChange={setQuantity}
        maxQuantity={currentInventory || 99}
      />

      {/* Stock Status */}
      {product.inventory?.trackQuantity && (
        <div className="space-y-2">
          {isOutOfStock ? (
            <p className="text-red-600 dark:text-red-400 font-medium">Out of Stock</p>
          ) : isLowStock ? (
            <p className="text-orange-600 dark:text-orange-400 font-medium">
              Low Stock - Only {currentInventory} left!
            </p>
          ) : (
            <p className="text-green-600 dark:text-green-400 font-medium">In Stock</p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-4">
        <AddToCartButton product={product as any} className="flex-1" disabled={isOutOfStock} />

        <Button
          variant="outline"
          size="icon"
          onClick={toggleWishlist}
          className={cn(
            'h-12 w-12 rounded-lg transition-colors',
            isWishlisted
              ? 'text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              : 'hover:border-gray-400',
          )}
        >
          <Heart className={cn('h-5 w-5', isWishlisted && 'fill-current')} />
        </Button>
      </div>

      {/* Product Features */}
      <ProductFeatures />

      {/* Categories */}
      {product.categories && product.categories.length > 0 && (
        <div className="pt-4">
          <div className="flex flex-wrap gap-2">
            {product.categories.map((category) => (
              <Badge
                key={typeof category === 'object' ? category.id : category}
                variant="outline"
                className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
              >
                {typeof category === 'object' ? category.title : 'Category'}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
