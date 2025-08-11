import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { ProductGrid } from '@/components/ecommerce/ProductGrid'
import { CategoryFilter } from '@/components/ecommerce/CategoryFilter'
import { ProductFilters } from '@/components/ecommerce/ProductFilters'
import { generateMeta } from '@/utilities/generateMeta'
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
  const where: any = {
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
    where.price = {}
    if (minPrice) where.price.greater_than_equal = parseFloat(minPrice)
    if (maxPrice) where.price.less_than_equal = parseFloat(maxPrice)
  }

  // Fetch products
  const products = await payload.find({
    collection: 'products',
    where,
    limit: 12,
    page: parseInt(page),
    sort: `${order === 'desc' ? '-' : ''}${sort}`,
    populate: {
      categories: true,
      images: true,
    },
  })

  // Fetch categories for filter
  const categories = await payload.find({
    collection: 'categories',
    where: { status: { equals: 'active' } },
    sort: 'sortOrder',
    populate: {
      image: true,
    },
  })

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
            {categories.docs.find((cat) => cat.id === category)?.title}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            <CategoryFilter categories={categories.docs} selectedCategory={category} />
            <ProductFilters minPrice={minPrice} maxPrice={maxPrice} sort={sort} order={order} />
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <div className="mb-6 flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Showing {products.docs.length} of {products.totalDocs} products
            </p>
          </div>

          <ProductGrid products={products.docs} pagination={products} />
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const { search, category } = params

  let title = 'Products - Afrimall'
  let description = 'Discover amazing products from African entrepreneurs and businesses.'

  if (search) {
    title = `Search: ${search} - Afrimall`
    description = `Search results for "${search}" on Afrimall marketplace.`
  } else if (category) {
    // You could fetch the category name here for better SEO
    title = `Category Products - Afrimall`
    description = `Browse products in this category on Afrimall marketplace.`
  }

  return {
    title,
    description,
  }
}
