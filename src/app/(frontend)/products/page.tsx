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

export default async function ProductsPage({ searchParams }: Props) {
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
        slug: cat.slug,
        image: cat.image
          ? {
              url: `/api/media/file/${cat.image.filename}`,
              alt: cat.image.alt || '',
            }
          : null,
      })) || [],
    tags:
      product.tags?.map((tag: any) => ({
        id: tag.id,
        tag: tag.tag,
      })) || [],
    inventory: {
      trackQuantity: product.inventory?.trackQuantity || false,
      quantity: product.inventory?.quantity || 0,
      allowBackorder: product.inventory?.allowBackorder || false,
      lowStockThreshold: product.inventory?.lowStockThreshold || 5,
    },
    weight: product.weight,
    dimensions: product.dimensions,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }))

  // Transform pagination
  const pagination = {
    totalDocs: products.totalDocs,
    totalPages: products.totalPages,
    page: products.page,
    limit: products.limit,
    hasNextPage: products.hasNextPage,
    hasPrevPage: products.hasPrevPage,
    nextPage: products.nextPage,
    prevPage: products.prevPage,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-6">
          <Logo className="h-16 w-16" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {search ? `Search results for "${search}"` : 'All Products'}
        </h1>
        {category && (
          <p className="text-gray-600 dark:text-gray-300">
            Showing products in category:{' '}
            {categories.docs.find((cat) => cat.id.toString() === category)?.title}
          </p>
        )}
        {search && (
          <p className="text-gray-600 dark:text-gray-300">
            Found {products.totalDocs} product{products.totalDocs !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Category Filter */}
            <CategoryFilter
              categories={categories.docs as any}
              selectedCategory={category}
              searchQuery={search}
            />

            {/* Product Filters */}
            <ProductFilters
              searchQuery={search}
              selectedCategory={category}
              currentSort={sort}
              currentOrder={order}
              currentMinPrice={minPrice}
              currentMaxPrice={maxPrice}
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <ProductGrid
            initialProducts={transformedProducts}
            initialPagination={pagination as any}
            searchQuery={search}
            categoryFilter={category}
          />
        </div>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Products - AfriMall',
  description:
    'Browse our collection of authentic African products, from traditional crafts to modern fashion and home decor.',
}
