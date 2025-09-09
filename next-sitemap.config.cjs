/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'https://afrimall.vercel.app',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/admin/*', '/api/*'],
  additionalPaths: async (config) => {
    const result = []

    // Add dynamic product pages if needed
    // This will be populated at build time
    return result
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://afrimall.vercel.app'}/sitemap.xml`,
    ],
  },
}
