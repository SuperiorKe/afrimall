// src/lib/mockProducts.ts
// Demo mode fallback data — used when the database is unavailable

export type MockProduct = {
  id: string
  title: string
  slug: string
  price: number
  originalPrice?: number
  currency: string
  category: string
  categorySlug: string
  description: string
  rating: number
  reviewCount: number
  inStock: boolean
  badge?: 'New' | 'Sale' | 'Popular' | 'Local'
  imageUrl: string
  seller: string
  location: string
}

export const MOCK_CATEGORIES = [
  { label: 'All Products', value: 'all' },
  { label: 'Fashion & Apparel', value: 'fashion' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Home & Kitchen', value: 'home' },
  { label: 'Beauty & Health', value: 'beauty' },
  { label: 'Food & Groceries', value: 'food' },
  { label: 'Sports & Outdoors', value: 'sports' },
]

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: '1',
    title: 'Ankara Print Wrap Dress',
    slug: 'ankara-wrap-dress',
    price: 2800,
    originalPrice: 3500,
    currency: 'KES',
    category: 'Fashion & Apparel',
    categorySlug: 'fashion',
    description:
      'Vibrant hand-crafted Ankara print wrap dress. Perfect for any occasion, made by local Nairobi artisans.',
    rating: 4.8,
    reviewCount: 124,
    inStock: true,
    badge: 'Popular',
    imageUrl:
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop',
    seller: 'Zawadi Designs',
    location: 'Nairobi, KE',
  },
  {
    id: '2',
    title: "Men's Safari Linen Shirt",
    slug: 'safari-linen-shirt',
    price: 1950,
    currency: 'KES',
    category: 'Fashion & Apparel',
    categorySlug: 'fashion',
    description:
      'Lightweight breathable linen shirt designed for the African climate. Available in earth tones.',
    rating: 4.6,
    reviewCount: 89,
    inStock: true,
    badge: 'Local',
    imageUrl:
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop',
    seller: 'Serengeti Threads',
    location: 'Nairobi, KE',
  },
  {
    id: '3',
    title: 'Maasai Beaded Sandals',
    slug: 'maasai-beaded-sandals',
    price: 1200,
    originalPrice: 1800,
    currency: 'KES',
    category: 'Fashion & Apparel',
    categorySlug: 'fashion',
    description:
      'Handcrafted leather sandals adorned with authentic Maasai beadwork. Sizes 36–45.',
    rating: 4.9,
    reviewCount: 203,
    inStock: true,
    badge: 'Sale',
    imageUrl:
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop',
    seller: 'Mara Crafts Co.',
    location: 'Kajiado, KE',
  },
  {
    id: '4',
    title: 'Solar Portable Power Bank 20,000mAh',
    slug: 'solar-power-bank-20000',
    price: 3400,
    currency: 'KES',
    category: 'Electronics',
    categorySlug: 'electronics',
    description:
      'Dual solar panels + USB-C. Charges 3 devices simultaneously. Built for off-grid African lifestyles.',
    rating: 4.7,
    reviewCount: 312,
    inStock: true,
    badge: 'Popular',
    imageUrl:
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop',
    seller: 'Jua Tech',
    location: 'Nairobi, KE',
  },
  {
    id: '5',
    title: 'Wireless Earbuds Pro (Noise Cancelling)',
    slug: 'wireless-earbuds-pro',
    price: 4500,
    originalPrice: 6000,
    currency: 'KES',
    category: 'Electronics',
    categorySlug: 'electronics',
    description:
      'Active noise cancellation, 30hr battery life, IPX5 water resistant. Local warranty included.',
    rating: 4.5,
    reviewCount: 178,
    inStock: true,
    badge: 'Sale',
    imageUrl:
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
    seller: 'TechHub Kenya',
    location: 'Nairobi, KE',
  },
  {
    id: '6',
    title: 'Smart LED Bulb (M-Pesa Compatible)',
    slug: 'smart-led-bulb-mpesa',
    price: 850,
    currency: 'KES',
    category: 'Electronics',
    categorySlug: 'electronics',
    description:
      'App-controlled smart bulb. Schedule, dim, and change colors. Pay via M-Pesa, no credit card needed.',
    rating: 4.4,
    reviewCount: 56,
    inStock: true,
    badge: 'New',
    imageUrl:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    seller: 'SmartHome Africa',
    location: 'Mombasa, KE',
  },
  {
    id: '7',
    title: 'Kiondo Woven Storage Basket Set (3pc)',
    slug: 'kiondo-basket-set-3pc',
    price: 1650,
    currency: 'KES',
    category: 'Home & Kitchen',
    categorySlug: 'home',
    description:
      'Traditional Kenyan Kiondo baskets, hand-woven from sisal. Nesting set of 3 — small, medium, large.',
    rating: 4.9,
    reviewCount: 445,
    inStock: true,
    badge: 'Popular',
    imageUrl:
      'https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=400&h=400&fit=crop',
    seller: 'Heritage Weave',
    location: 'Kitui, KE',
  },
  {
    id: '8',
    title: 'Non-Stick Sufuria Set (Aluminium)',
    slug: 'nonstick-sufuria-set',
    price: 2200,
    originalPrice: 2800,
    currency: 'KES',
    category: 'Home & Kitchen',
    categorySlug: 'home',
    description:
      '5-piece non-stick cookware set. Works on gas, electric, and jiko stoves. Easy clean coating.',
    rating: 4.3,
    reviewCount: 91,
    inStock: true,
    badge: 'Sale',
    imageUrl:
      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&h=400&fit=crop',
    seller: 'Kitchen Essentials KE',
    location: 'Nairobi, KE',
  },
  {
    id: '9',
    title: 'Shea Butter & Baobab Oil Moisturiser',
    slug: 'shea-baobab-moisturiser',
    price: 750,
    currency: 'KES',
    category: 'Beauty & Health',
    categorySlug: 'beauty',
    description:
      'All-natural African skincare. Cold-pressed baobab oil blended with unrefined shea butter. 200ml.',
    rating: 4.8,
    reviewCount: 267,
    inStock: true,
    badge: 'Local',
    imageUrl:
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop',
    seller: 'Afya Naturals',
    location: 'Nakuru, KE',
  },
  {
    id: '10',
    title: 'Black Soap (Dudu Osun) 6-Pack',
    slug: 'black-soap-dudu-osun-6pack',
    price: 600,
    currency: 'KES',
    category: 'Beauty & Health',
    categorySlug: 'beauty',
    description:
      'Authentic African black soap with honey and aloe vera. Anti-bacterial, suitable for all skin types.',
    rating: 4.7,
    reviewCount: 189,
    inStock: true,
    badge: 'Popular',
    imageUrl:
      'https://images.unsplash.com/photo-1601612628452-9e99ced43524?w=400&h=400&fit=crop',
    seller: 'Afya Naturals',
    location: 'Nakuru, KE',
  },
  {
    id: '11',
    title: 'Single-Origin Kenyan AA Coffee (500g)',
    slug: 'kenyan-aa-coffee-500g',
    price: 980,
    currency: 'KES',
    category: 'Food & Groceries',
    categorySlug: 'food',
    description:
      'Direct-trade specialty coffee from Kirinyaga County. Medium roast with bright acidity and berry notes.',
    rating: 4.9,
    reviewCount: 534,
    inStock: true,
    badge: 'Popular',
    imageUrl:
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop',
    seller: 'Kenya Highlands Coffee',
    location: 'Kirinyaga, KE',
  },
  {
    id: '12',
    title: 'Organic Moringa Powder (250g)',
    slug: 'organic-moringa-powder-250g',
    price: 450,
    originalPrice: 600,
    currency: 'KES',
    category: 'Food & Groceries',
    categorySlug: 'food',
    description:
      'Pure dried moringa leaf powder. Rich in iron, calcium and vitamin C. Grown in Machakos County.',
    rating: 4.6,
    reviewCount: 112,
    inStock: true,
    badge: 'Sale',
    imageUrl:
      'https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=400&h=400&fit=crop',
    seller: 'Moringa Farm KE',
    location: 'Machakos, KE',
  },
  {
    id: '13',
    title: 'Trail Running Shoes (All-Terrain)',
    slug: 'trail-running-shoes',
    price: 5500,
    currency: 'KES',
    category: 'Sports & Outdoors',
    categorySlug: 'sports',
    description:
      'Lightweight trail runners with aggressive grip soles. Designed for Kenyan terrain — savanna to highland.',
    rating: 4.5,
    reviewCount: 78,
    inStock: true,
    badge: 'New',
    imageUrl:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    seller: 'RunKenya Store',
    location: 'Nairobi, KE',
  },
  {
    id: '14',
    title: 'Yoga Mat (Eco Cork, 6mm)',
    slug: 'eco-cork-yoga-mat',
    price: 2950,
    originalPrice: 3800,
    currency: 'KES',
    category: 'Sports & Outdoors',
    categorySlug: 'sports',
    description:
      'Natural cork top, rubber base. Non-slip even in Nairobi humidity. 183cm × 61cm.',
    rating: 4.7,
    reviewCount: 63,
    inStock: false,
    badge: 'Sale',
    imageUrl:
      'https://images.unsplash.com/photo-1601925228008-1dd03b54d02a?w=400&h=400&fit=crop',
    seller: 'Wellness Africa',
    location: 'Nairobi, KE',
  },
]
