import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { ProductDetail } from '@/components/ecommerce/ProductDetail'
import { ProductGallery } from '@/components/ecommerce/ProductGallery'
import { RelatedProducts } from '@/components/ecommerce/RelatedProducts'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { Media } from '@/payload-types'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })

  try {
    // Fetch product
    const product = await payload.findByID({
      collection: 'products',
      id,
    })

    if (!product || product.status !== 'active') {
      notFound()
    }

    // Fetch product variants
    const variants = await payload.find({
      collection: 'product-variants',
      where: {
        product: { equals: id },
        status: { equals: 'active' },
      },
    })

    // Fetch related products (same category, excluding current product)
    const relatedProducts = await payload.find({
      collection: 'products',
      where: {
        and: [
          { status: { equals: 'active' } },
          { id: { not_equals: id } },
          {
            categories: {
              in: product.categories?.map((cat) => (typeof cat === 'number' ? cat : cat.id)) || [],
            },
          },
        ],
      },
      limit: 4,
    })

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Gallery */}
          <div>
            <ProductGallery images={product.images || []} productTitle={product.title} />
          </div>

          {/* Product Details */}
          <div>
            <ProductDetail product={product} variants={variants.docs} />
          </div>
        </div>

        {/* Product Description */}
        <div className="mb-12">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
            {product.fullDescription ? (
              <div
                className="prose prose-gray dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: product.fullDescription }}
              />
            ) : (
              <p className="text-gray-600 dark:text-gray-300">{product.description}</p>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.docs.length > 0 && (
          <div className="mb-12">
            <RelatedProducts products={relatedProducts.docs} />
          </div>
        )}
      </div>
    )
  } catch (_error) {
    console.error('Error fetching product:', _error)
    notFound()
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })

  const products = await payload.find({
    collection: 'products',
    where: { status: { equals: 'active' } },
    limit: 1000,
    pagination: false,
  })

  return products.docs.map((product) => ({
    id: product.id,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })

  try {
    const product = await payload.findByID({
      collection: 'products',
      id,
    })

    if (!product) {
      return {
        title: 'Product Not Found - Afrimall',
        description: 'The requested product could not be found.',
      }
    }

    const title = product.seo?.title || product.title
    const description = product.seo?.description || product.description
    const image = product.images?.[0]?.image

    // Helper function to get image URL
    const getImageUrl = (image: number | Media | null | undefined): string | null => {
      if (!image) return null
      if (typeof image === 'number') return null // ID reference, not populated
      if (image.filename) return `/api/media/file/${image.filename}`
      return null
    }

    const imageUrl = getImageUrl(image)

    return {
      title: `${title} - Afrimall`,
      description,
      openGraph: {
        title,
        description,
        images: imageUrl ? [imageUrl] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    }
  } catch (error) {
    return {
      title: 'Product Not Found - Afrimall',
      description: 'The requested product could not be found.',
    }
  }
}
