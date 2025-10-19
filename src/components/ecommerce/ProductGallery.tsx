'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/utils/helpers/ui'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

interface ProductImage {
  id: number
  url?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
}

interface ProductGalleryProps {
  images: {
    image: number | ProductImage
    alt: string
    id?: string | null
  }[]
  productTitle: string
}

export function ProductGallery({ images, productTitle }: ProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [imageError, setImageError] = useState<{ [key: number]: boolean }>({})

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
        <svg
          className="w-24 h-24 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    )
  }

  const selectedImage = images[selectedImageIndex]
  const selectedImageUrl = typeof selectedImage?.image === 'object' && selectedImage.image?.url
    ? selectedImage.image.url
    : '/placeholder-product.jpg'

  return (
    <div className="space-y-6">
      {/* Main Image Container */}
      <div className="relative group">
        <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden shadow-lg">
          {!imageError[selectedImageIndex] ? (
            <Image
              src={selectedImageUrl}
              alt={selectedImage?.alt || productTitle}
              width={600}
              height={600}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              priority
              onError={() => setImageError((prev) => ({ ...prev, [selectedImageIndex]: true }))}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-24 h-24 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
        
        {/* Zoom Icon Overlay */}
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ZoomIn className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((image, index) => {
            const thumbnailUrl = typeof image?.image === 'object' && image.image?.url
              ? image.image.url
              : '/placeholder-product.jpg'

            return (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={cn(
                  'aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105',
                  selectedImageIndex === index
                    ? 'border-orange-500 ring-2 ring-orange-200 dark:ring-orange-800'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                )}
              >
                {!imageError[index] ? (
                  <Image
                    src={thumbnailUrl}
                    alt={image?.alt || `${productTitle} ${index + 1}`}
                    width={120}
                    height={120}
                    className="w-full h-full object-cover"
                    onError={() => setImageError((prev) => ({ ...prev, [index]: true }))}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
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
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
