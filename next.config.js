/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['payload'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Ensure CSS is properly processed
  webpack: (config) => {
    return config
  },
}

export default nextConfig
