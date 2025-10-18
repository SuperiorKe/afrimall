import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from '@/fields/slug'

export const Products: CollectionConfig = {
  slug: 'products',
  access: {
    create: ({ req: { user } }) => {
      // Temporarily allow all access for debugging - TODO: Restore proper authentication
      return true
    },
    delete: ({ req: { user } }) => {
      // Temporarily allow all access for debugging - TODO: Restore proper authentication
      return true
    },
    read: ({ req: { user } }) => {
      // Allow public read access to products
      return true
    },
    update: ({ req: { user } }) => {
      // Temporarily allow all access for debugging - TODO: Restore proper authentication
      return true
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'price', 'status', 'categories', 'updatedAt'],
    group: 'E-commerce',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'The product name/title',
      },
    },
    ...slugField(),
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Short product description for listings',
      },
    },
    {
      name: 'fullDescription',
      type: 'richText',
      admin: {
        description: 'Detailed product description with rich formatting',
      },
    },
    {
      name: 'images',
      type: 'array',
      required: false, // Make it optional for now
      minRows: 0, // Allow empty array
      maxRows: 10,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: false, // Make individual images optional
        },
        {
          name: 'alt',
          type: 'text',
          required: false, // Make alt text optional
        },
      ],
      admin: {
        description: 'Product images (first image will be the main image)',
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Base price in USD',
        step: 0.01,
      },
    },
    {
      name: 'compareAtPrice',
      type: 'number',
      min: 0,
      admin: {
        description: 'Original price (for showing discounts)',
        step: 0.01,
      },
    },
    {
      name: 'sku',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Stock Keeping Unit - unique product identifier',
      },
    },
    {
      name: 'inventory',
      type: 'group',
      fields: [
        {
          name: 'trackQuantity',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Track inventory quantity for this product',
          },
        },
        {
          name: 'quantity',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Current stock quantity',
            condition: (data, siblingData) => siblingData.trackQuantity,
          },
        },
        {
          name: 'allowBackorder',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Allow orders when out of stock',
          },
        },
        {
          name: 'lowStockThreshold',
          type: 'number',
          defaultValue: 5,
          min: 0,
          admin: {
            description: 'Alert when stock falls below this number',
            condition: (data, siblingData) => siblingData.trackQuantity,
          },
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      defaultValue: [],
      admin: {
        description: 'Product categories for organization and filtering',
        isSortable: true,
        position: 'sidebar',
      },
      filterOptions: {
        status: {
          equals: 'active',
        },
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            // Ensure value is always an array
            if (!Array.isArray(value)) {
              console.log(
                'Categories field beforeValidate: Converting non-array value to array:',
                value,
              )
              return []
            }
            return value
          },
        ],
        beforeChange: [
          ({ value }) => {
            // Additional safety check before saving
            if (!Array.isArray(value)) {
              console.log(
                'Categories field beforeChange: Converting non-array value to array:',
                value,
              )
              return []
            }
            return value
          },
        ],
        afterRead: [
          ({ value }) => {
            // Ensure value is always an array after reading
            if (!Array.isArray(value)) {
              console.log('Categories field afterRead: Converting non-array value to array:', value)
              return []
            }
            return value
          },
        ],
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Tags for better searchability and filtering',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Archived',
          value: 'archived',
        },
      ],
      admin: {
        description: 'Product visibility status',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Feature this product on homepage and category pages',
      },
    },
    {
      name: 'weight',
      type: 'number',
      min: 0,
      admin: {
        description: 'Product weight in kg (for shipping calculations)',
        step: 0.01,
      },
    },
    {
      name: 'dimensions',
      type: 'group',
      fields: [
        {
          name: 'length',
          type: 'number',
          min: 0,
          admin: {
            description: 'Length in cm',
            step: 0.1,
          },
        },
        {
          name: 'width',
          type: 'number',
          min: 0,
          admin: {
            description: 'Width in cm',
            step: 0.1,
          },
        },
        {
          name: 'height',
          type: 'number',
          min: 0,
          admin: {
            description: 'Height in cm',
            step: 0.1,
          },
        },
      ],
      admin: {
        description: 'Product dimensions for shipping calculations',
      },
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'SEO title (leave empty to use product title)',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: {
            description: 'SEO meta description',
          },
        },
        {
          name: 'keywords',
          type: 'text',
          admin: {
            description: 'SEO keywords (comma separated)',
          },
        },
      ],
      admin: {
        description: 'Search Engine Optimization settings',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate SEO title if not provided
        if (!data.seo?.title && data.title) {
          data.seo = { ...data.seo, title: data.title }
        }

        // Auto-generate SEO description if not provided
        if (!data.seo?.description && data.description) {
          data.seo = { ...data.seo, description: data.description }
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Check for low stock alerts after inventory changes
        if (doc.inventory?.trackQuantity && doc.inventory?.quantity !== undefined) {
          const currentQuantity = doc.inventory.quantity
          const lowStockThreshold = doc.inventory.lowStockThreshold || 5

          if (currentQuantity <= lowStockThreshold && currentQuantity > 0) {
            // Log low stock alert
            console.warn(
              `LOW STOCK ALERT: Product "${doc.title}" (${doc.sku}) has ${currentQuantity} units remaining (threshold: ${lowStockThreshold})`,
            )

            // Send admin notification email
            try {
              const { queueAdminNotificationEmail } = await import('../lib/email/emailQueue')
              await queueAdminNotificationEmail(
                'Low Stock Alert',
                `Product "${doc.title}" (SKU: ${doc.sku}) has ${currentQuantity} units remaining (threshold: ${lowStockThreshold}). Consider restocking soon.`,
              )
            } catch (error) {
              console.error('Error sending low stock alert email:', error)
            }
          } else if (currentQuantity === 0) {
            // Log out of stock alert
            console.warn(`OUT OF STOCK: Product "${doc.title}" (${doc.sku}) is now out of stock`)

            // Send admin notification email
            try {
              const { queueAdminNotificationEmail } = await import('../lib/email/emailQueue')
              await queueAdminNotificationEmail(
                'Out of Stock Alert',
                `Product "${doc.title}" (SKU: ${doc.sku}) is now out of stock. Consider updating product status or restocking immediately.`,
              )
            } catch (error) {
              console.error('Error sending out of stock alert email:', error)
            }
          }
        }
      },
    ],
  },
}
