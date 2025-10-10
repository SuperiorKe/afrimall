import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { ProductGrid } from '@/components/ecommerce/ProductGrid'
import { CategoryFilter } from '@/components/ecommerce/CategoryFilter'
import { ProductFilters } from '@/components/ecommerce/ProductFilters'

import type { Metadata } from 'next'
import { Logo } from '@/components/Logo/Logo'

type SearchParams = {
  category?: string
  search?: string
  sort?: string
  order?: string
  page?: string
  minPrice?: string
  maxPrice?: string
}

type Props = {
  searchParams: Promise<SearchParams>
}

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

export default async function ProductsPage({ searchParams }: Props) {
  try {
    const params = await searchParams
    const {
      category,
      search,
      sort = 'createdAt',
      order = 'desc',
      page = '1',
      minPrice,
      maxPrice,
    } = params

    const payload = await getPayload({ config: configPromise })

    // Build where clause
    const where: Record<string, unknown> = {
      status: { equals: 'active' },
    }

    if (category) {
      where.categories = { in: [category] }
    }

    if (search) {
      where.or = [
        { title: { contains: search } },
        { description: { contains: search } },
        { 'tags.tag': { contains: search } },
      ]
    }

    if (minPrice || maxPrice) {
      ;(where as any).price = {}
      if (minPrice) (where as any).price.greater_than_equal = parseFloat(minPrice)
      if (maxPrice) (where as any).price.less_than_equal = parseFloat(maxPrice)
    }

    // Fetch products
    const products = await payload.find({
      collection: 'products',
      where: where as any,
      limit: 12,
      page: parseInt(page),
      sort: `${order === 'desc' ? '-' : ''}${sort}`,
    })

    // Fetch categories for filter
    const categories = await payload.find({
      collection: 'categories',
      where: { status: { equals: 'active' } },
      sort: 'sortOrder',
    })

    // Transform products for initial render
    const transformedProducts = products.docs.map((product: any) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      sku: product.sku,
      status: product.status,
      featured: product.featured,
      slug: product.slug,
      images:
        product.images?.map((img: any) => ({
          id: img.id,
          url: img.image?.filename ? `/api/media/file/${img.image.filename}` : null,
          alt: img.alt || img.image?.alt || '',
          width: img.image?.width || 800,
          height: img.image?.height || 600,
        })) || [],
      categories:
        product.categories?.map((cat: any) => ({
          id: cat.id,
          title: cat.title,
        })) || [],
    }))

    // Transform categories for CategoryFilter component
    const transformedCategories = categories.docs.map((cat: any) => ({
      id: cat.id.toString(), // Convert number to string
      title: cat.title,
      slug: cat.slug,
      image: cat.image
        ? {
            url: `/api/media/file/${cat.image.filename}`,
            alt: cat.image.alt || '',
          }
        : null,
      description: cat.description,
    }))

    // Transform pagination info
    const paginationInfo = {
      totalDocs: products.totalDocs,
      totalPages: products.totalPages,
      page: products.page || 1,
      limit: products.limit,
      hasNextPage: products.hasNextPage,
      hasPrevPage: products.hasPrevPage,
      nextPage: products.nextPage || undefined,
      prevPage: products.prevPage || undefined,
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <Logo className="h-16 w-16 mx-auto mb-6" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Discover African Treasures
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Explore our curated collection of authentic African products, from handcrafted
                jewelry to traditional textiles and contemporary art.
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Products */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                <CategoryFilter categories={transformedCategories} />
                <ProductFilters />
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <ProductGrid
                initialProducts={transformedProducts}
                initialPagination={paginationInfo}
                searchQuery={search}
                categoryFilter={category}
                enableInfiniteScroll={false}
              />
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.warn('Failed to load products during build:', error)
    // Return a fallback UI during build
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <Logo className="h-16 w-16 mx-auto mb-6" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Discover African Treasures
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Explore our curated collection of authentic African products.
              </p>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">Products will be loaded at runtime.</p>
          </div>
        </div>
      </div>
    )
  }
}

export const metadata: Metadata = {
  title: 'Products - AfriMall',
  description:
    'Browse our collection of authentic African products, from traditional crafts to modern fashion and home decor.',
}
