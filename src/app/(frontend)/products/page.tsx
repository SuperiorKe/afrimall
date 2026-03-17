import type { Metadata } from 'next'
import { ProductsClientPage } from './ProductsClientPage'
import { MOCK_PRODUCTS } from '@/lib/mockProducts'

export const metadata: Metadata = {
  title: 'Products | Afrimall',
  description: 'Shop authentic African products — fashion, electronics, beauty, food and more.',
}

async function getProducts() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return { products: MOCK_PRODUCTS, isDemo: true }
  }

  try {
    // When DB is restored, replace this block with your Payload fetch:
    // const { getPayload } = await import('payload')
    // const payload = await getPayload({ config })
    // const result = await payload.find({ collection: 'products', limit: 50 })
    // return { products: result.docs, isDemo: false }
    throw new Error('Database not configured')
  } catch {
    return { products: MOCK_PRODUCTS, isDemo: true }
  }
}

export default async function ProductsPage() {
  const { products, isDemo } = await getProducts()
  return <ProductsClientPage products={products} isDemo={isDemo} />
}
