import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { Metadata } from 'next'
import { Logo } from '@/components/Logo/Logo'
import Image from 'next/image'
import type { Media } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Categories - Afrimall',
  description:
    'Browse all product categories on Afrimall marketplace. Find African art, crafts, jewelry, textiles, and more.',
}

export default async function CategoriesPage() {
  try {
    const payload = await getPayload({ config: configPromise })

    // Fetch all active categories
    const categories = await payload.find({
      collection: 'categories',
      where: { status: { equals: 'active' } },
      sort: 'sortOrder',
    })

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.docs.map(async (category) => {
        try {
          const productCount = await payload.count({
            collection: 'products',
            where: {
              and: [{ status: { equals: 'active' } }, { categories: { in: [category.id] } }],
            },
          })

          return {
            ...category,
            productCount: productCount.totalDocs,
          }
        } catch (error) {
          console.warn(`Failed to get product count for category ${category.id}:`, error)
          return {
            ...category,
            productCount: 0,
          }
        }
      }),
    )

    // Separate featured categories
    const featuredCategories = categoriesWithCounts.filter((cat) => cat.featured)

    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Logo className="h-16 w-16" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Browse Categories
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore our curated collection of African products across different categories. Discover
            authentic crafts, jewelry, textiles, and more from talented African entrepreneurs.
          </p>
        </div>

        {/* Featured Categories */}
        {featuredCategories.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
              Featured Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCategories.map((category) => (
                <CategoryCard key={category.id} category={category} featured />
              ))}
            </div>
          </div>
        )}

        {/* All Categories */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
            All Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoriesWithCounts.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>

        {/* Empty State */}
        {categories.docs.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No categories found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Categories will appear here once they are added.
            </p>
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.warn('Failed to load categories during build:', error)
    // Return a fallback UI during build
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Logo className="h-16 w-16" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Browse Categories
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore our curated collection of African products across different categories.
          </p>
        </div>
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400">Categories will be loaded at runtime.</p>
        </div>
      </div>
    )
  }
}

// Category Card Component
function CategoryCard({
  category,
  featured = false,
}: {
  category: {
    id: number
    title: string
    description?: string | null
    image?: number | Media | null
    productCount: number
    featured?: boolean | null
  }
  featured?: boolean
}) {
  // Helper function to get image URL
  const getImageUrl = (image: number | Media | null | undefined): string | null => {
    if (!image) return null
    if (typeof image === 'number') return null // ID reference, not populated
    if (image.url) return image.url
    if (image.filename) return `/api/media/file/${image.filename}`
    return null
  }

  const imageUrl = getImageUrl(category.image)

  return (
    <Link
      href={`/products?category=${category.id}`}
      className={`group block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${
        featured ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
    >
      {/* Category Image */}
      <div className={`relative ${featured ? 'h-48' : 'h-32'} bg-gray-200 dark:bg-gray-700`}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={
              category.image && typeof category.image === 'object'
                ? category.image.alt || category.title
                : category.title
            }
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
        )}

        {featured && (
          <div className="absolute top-2 right-2">
            <span className="bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Category Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {category.title}
        </h3>

        {category.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
            {category.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
          </span>

          <svg
            className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
