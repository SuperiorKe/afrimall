import type { CollectionSlug, Payload, PayloadRequest, File } from 'payload'
import { afrimallCategories } from './afrimall-categories'
import { afrimallProducts, categoryMapping } from './afrimall-products'
import { image1 } from './image-1'
import { image2 } from './image-2'

const collections: CollectionSlug[] = ['categories', 'products', 'media']

export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  try {
    payload.logger.info('🌱 Starting Afrimall database seeding...')

    // Clear existing data
    payload.logger.info('🧹 Clearing existing data...')

    try {
      await Promise.all(
        collections.map(async (collection) => {
          const count = await payload.count({ collection })
          if (count.totalDocs > 0) {
            await payload.db.deleteMany({ collection, req, where: {} })
            payload.logger.info(`✅ Cleared ${count.totalDocs} items from ${collection}`)
          }
        }),
      )
    } catch (error) {
      payload.logger.warn('⚠️  Error clearing data, continuing anyway:', error)
    }

    // Seed media first (needed for product images)
    payload.logger.info('🌍 Seeding media...')

    // Use local image files instead of fetching from external URLs
    const fs = await import('fs')
    const path = await import('path')

    const seedDir = path.join(process.cwd(), 'src', 'endpoints', 'seed')

    const [image1Buffer, image2Buffer] = await Promise.all([
      fs.promises.readFile(path.join(seedDir, 'image-post1.webp')),
      fs.promises.readFile(path.join(seedDir, 'image-post2.webp')),
    ])

    const mediaResults = await Promise.all([
      payload.create({
        collection: 'media',
        data: {
          ...image1,
          alt: 'African marketplace product image 1',
        },
        file: {
          name: 'image-post1.webp',
          data: image1Buffer,
          mimetype: 'image/webp',
          size: image1Buffer.length,
        },
      }),
      payload.create({
        collection: 'media',
        data: {
          ...image2,
          alt: 'African marketplace product image 2',
        },
        file: {
          name: 'image-post2.webp',
          data: image2Buffer,
          mimetype: 'image/webp',
          size: image2Buffer.length,
        },
      }),
    ])

    const [image1Doc, image2Doc] = mediaResults
    payload.logger.info(`✅ Created ${mediaResults.length} media files`)

    // Create categories
    payload.logger.info('📂 Creating categories...')
    const createdCategories: { [key: string]: any } = {}

    for (const categoryData of afrimallCategories) {
      try {
        payload.logger.info(`Creating category: ${categoryData.title}`)

        const category = await payload.create({
          collection: 'categories',
          data: {
            ...categoryData,
            image: image1Doc.id, // Assign a default image for now
          },
          req,
        })

        // Store for product linking
        if (category.slug) {
          createdCategories[category.slug] = category
          payload.logger.info(`✅ Created: ${category.title} (slug: ${category.slug})`)
        }
      } catch (error: any) {
        payload.logger.error(`❌ Failed to create ${categoryData.title}:`)
        payload.logger.error(`   Message: ${error.message}`)
        if (error.data) {
          payload.logger.error(`   Validation errors:`, JSON.stringify(error.data, null, 2))
        }
      }
    }

    payload.logger.info(`📂 Created ${Object.keys(createdCategories).length} categories`)

    // Create products and link to categories
    payload.logger.info('🛍️ Creating products...')
    let createdProductsCount = 0

    for (const productData of afrimallProducts) {
      try {
        payload.logger.info(`Creating product: ${productData.title}`)

        // Find which categories this product belongs to
        const productCategories: number[] = []
        for (const [categorySlug, productTitles] of Object.entries(categoryMapping)) {
          if (productTitles.includes(productData.title)) {
            const category = createdCategories[categorySlug]
            if (category && category.id) {
              // Ensure we only add numeric IDs
              const categoryId =
                typeof category.id === 'string' ? parseInt(category.id, 10) : category.id
              if (!isNaN(categoryId)) {
                productCategories.push(categoryId)
              }
            }
          }
        }

        // Assign random images to products for variety
        const randomImage = [image1Doc, image2Doc][Math.floor(Math.random() * 2)]

        const product = await payload.create({
          collection: 'products',
          data: {
            ...productData,
            categories: productCategories,
            images: [
              {
                image: randomImage.id,
                alt: `${productData.title} - Product Image`,
              },
            ],
          } as any, // Type assertion to bypass strict type checking for seed data
          req,
        })

        createdProductsCount++
        payload.logger.info(`✅ Created: ${product.title} (${productCategories.length} categories)`)
      } catch (error: any) {
        payload.logger.error(`❌ Failed to create ${productData.title}:`)
        payload.logger.error(`   Message: ${error.message}`)
        if (error.data) {
          payload.logger.error(`   Validation errors:`, JSON.stringify(error.data, null, 2))
        }
      }
    }

    payload.logger.info(`🛍️ Created ${createdProductsCount} products`)

    // Update globals
    payload.logger.info('🌐 Setting up navigation...')

    try {
      await (payload.updateGlobal as any)({
        slug: 'header',
        data: {
          navItems: [
            {
              link: {
                type: 'custom',
                label: 'Products',
                url: '/products',
              },
            },
            {
              link: {
                type: 'custom',
                label: 'Categories',
                url: '/categories',
              },
            },
            {
              link: {
                type: 'custom',
                label: 'Cart',
                url: '/cart',
              },
            },
          ],
        },
      })
      payload.logger.info('✅ Header navigation updated')
    } catch (error: any) {
      payload.logger.error('❌ Failed to update header:', error.message)
    }

    try {
      await (payload.updateGlobal as any)({
        slug: 'footer',
        data: {
          navItems: [
            {
              link: {
                type: 'custom',
                label: 'Admin',
                url: '/admin',
              },
            },
            {
              link: {
                type: 'custom',
                label: 'Afrimall',
                newTab: true,
                url: 'https://afrimall.com/',
              },
            },
          ],
        },
      })
      payload.logger.info('✅ Footer navigation updated')
    } catch (error: any) {
      payload.logger.error('❌ Failed to update footer:', error.message)
    }

    payload.logger.info('🎉 Afrimall database seeding completed!')
    payload.logger.info(
      `📊 Summary: ${Object.keys(createdCategories).length} categories, ${createdProductsCount} products, ${mediaResults.length} media files`,
    )
  } catch (error: any) {
    payload.logger.error('💥 Critical error during seeding:', error.message)
    throw error
  }
}
