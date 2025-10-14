import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  // During build time, skip fetching footer data
  if (
    process.env.SKIP_DATABASE_CONNECTION === 'true' ||
    process.env.NODE_ENV === 'development' ||
    process.env.VERCEL === '1'
  ) {
    const navItems: any[] = []
    return (
      <footer className="mt-auto bg-gradient-to-br from-gray-100 via-orange-50 to-amber-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="container py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <Link className="flex items-center mb-4" href="/">
                <Logo />
              </Link>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                Discover authentic African products, from traditional crafts to modern designs.
                Supporting African artisans and connecting cultures worldwide.
              </p>
              <div className="flex space-x-3">
                <a
                  href="https://www.facebook.com/p/Afrimall-100061118447014/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#1877F2] hover:bg-[#0C63D4] rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg cursor-pointer"
                  aria-label="Follow us on Facebook"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@afrimall_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-black hover:bg-gray-800 rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg cursor-pointer"
                  aria-label="Follow us on TikTok"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/afrimall_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#FD1D1D] hover:opacity-90 rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg cursor-pointer"
                  aria-label="Follow us on Instagram"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-afrimall-orange dark:text-afrimall-gold font-semibold mb-4">
                Quick Links
              </h3>
              <nav className="flex flex-col gap-2">
                {navItems.map(({ link }, i) => {
                  return (
                    <CMSLink
                      className="text-gray-700 dark:text-gray-300 hover:text-afrimall-orange dark:hover:text-afrimall-gold transition-colors"
                      key={i}
                      {...link}
                    />
                  )
                })}
              </nav>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-afrimall-orange dark:text-afrimall-gold font-semibold mb-4">
                Support
              </h3>
              <div className="flex flex-col gap-2 text-gray-700 dark:text-gray-300">
                <Link
                  href="/contact"
                  className="hover:text-afrimall-orange dark:hover:text-afrimall-gold transition-colors"
                >
                  Contact Us
                </Link>
                <a
                  href="tel:+15074297272"
                  className="hover:text-afrimall-orange dark:hover:text-afrimall-gold transition-colors"
                >
                  +1 (507) 429-7272
                </a>
                <Link href="/shipping" className="hover:text-afrimall-gold transition-colors">
                  Shipping Info
                </Link>
                <Link href="/returns" className="hover:text-afrimall-gold transition-colors">
                  Returns
                </Link>
                <Link href="/faq" className="hover:text-afrimall-gold transition-colors">
                  FAQ
                </Link>
              </div>
            </div>
          </div>

          {/* African Pattern Divider */}
          <div className="border-t border-gray-300 dark:border-afrimall-gold/30 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <ThemeSelector />
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  © 2025 Afrimall. Celebrating African Heritage.
                </p>
              </div>
              <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
                <Link
                  href="/privacy"
                  className="hover:text-afrimall-orange dark:hover:text-afrimall-gold transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-afrimall-orange dark:hover:text-afrimall-gold transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>

          {/* Built by Superior Signature */}
          <div className="border-t border-gray-300 dark:border-afrimall-gold/20 pt-6 mt-6">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-500 text-sm">
                Built with ❤️ by{' '}
                <a
                  href="https://github.com/SuperiorKe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-afrimall-orange dark:text-afrimall-gold font-semibold hover:text-afrimall-red dark:hover:text-afrimall-orange transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Superior
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  try {
    const footerData: Footer = await getCachedGlobal('footer', 1)()
    const navItems = footerData?.navItems || []

    return (
      <footer className="mt-auto bg-gradient-to-br from-gray-100 via-orange-50 to-amber-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="container py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <Link className="flex items-center mb-4" href="/">
                <Logo />
              </Link>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                Discover authentic African products, from traditional crafts to modern designs.
                Supporting African artisans and connecting cultures worldwide.
              </p>
              <div className="flex space-x-3">
                <a
                  href="https://www.facebook.com/p/Afrimall-100061118447014/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#1877F2] hover:bg-[#0C63D4] rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg cursor-pointer"
                  aria-label="Follow us on Facebook"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@afrimall_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-black hover:bg-gray-800 rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg cursor-pointer"
                  aria-label="Follow us on TikTok"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/afrimall_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#FD1D1D] hover:opacity-90 rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg cursor-pointer"
                  aria-label="Follow us on Instagram"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-afrimall-orange dark:text-afrimall-gold font-semibold mb-4">
                Quick Links
              </h3>
              <nav className="flex flex-col gap-2">
                {navItems.map(({ link }, i) => {
                  return (
                    <CMSLink
                      className="text-gray-700 dark:text-gray-300 hover:text-afrimall-orange dark:hover:text-afrimall-gold transition-colors"
                      key={i}
                      {...link}
                    />
                  )
                })}
              </nav>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-afrimall-orange dark:text-afrimall-gold font-semibold mb-4">
                Support
              </h3>
              <div className="flex flex-col gap-2 text-gray-700 dark:text-gray-300">
                <Link
                  href="/contact"
                  className="hover:text-afrimall-orange dark:hover:text-afrimall-gold transition-colors"
                >
                  Contact Us
                </Link>
                <a
                  href="tel:+15074297272"
                  className="hover:text-afrimall-orange dark:hover:text-afrimall-gold transition-colors"
                >
                  +1 (507) 429-7272
                </a>
                <Link href="/shipping" className="hover:text-afrimall-gold transition-colors">
                  Shipping Info
                </Link>
                <Link href="/returns" className="hover:text-afrimall-gold transition-colors">
                  Returns
                </Link>
                <Link href="/faq" className="hover:text-afrimall-gold transition-colors">
                  FAQ
                </Link>
              </div>
            </div>
          </div>

          {/* African Pattern Divider */}
          <div className="border-t border-gray-300 dark:border-afrimall-gold/30 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <ThemeSelector />
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  © 2025 Afrimall. Celebrating African Heritage.
                </p>
              </div>
              <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
                <Link
                  href="/privacy"
                  className="hover:text-afrimall-orange dark:hover:text-afrimall-gold transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-afrimall-orange dark:hover:text-afrimall-gold transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>

          {/* Built by Superior Signature */}
          <div className="border-t border-gray-300 dark:border-afrimall-gold/20 pt-6 mt-6">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-500 text-sm">
                Built with ❤️ by{' '}
                <a
                  href="https://github.com/SuperiorKe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-afrimall-orange dark:text-afrimall-gold font-semibold hover:text-afrimall-red dark:hover:text-afrimall-orange transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Superior
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    )
  } catch (error) {
    // Fallback to empty footer if global fetch fails
    const navItems: any[] = []
    return (
      <footer className="mt-auto bg-gradient-to-br from-gray-100 via-orange-50 to-amber-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="container py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <Link className="flex items-center mb-4" href="/">
                <Logo />
              </Link>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                Discover authentic African products, from traditional crafts to modern designs.
                Supporting African artisans and connecting cultures worldwide.
              </p>
              <div className="flex space-x-3">
                <a
                  href="https://www.facebook.com/p/Afrimall-100061118447014/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#1877F2] hover:bg-[#0C63D4] rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg cursor-pointer"
                  aria-label="Follow us on Facebook"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@afrimall_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-black hover:bg-gray-800 rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg cursor-pointer"
                  aria-label="Follow us on TikTok"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/afrimall_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#FD1D1D] hover:opacity-90 rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg cursor-pointer"
                  aria-label="Follow us on Instagram"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-afrimall-orange dark:text-afrimall-gold font-semibold mb-4">
                Quick Links
              </h3>
              <nav className="flex flex-col gap-2">
                {navItems.map(({ link }, i) => {
                  return (
                    <CMSLink
                      className="text-gray-700 dark:text-gray-300 hover:text-afrimall-orange dark:hover:text-afrimall-gold transition-colors"
                      key={i}
                      {...link}
                    />
                  )
                })}
              </nav>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-afrimall-orange dark:text-afrimall-gold font-semibold mb-4">
                Support
              </h3>
              <div className="flex flex-col gap-2 text-gray-700 dark:text-gray-300">
                <Link
                  href="/contact"
                  className="hover:text-afrimall-orange dark:hover:text-afrimall-gold transition-colors"
                >
                  Contact Us
                </Link>
                <a
                  href="tel:+15074297272"
                  className="hover:text-afrimall-orange dark:hover:text-afrimall-gold transition-colors"
                >
                  +1 (507) 429-7272
                </a>
                <Link href="/shipping" className="hover:text-afrimall-gold transition-colors">
                  Shipping Info
                </Link>
                <Link href="/returns" className="hover:text-afrimall-gold transition-colors">
                  Returns
                </Link>
                <Link href="/faq" className="hover:text-afrimall-gold transition-colors">
                  FAQ
                </Link>
              </div>
            </div>
          </div>

          {/* African Pattern Divider */}
          <div className="border-t border-gray-300 dark:border-afrimall-gold/30 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <ThemeSelector />
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  © 2025 Afrimall. Celebrating African Heritage.
                </p>
              </div>
              <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
                <Link
                  href="/privacy"
                  className="hover:text-afrimall-orange dark:hover:text-afrimall-gold transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-afrimall-orange dark:hover:text-afrimall-gold transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>

          {/* Built by Superior Signature */}
          <div className="border-t border-gray-300 dark:border-afrimall-gold/20 pt-6 mt-6">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-500 text-sm">
                Built with ❤️ by{' '}
                <a
                  href="https://github.com/SuperiorKe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-afrimall-orange dark:text-afrimall-gold font-semibold hover:text-afrimall-red dark:hover:text-afrimall-orange transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Superior
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    )
  }
}
