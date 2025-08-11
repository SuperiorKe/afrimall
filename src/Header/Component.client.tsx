'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import { SearchBar } from '@/components/ecommerce/SearchBar'
import { CartIcon } from '@/components/ecommerce/CartIcon'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header
      className="bg-white dark:bg-gray-900 border-b border-border shadow-sm sticky top-0 z-50"
      {...(theme ? { 'data-theme': theme } : {})}
    >
      {/* Top promotional banner */}
      <div className="bg-gradient-to-r from-afrimall-orange to-afrimall-red text-white py-2">
        <div className="container text-center">
          <p className="text-sm font-medium">
            🌍 Discover Authentic African Products | Free Shipping on Orders Over $50
          </p>
        </div>
      </div>

      <div className="container">
        <div className="py-4">
          {/* Top row with logo, search, and cart */}
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="hover:scale-105 transition-transform">
              <Logo loading="eager" priority="high" />
            </Link>

            {/* Search bar - hidden on mobile, shown on desktop */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <SearchBar className="w-full border-2 border-afrimall-orange/20 focus-within:border-afrimall-orange rounded-lg" />
            </div>

            {/* Cart and Auth */}
            <div className="flex items-center space-x-4">
              <CartIcon />
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-afrimall-orange transition-colors font-medium"
                >
                  Sign In
                </Link>
                <span className="text-gray-400">|</span>
                <Link
                  href="/auth/register"
                  className="text-sm bg-afrimall-orange text-white px-3 py-1.5 rounded-md hover:bg-afrimall-red transition-colors font-medium"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <HeaderNav data={data} />

            {/* Mobile search - shown on mobile, hidden on desktop */}
            <div className="md:hidden flex-1 max-w-xs">
              <SearchBar
                className="w-full border-afrimall-orange/20 focus-within:border-afrimall-orange rounded-md"
                placeholder="Search..."
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
