'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'

export const HeaderNav: React.FC<{ data: HeaderType | null }> = ({ data }) => {
  const navItems = data?.navItems || []
  const pathname = usePathname()

  const onProducts = pathname?.startsWith('/products')
  const onCategories = pathname?.startsWith('/categories')

  const primaryHref = onProducts ? '/categories' : '/products'
  const primaryLabel = onProducts || onCategories ? (onProducts ? 'Categories' : 'Products') : 'Products'

  return (
    <nav className="flex gap-6 items-center">
      {/* Primary commerce toggle link */}
      <Link
        href={primaryHref}
        className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        {primaryLabel}
      </Link>

      {/* CMS Navigation Items */}
      {navItems.map(({ link }, i) => {
        return <CMSLink key={i} {...link} appearance="link" />
      })}

      {/* Legacy Search Link - keeping for compatibility */}
      <Link href="/search" className="hidden">
        <span className="sr-only">Search</span>
        <SearchIcon className="w-5 text-primary" />
      </Link>
    </nav>
  )
}
