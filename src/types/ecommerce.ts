// Base entity types
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

// User and Customer types
export interface User extends BaseEntity {
  email: string
  firstName?: string
  lastName?: string
  role: 'admin' | 'editor' | 'customer'
  status: 'active' | 'inactive' | 'suspended'
}

export interface Customer extends BaseEntity {
  email: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: string
  preferences: {
    newsletter: boolean
    marketing: boolean
    language: string
    currency: string
  }
  addresses: Address[]
  defaultShippingAddress?: string
  defaultBillingAddress?: string
  status: 'active' | 'inactive' | 'suspended'
}

export interface Address {
  id: string
  type: 'shipping' | 'billing' | 'both'
  firstName: string
  lastName: string
  company?: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  isDefault: boolean
}

// Product types
export interface Product extends BaseEntity {
  title: string
  slug: string
  description: string
  shortDescription?: string
  sku: string
  price: number
  compareAtPrice?: number
  costPrice?: number
  currency: string
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  sortOrder: number

  // Inventory
  inventoryQuantity: number
  lowStockThreshold: number
  trackInventory: boolean
  allowBackorders: boolean

  // Categories and relationships
  categories: string[] // Category IDs
  tags: string[]
  brand?: string

  // Media
  images: ProductImage[]
  mainImage?: string

  // Variants
  hasVariants: boolean
  variants: ProductVariant[]

  // SEO
  seo: {
    title?: string
    description?: string
    keywords?: string[]
    canonicalUrl?: string
  }

  // Shipping
  weight: number
  dimensions: {
    length: number
    width: number
    height: number
  }
  requiresShipping: boolean
  shippingClass?: string
}

export interface ProductImage {
  id: string
  url: string
  alt: string
  caption?: string
  sortOrder: number
}

export interface ProductVariant extends BaseEntity {
  productId: string
  sku: string
  title: string
  price: number
  compareAtPrice?: number
  costPrice?: number
  inventoryQuantity: number
  lowStockThreshold: number
  trackInventory: boolean
  allowBackorders: boolean

  // Variant options
  options: {
    [key: string]: string // e.g., { color: 'red', size: 'large' }
  }

  // Media
  image?: string

  // Shipping
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
}

// Category types
export interface Category extends BaseEntity {
  title: string
  slug: string
  description?: string
  parent?: string // Parent category ID
  image?: string
  status: 'active' | 'inactive'
  featured: boolean
  sortOrder: number
  breadcrumbPath: string

  // SEO
  seo: {
    title?: string
    description?: string
    keywords?: string[]
  }

  // Navigation
  showInNavigation: boolean
  navigationOrder: number
}

// Cart types
export interface Cart extends BaseEntity {
  customerId?: string
  sessionId?: string
  items: CartItem[]
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  total: number
  currency: string
  itemCount: number

  // Coupons and discounts
  appliedCoupons: AppliedCoupon[]

  // Shipping
  shippingAddress?: Address
  shippingMethod?: ShippingMethod

  // Billing
  billingAddress?: Address

  // Status
  status: 'active' | 'abandoned' | 'converted'
  expiresAt: string
  lastActivityAt: string
}

export interface CartItem {
  id: string
  productId: string
  variantId?: string
  product: {
    id: string
    title: string
    slug: string
    mainImage?: string
  }
  variant?: {
    id: string
    title: string
    options: Record<string, string>
  }
  quantity: number
  unitPrice: number
  totalPrice: number
  addedAt: string
}

export interface AppliedCoupon {
  code: string
  discountAmount: number
  discountType: 'percentage' | 'fixed'
  description: string
}

export interface ShippingMethod {
  id: string
  name: string
  description?: string
  price: number
  estimatedDays: string
  carrier: string
}

// Order types
export interface Order extends BaseEntity {
  orderNumber: string
  customerId: string
  customer: Customer

  // Order details
  items: OrderItem[]
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  total: number
  currency: string

  // Status
  status: OrderStatus
  paymentStatus: PaymentStatus
  fulfillmentStatus: FulfillmentStatus

  // Payment
  paymentMethod: PaymentMethod
  paymentIntentId?: string
  paidAt?: string

  // Shipping
  shippingAddress: Address
  billingAddress: Address
  shippingMethod: ShippingMethod
  trackingNumber?: string
  shippedAt?: string

  // Customer notes
  customerNotes?: string
  internalNotes?: string

  // Timestamps
  placedAt: string
  processedAt?: string
  fulfilledAt?: string
  cancelledAt?: string

  // Cancellation
  cancellationReason?: string
  refundAmount?: number
  refundedAt?: string
}

export interface OrderItem {
  id: string
  productId: string
  variantId?: string
  product: {
    id: string
    title: string
    sku: string
    mainImage?: string
  }
  variant?: {
    id: string
    title: string
    options: Record<string, string>
  }
  quantity: number
  unitPrice: number
  totalPrice: number
  taxAmount: number
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'

export type FulfillmentStatus = 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'returned'

export interface PaymentMethod {
  type: 'stripe' | 'paypal' | 'mobile_money' | 'bank_transfer'
  details: Record<string, any>
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
}

// Search and Filter types
export interface ProductFilters {
  categories?: string[]
  priceRange?: {
    min: number
    max: number
  }
  brands?: string[]
  tags?: string[]
  inStock?: boolean
  featured?: boolean
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'name_asc' | 'name_desc'
}

export interface SearchParams {
  query: string
  filters?: ProductFilters
  page?: number
  limit?: number
}

// API Response types
export interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  code?: string
  details?: any
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// Form types
export interface LoginFormData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phone?: string
  newsletter?: boolean
  termsAccepted: boolean
}

export interface CheckoutFormData {
  contactInfo: {
    email: string
    phone: string
  }
  shippingAddress: Address
  billingAddress: Address
  shippingMethod: string
  paymentMethod: PaymentMethod
  customerNotes?: string
  termsAccepted: boolean
}

// Utility types
export type Currency = 'USD' | 'EUR' | 'GBP' | 'ZAR' | 'KES' | 'UGX' | 'TZS' | 'GHS' | 'NGN'

export type Language = 'en' | 'fr' | 'sw' | 'ar'

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}
