/**
 * Utility functions for transforming product data from Payload CMS format
 * to the standardized format used by frontend components
 */

export interface TransformedProduct {
  id: string
  title: string
  description: string
  price: number
  compareAtPrice?: number | null
  sku: string
  status: 'draft' | 'active' | 'archived'
  featured?: boolean | null
  slug: string
  images: {
    id: string
    url: string | null
    alt: string
    width: number
    height: number
  }[]
  categories?:
    | {
        id: string
        title: string
        slug?: string | null
      }[]
    | null
  tags?:
    | {
        id: string
        tag: string
      }[]
    | null
  inventory?: {
    trackQuantity?: boolean | null
    quantity?: number | null
    allowBackorder?: boolean | null
    lowStockThreshold?: number | null
  } | null
  weight?: number | null
  dimensions?: {
    length?: number | null
    width?: number | null
    height?: number | null
  } | null
  createdAt?: string
  updatedAt?: string
}

/**
 * Transform a raw Payload product to the standardized format
 */
export function transformProduct(product: any): TransformedProduct {
  return {
    id: product.id.toString(),
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
        width: img.image?.width || 400,
        height: img.image?.height || 400,
      })) || [],
    categories:
      product.categories?.map((cat: any) => ({
        id: cat.id.toString(),
        title: cat.title,
        slug: cat.slug,
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
  }
}

/**
 * Transform an array of raw Payload products to the standardized format
 */
export function transformProducts(products: any[]): TransformedProduct[] {
  return products.map(transformProduct)
}

/**
 * Get the main image URL from a product
 */
export function getMainImageUrl(product: TransformedProduct): string | null {
  return product.images?.[0]?.url || null
}

/**
 * Get the main image alt text from a product
 */
export function getMainImageAlt(product: TransformedProduct): string {
  return product.images?.[0]?.alt || product.title
}

/**
 * Check if a product is out of stock
 */
export function isProductOutOfStock(product: TransformedProduct): boolean {
  return (
    Boolean(product.inventory?.trackQuantity) &&
    !Boolean(product.inventory?.allowBackorder) &&
    (product.inventory?.quantity || 0) <= 0
  )
}

/**
 * Get stock status text for a product
 */
export function getStockStatus(product: TransformedProduct): string {
  if (!product.inventory?.trackQuantity) {
    return 'In stock'
  }

  const quantity = product.inventory.quantity || 0

  if (quantity > 0) {
    return `${quantity} in stock`
  } else if (product.inventory.allowBackorder) {
    return 'Backorder available'
  } else {
    return 'Out of stock'
  }
}
