import { notFound } from 'next/navigation'
import { Metadata } from 'next'

import { ProductGallery } from '@/components/ecommerce/ProductGallery'
import { ProductDetail } from '@/components/ecommerce/ProductDetail'
import { RelatedProducts } from '@/components/ecommerce/RelatedProducts'
import { MOCK_PRODUCTS } from '@/lib/mockProducts'
import type { ProductVariant } from '@/payload-types'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params

  // 1. Fetch mock product by slug
  const mockProduct = MOCK_PRODUCTS.find((p) => p.slug === slug)
  if (!mockProduct) {
    notFound()
  }

  // 2. Map MockProduct to the structure expected by ProductDetail & ProductGallery
  // We'll stub out the minimal fields needed.
  const productData = {
    id: parseInt(mockProduct.id, 10),
    title: mockProduct.title,
    description: mockProduct.description,
    price: mockProduct.price,
    compareAtPrice: mockProduct.originalPrice || null,
    sku: `SKU-${mockProduct.id}`,
    status: 'active' as const,
    images: [
      {
        id: 'img-1',
        alt: mockProduct.title,
        image: {
          id: 1,
          url: mockProduct.imageUrl,
          alt: mockProduct.title,
        },
      },
    ],
    inventory: {
      trackQuantity: true,
      quantity: mockProduct.inStock ? 50 : 0,
      allowBackorder: false,
    },
    categories: [
      {
        id: 1,
        title: mockProduct.category,
        slug: mockProduct.categorySlug,
      },
    ],
  }

  // Mock variants if needed
  const variants: ProductVariant[] = []

  // Mock related products -> same category but not self, limit 4
  const transformedRelatedProducts = MOCK_PRODUCTS.filter(
    (p) => p.category === mockProduct.category && p.id !== mockProduct.id
  )
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: p.price,
      compareAtPrice: p.originalPrice,
      imageUrl: p.imageUrl,
      category: p.category,
      badge: p.badge,
      inStock: p.inStock,
    }))

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Main Product Section - Side by Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Gallery - Left Side */}
        <div className="lg:order-1">
          <ProductGallery
            images={productData.images.map((img) => ({
              image: img.image!,
              alt: img.alt || productData.title,
              id: img.id,
            }))}
            productTitle={productData.title}
          />
        </div>

        {/* Product Details - Right Side */}
        <div className="lg:order-2">
          <ProductDetail product={productData as any} variants={variants} />
        </div>
      </div>

      {/* Product Description */}
      <div className="mb-16">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Description</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            {productData.description}
          </p>
        </div>
      </div>

      {/* Related Products */}
      {transformedRelatedProducts.length > 0 && (
        <div className="mb-16">
          <RelatedProducts products={transformedRelatedProducts as any} />
        </div>
      )}
    </div>
  )
}

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  // Always use mock products to avoid Payload database crashes during build
  return MOCK_PRODUCTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  
  const productData = MOCK_PRODUCTS.find((p) => p.slug === slug)

  if (!productData) {
    return {
      title: 'Product Not Found - Afrimall',
      description: 'The requested product could not be found.',
    }
  }

  const title = productData.title
  const description = productData.description
  const imageUrl = productData.imageUrl

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
}
