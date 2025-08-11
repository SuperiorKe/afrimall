'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  return (
    <div
      className="relative -mt-[10.4rem] flex items-center justify-center text-white overflow-hidden"
      data-theme="dark"
    >
      {/* African Pattern Overlay */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-afrimall-orange/30 to-afrimall-red/30"></div>
        {/* Geometric African Pattern */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="africanPattern"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <polygon points="10,2 18,8 10,14 2,8" fill="currentColor" fillOpacity="0.1" />
              <circle cx="10" cy="10" r="3" fill="none" stroke="currentColor" strokeOpacity="0.1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#africanPattern)" />
        </svg>
      </div>

      <div className="container mb-8 z-10 relative flex items-center justify-center">
        <div className="max-w-[48rem] md:text-center">
          {/* Afrimall Hero Content */}
          <div className="mb-6 space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-afrimall-gold via-white to-afrimall-orange bg-clip-text text-transparent leading-tight">
              Discover Authentic
              <br />
              <span className="text-afrimall-gold">African Treasures</span>
            </h1>
            <p className="text-xl text-gray-200 leading-relaxed max-w-2xl mx-auto">
              From handcrafted jewelry to traditional textiles, explore the rich heritage and
              artistry of Africa. Support local artisans while discovering unique products that tell
              a story.
            </p>
          </div>

          {/* Custom CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-gradient-to-r from-afrimall-orange to-afrimall-red text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-afrimall-red hover:to-afrimall-orange transition-all duration-300 transform hover:scale-105 shadow-lg">
              🛍️ Shop Now
            </button>
            <button className="bg-transparent border-2 border-afrimall-gold text-afrimall-gold px-8 py-4 rounded-lg font-semibold text-lg hover:bg-afrimall-gold hover:text-white transition-all duration-300">
              🌍 Explore Categories
            </button>
          </div>

          {/* Original CMS Links (if provided) */}
          {richText && <RichText className="mb-6 hidden" data={richText} enableGutter={false} />}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex md:justify-center gap-4 mt-6">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink
                      {...link}
                      className="bg-afrimall-orange text-white px-6 py-3 rounded-lg hover:bg-afrimall-red transition-colors"
                    />
                  </li>
                )
              })}
            </ul>
          )}

          {/* Trust Indicators */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-afrimall-gold">✓</span>
              <span>Free Shipping Over $50</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-afrimall-gold">✓</span>
              <span>Authentic Products</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-afrimall-gold">✓</span>
              <span>Support African Artisans</span>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-[80vh] select-none">
        {media && typeof media === 'object' && (
          <Media fill imgClassName="-z-20 object-cover" priority resource={media} />
        )}
        {/* Fallback gradient background if no media */}
        {(!media || typeof media !== 'object') && (
          <div className="absolute inset-0 -z-20 bg-gradient-to-br from-afrimall-brown via-afrimall-red to-afrimall-orange"></div>
        )}
      </div>
    </div>
  )
}
