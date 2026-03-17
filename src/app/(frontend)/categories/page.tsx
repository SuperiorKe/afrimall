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

// Force dynamic rendering to ensure real-time data updates
export const dynamic = 'force-dynamic'

const MOCK_CATEGORIES = [
  {
    id: 1,
    name: 'Electronics',
    slug: 'electronics',
    description: 'Phones, laptops, gadgets and accessories',
    productCount: 24,
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop',
  },
  {
    id: 2,
    name: 'Fashion & Apparel',
    slug: 'fashion',
    description: 'Clothing, shoes and accessories from African designers',
    productCount: 38,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop',
  },
  {
    id: 3,
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Furniture, cookware and home décor',
    productCount: 19,
    imageUrl: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=800&h=600&fit=crop',
  },
  {
    id: 4,
    name: 'Beauty & Health',
    slug: 'beauty-health',
    description: 'Skincare, haircare and wellness products',
    productCount: 31,
    imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800&h=600&fit=crop',
  },
  {
    id: 5,
    name: 'Food & Groceries',
    slug: 'food-groceries',
    description: 'Authentic African foods, spices and beverages',
    productCount: 27,
    imageUrl: 'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?w=800&h=600&fit=crop',
  },
  {
    id: 6,
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Fitness gear and outdoor equipment',
    productCount: 15,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop',
  },
  {
    id: 7,
    name: 'Art & Crafts',
    slug: 'art-crafts',
    description: 'Handmade crafts, paintings and sculptures',
    productCount: 42,
    imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&h=600&fit=crop',
  },
  {
    id: 8,
    name: 'Books & Education',
    slug: 'books-education',
    description: 'African literature, textbooks and learning materials',
    productCount: 18,
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop',
  },
]

async function getCategories() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return {
      categoriesWithCounts: MOCK_CATEGORIES.map((category) => ({
        id: category.id,
        title: category.name,
        description: category.description,
        image: {
          url: category.imageUrl,
          alt: category.name,
        } as Media,
        productCount: category.productCount,
        featured: false,
      })),
      isDemo: true,
    }
  }

  try {
    const payload = await getPayload({ config: configPromise })

    // Fetch all active categories with real-time data
    const categories = await payload.find({
      collection: 'categories',
      where: { status: { equals: 'active' } },
      sort: 'sortOrder',
      depth: 1, // Populate relationships for better performance
    })

    console.log(`[Categories Page] Fetched ${categories.docs.length} active categories`)

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

          console.log(`[Categories Page] Category "${category.title}" has ${productCount.totalDocs} products`)
          return {
            ...category,
            productCount: productCount.totalDocs,
          }
        } catch (error) {
          console.warn(`[Categories Page] Failed to get product count for category ${category.id}:`, error)
          return {
            ...category,
            productCount: 0,
          }
        }
      }),
    )

    return {
      categoriesWithCounts,
      isDemo: false,
    }
  } catch (error) {
    console.error('[Categories Page] Failed to load categories:', error)
    return {
      categoriesWithCounts: MOCK_CATEGORIES.map((category) => ({
        id: category.id,
        title: category.name,
        description: category.description,
        image: {
          url: category.imageUrl,
          alt: category.name,
        } as Media,
        productCount: category.productCount,
        featured: false,
      })),
      isDemo: true,
    }
  }
}

export default async function CategoriesPage() {
  const { categoriesWithCounts, isDemo } = await getCategories()

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
    </div>
  )
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
