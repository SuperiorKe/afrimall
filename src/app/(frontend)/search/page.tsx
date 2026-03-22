import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import { CardPostData } from '@/components/Card'
import { MOCK_PRODUCTS } from '@/lib/mockProducts'

type Args = {
  searchParams: Promise<{
    q: string
  }>
}

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

export default async function Page({ searchParams: searchParamsPromise }: Args) {
  try {
    const { q: query } = await searchParamsPromise

    // Filter MOCK_PRODUCTS based on the search query
    const lowerQuery = query ? query.toLowerCase() : ''
    const filteredProducts = MOCK_PRODUCTS.filter((product) => {
      if (!lowerQuery) return true
      return (
        product.title.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery)
      )
    })

    // Map MOCK_PRODUCTS to the format expected by CollectionArchive and Card components
    const posts: CardPostData[] = filteredProducts.map((p) => ({
      title: p.title,
      slug: p.slug,
      categories: [
        {
          id: 1,
          title: p.category,
        },
      ],
      meta: {
        title: p.title,
        description: p.description,
        image: {
          id: 1,
          url: p.imageUrl,
          alt: p.title,
        },
      },
    })) as any // Type assertion to bypass strict CardPostData mismatch in case there are missing Payload properties

    return (
      <div className="pt-24 pb-24">
        <PageClient />
        <div className="container mb-16">
          <div className="prose dark:prose-invert max-w-none text-center">
            <h1 className="mb-8 lg:mb-16">Search</h1>

            <div className="max-w-[50rem] mx-auto">
              <Search />
            </div>
          </div>
        </div>

        {posts.length > 0 ? (
          <CollectionArchive posts={posts} />
        ) : (
          <div className="container">
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400">
                No results found for &quot;{query}&quot;. Try exploring other categories.
              </p>
            </div>
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.warn('Failed to load search results:', error)
    // Fallback UI
    return (
      <div className="pt-24 pb-24">
        <PageClient />
        <div className="container mb-16">
          <div className="prose dark:prose-invert max-w-none text-center">
            <h1 className="mb-8 lg:mb-16">Search</h1>

            <div className="max-w-[50rem] mx-auto">
              <Search />
            </div>
          </div>
        </div>
        <div className="container">
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">
              An error occurred while searching. Please try again later.
            </p>
          </div>
        </div>
      </div>
    )
  }
}

export function generateMetadata(): Metadata {
  return {
    title: `Search | Afrimall`,
  }
}
