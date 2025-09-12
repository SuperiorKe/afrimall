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
      <footer className="mt-auto bg-gradient-to-r from-afrimall-brown to-gray-800 text-white">
        <div className="container py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <Link className="flex items-center mb-4" href="/">
                <Logo className="text-white" />
              </Link>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Discover authentic African products, from traditional crafts to modern designs.
                Supporting African artisans and connecting cultures worldwide.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/p/Afrimall-100061118447014/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-afrimall-orange rounded-full flex items-center justify-center hover:bg-afrimall-gold transition-colors cursor-pointer"
                  aria-label="Follow us on Facebook"
                >
                  <span className="text-white text-sm font-bold">f</span>
                </a>
                <a
                  href="https://www.tiktok.com/@afrimall_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-afrimall-orange rounded-full flex items-center justify-center hover:bg-afrimall-gold transition-colors cursor-pointer"
                  aria-label="Follow us on TikTok"
                >
                  <span className="text-white text-sm font-bold">t</span>
                </a>
                <a
                  href="https://www.instagram.com/afrimall_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-afrimall-orange rounded-full flex items-center justify-center hover:bg-afrimall-gold transition-colors cursor-pointer"
                  aria-label="Follow us on Instagram"
                >
                  <span className="text-white text-sm font-bold">i</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-afrimall-gold font-semibold mb-4">Quick Links</h3>
              <nav className="flex flex-col gap-2">
                {navItems.map(({ link }, i) => {
                  return (
                    <CMSLink
                      className="text-gray-300 hover:text-afrimall-gold transition-colors"
                      key={i}
                      {...link}
                    />
                  )
                })}
              </nav>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-afrimall-gold font-semibold mb-4">Support</h3>
              <div className="flex flex-col gap-2 text-gray-300">
                <Link href="/contact" className="hover:text-afrimall-gold transition-colors">
                  Contact Us
                </Link>
                <a 
                  href="tel:+15074297272" 
                  className="hover:text-afrimall-gold transition-colors"
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
          <div className="border-t border-afrimall-gold/30 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <ThemeSelector />
                <p className="text-gray-400 text-sm">
                  © 2025 Afrimall. Celebrating African Heritage.
                </p>
              </div>
              <div className="flex gap-6 text-sm text-gray-400">
                <Link href="/privacy" className="hover:text-afrimall-gold transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-afrimall-gold transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>

          {/* Built by Superior Signature */}
          <div className="border-t border-afrimall-gold/20 pt-6 mt-6">
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                Built by{' '}
                <span className="text-afrimall-gold font-semibold hover:text-afrimall-orange transition-colors cursor-pointer">
                  Superior
                </span>
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
      <footer className="mt-auto bg-gradient-to-r from-afrimall-brown to-gray-800 text-white">
        <div className="container py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <Link className="flex items-center mb-4" href="/">
                <Logo className="text-white" />
              </Link>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Discover authentic African products, from traditional crafts to modern designs.
                Supporting African artisans and connecting cultures worldwide.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/p/Afrimall-100061118447014/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-afrimall-orange rounded-full flex items-center justify-center hover:bg-afrimall-gold transition-colors cursor-pointer"
                  aria-label="Follow us on Facebook"
                >
                  <span className="text-white text-sm font-bold">f</span>
                </a>
                <a
                  href="https://www.tiktok.com/@afrimall_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-afrimall-orange rounded-full flex items-center justify-center hover:bg-afrimall-gold transition-colors cursor-pointer"
                  aria-label="Follow us on TikTok"
                >
                  <span className="text-white text-sm font-bold">t</span>
                </a>
                <a
                  href="https://www.instagram.com/afrimall_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-afrimall-orange rounded-full flex items-center justify-center hover:bg-afrimall-gold transition-colors cursor-pointer"
                  aria-label="Follow us on Instagram"
                >
                  <span className="text-white text-sm font-bold">i</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-afrimall-gold font-semibold mb-4">Quick Links</h3>
              <nav className="flex flex-col gap-2">
                {navItems.map(({ link }, i) => {
                  return (
                    <CMSLink
                      className="text-gray-300 hover:text-afrimall-gold transition-colors"
                      key={i}
                      {...link}
                    />
                  )
                })}
              </nav>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-afrimall-gold font-semibold mb-4">Support</h3>
              <div className="flex flex-col gap-2 text-gray-300">
                <Link href="/contact" className="hover:text-afrimall-gold transition-colors">
                  Contact Us
                </Link>
                <a 
                  href="tel:+15074297272" 
                  className="hover:text-afrimall-gold transition-colors"
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
          <div className="border-t border-afrimall-gold/30 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <ThemeSelector />
                <p className="text-gray-400 text-sm">
                  © 2025 Afrimall. Celebrating African Heritage.
                </p>
              </div>
              <div className="flex gap-6 text-sm text-gray-400">
                <Link href="/privacy" className="hover:text-afrimall-gold transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-afrimall-gold transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>

          {/* Built by Superior Signature */}
          <div className="border-t border-afrimall-gold/20 pt-6 mt-6">
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                Built with ❤️ by{' '}
                <a
                  href="https://www.linkedin.com/in/kenn-macharia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-afrimall-gold font-semibold hover:text-afrimall-orange transition-colors cursor-pointer"
                >
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
      <footer className="mt-auto bg-gradient-to-r from-afrimall-brown to-gray-800 text-white">
        <div className="container py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <Link className="flex items-center mb-4" href="/">
                <Logo className="text-white" />
              </Link>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Discover authentic African products, from traditional crafts to modern designs.
                Supporting African artisans and connecting cultures worldwide.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/p/Afrimall-100061118447014/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-afrimall-orange rounded-full flex items-center justify-center hover:bg-afrimall-gold transition-colors cursor-pointer"
                  aria-label="Follow us on Facebook"
                >
                  <span className="text-white text-sm font-bold">f</span>
                </a>
                <a
                  href="https://www.tiktok.com/@afrimall_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-afrimall-orange rounded-full flex items-center justify-center hover:bg-afrimall-gold transition-colors cursor-pointer"
                  aria-label="Follow us on TikTok"
                >
                  <span className="text-white text-sm font-bold">t</span>
                </a>
                <a
                  href="https://www.instagram.com/afrimall_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-afrimall-orange rounded-full flex items-center justify-center hover:bg-afrimall-gold transition-colors cursor-pointer"
                  aria-label="Follow us on Instagram"
                >
                  <span className="text-white text-sm font-bold">i</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-afrimall-gold font-semibold mb-4">Quick Links</h3>
              <nav className="flex flex-col gap-2">
                {navItems.map(({ link }, i) => {
                  return (
                    <CMSLink
                      className="text-gray-300 hover:text-afrimall-gold transition-colors"
                      key={i}
                      {...link}
                    />
                  )
                })}
              </nav>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-afrimall-gold font-semibold mb-4">Support</h3>
              <div className="flex flex-col gap-2 text-gray-300">
                <Link href="/contact" className="hover:text-afrimall-gold transition-colors">
                  Contact Us
                </Link>
                <a 
                  href="tel:+15074297272" 
                  className="hover:text-afrimall-gold transition-colors"
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
          <div className="border-t border-afrimall-gold/30 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <ThemeSelector />
                <p className="text-gray-400 text-sm">
                  © 2025 Afrimall. Celebrating African Heritage.
                </p>
              </div>
              <div className="flex gap-6 text-sm text-gray-400">
                <Link href="/privacy" className="hover:text-afrimall-gold transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-afrimall-gold transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>

          {/* Built by Superior Signature */}
          <div className="border-t border-afrimall-gold/20 pt-6 mt-6">
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                Built with ❤️ by{' '}
                <a
                  href="https://www.linkedin.com/in/kenn-macharia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-afrimall-gold font-semibold hover:text-afrimall-orange transition-colors cursor-pointer"
                >
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
