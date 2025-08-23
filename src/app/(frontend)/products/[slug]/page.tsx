import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Metadata } from 'next'
import type { Media } from '@/payload-types'

import { ProductGallery } from '@/components/ecommerce/ProductGallery'
import { ProductDetail } from '@/components/ecommerce/ProductDetail'
import { RelatedProducts } from '@/components/ecommerce/RelatedProducts'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  try {
    // Fetch product by slug instead of ID
    const product = await payload.find({
      collection: 'products',
      where: {
        and: [{ slug: { equals: slug } }, { status: { equals: 'active' } }],
      },
      limit: 1,
    })

    if (!product || product.docs.length === 0) {
      notFound()
    }

    const productData = product.docs[0]

    // Fetch product variants
    const variants = await payload.find({
      collection: 'product-variants',
      where: {
        product: { equals: productData.id },
        status: { equals: 'active' },
      },
    })

    // Fetch related products (same category, excluding current product)
    const relatedProducts = await payload.find({
      collection: 'products',
      where: {
        and: [
          { status: { equals: 'active' } },
          { id: { not_equals: productData.id } },
          {
            categories: {
              in:
                productData.categories?.map((cat) => (typeof cat === 'number' ? cat : cat.id)) ||
                [],
            },
          },
        ],
      },
      limit: 4,
    })

    return (
      <div className="container mx-auto px-4 py-8">
        {/* Main Product Section - Side by Side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Gallery - Left Side */}
          <div className="lg:order-1">
            <ProductGallery images={productData.images || []} productTitle={productData.title} />
          </div>

          {/* Product Details - Right Side */}
          <div className="lg:order-2">
            <ProductDetail product={productData} variants={variants.docs} />
          </div>
        </div>

        {/* Product Description */}
        <div className="mb-16">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Description</h2>
            {productData.fullDescription ? (
              <div
                className="prose prose-gray dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: productData.fullDescription }}
              />
            ) : (
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                {productData.description}
              </p>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.docs.length > 0 && (
          <div className="mb-16">
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
    slug: product.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  try {
    const product = await payload.find({
      collection: 'products',
      where: {
        and: [{ slug: { equals: slug } }, { status: { equals: 'active' } }],
      },
      limit: 1,
    })

    if (!product || product.docs.length === 0) {
      return {
        title: 'Product Not Found - Afrimall',
        description: 'The requested product could not be found.',
      }
    }

    const productData = product.docs[0]
    const title = productData.seo?.title || productData.title
    const description = productData.seo?.description || productData.description
    const image = productData.images?.[0]?.image

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
