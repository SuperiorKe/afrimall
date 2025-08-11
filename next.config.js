import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
    ],
  },
  webpack: (webpackConfig, { dev }) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    // Performance optimizations for development
    if (dev) {
      // Reduce compilation time by disabling split chunks in dev
      webpackConfig.optimization.splitChunks = false

      // Disable source maps for faster builds
      webpackConfig.devtool = false

      // Reduce memory usage
      webpackConfig.optimization.minimize = false
    }

    return webpackConfig
  },
  reactStrictMode: true,
  redirects,

  // Performance optimizations
  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: ['@payloadcms/richtext-lexical', 'lucide-react', 'react-hook-form'],
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default withPayload(nextConfig, {
  devBundleServerPackages: false,
  // Disable payload's dev bundling for faster builds
  bundleServer: false,
})
