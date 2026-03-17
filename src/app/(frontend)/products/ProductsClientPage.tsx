'use client'

import { useState, useMemo } from 'react'
import type { MockProduct } from '@/lib/mockProducts'
import { MOCK_CATEGORIES } from '@/lib/mockProducts'

type Props = {
  products: MockProduct[]
  isDemo: boolean
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3 h-3 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">({rating})</span>
    </div>
  )
}

const BADGE_STYLES: Record<string, string> = {
  New: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  Sale: 'bg-red-100 text-red-700 border border-red-200',
  Popular: 'bg-amber-100 text-amber-700 border-amber-200',
  Local: 'bg-orange-100 text-orange-700 border border-orange-200',
}

export function ProductsClientPage({ products, isDemo }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating'>('default')
  const [addedToCart, setAddedToCart] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = [...products]
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.categorySlug === selectedCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
    }
    if (sortBy === 'price-asc') list.sort((a, b) => a.price - b.price)
    if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price)
    if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating)
    return list
  }, [products, selectedCategory, searchQuery, sortBy])

  function handleAddToCart(productId: string) {
    setAddedToCart(productId)
    setTimeout(() => setAddedToCart(null), 1800)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isDemo && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">🛍️</span>
              <div>
                <span className="font-semibold text-sm">Demo Mode</span>
                <span className="text-orange-100 text-sm ml-2">
                  Viewing sample products. Full catalogue coming soon.
                </span>
              </div>
            </div>
            <span className="hidden sm:block text-orange-100 text-xs bg-orange-600 px-3 py-1 rounded-full">
              Portfolio Preview
            </span>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Shop <span className="text-orange-500">Afrimall</span>
          </h1>
          <p className="text-gray-500 text-sm">Authentic African products delivered to your door</p>
          <div className="mt-5 relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-gray-50"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {MOCK_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="default">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-4">
          {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-700">No products found</h3>
            <p className="text-gray-400 text-sm mt-1">Try a different search term or category</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
              className="mt-4 text-orange-500 text-sm underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-200 flex flex-col group"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-white text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {product.badge && product.inStock && (
                    <div className="absolute top-2 left-2">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${BADGE_STYLES[product.badge]}`}
                      >
                        {product.badge}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-xs text-orange-500 font-medium mb-1">{product.category}</p>
                  <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-2 flex-1">{product.description}</p>
                  <StarRating rating={product.rating} />
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="text-base font-bold text-gray-900">KES {product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through ml-2">
                          KES {product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {product.originalPrice && (
                      <span className="text-xs text-red-500 font-medium">
                        -
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1 mb-3">
                    <span className="text-xs text-gray-400">📍 {product.location}</span>
                  </div>
                  <button
                    onClick={() => product.inStock && handleAddToCart(product.id)}
                    disabled={!product.inStock}
                    className={`w-full py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                      !product.inStock
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : addedToCart === product.id
                          ? 'bg-green-500 text-white scale-95'
                          : 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95'
                    }`}
                  >
                    {!product.inStock ? 'Out of Stock' : addedToCart === product.id ? '✓ Added!' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isDemo && (
          <div className="mt-12 border border-orange-100 rounded-2xl p-6 bg-orange-50 text-center">
            <p className="text-orange-700 font-semibold text-sm mb-1">🌍 Built for African Commerce</p>
            <p className="text-orange-500 text-xs max-w-md mx-auto">
              Afrimall was built with Next.js 15 + Payload CMS + PostgreSQL on AWS RDS. This demo showcases the full
              product catalogue UI. Live inventory connects when the platform relaunches.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

