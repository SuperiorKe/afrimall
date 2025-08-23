import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from '@/fields/slug'

export const Products: CollectionConfig = {
  slug: 'products',
  access: {
    create: ({ req: { user } }) => {
      // Only authenticated users with proper roles can create products
      if (!user || user.collection !== 'users') return false
      
      const userData = user as any
      return ['admin', 'editor', 'super_admin'].includes(userData.role)
    },
    delete: ({ req: { user } }) => {
      // Only authenticated users with proper roles can delete products
      if (!user || user.collection !== 'users') return false
      
      const userData = user as any
      return ['admin', 'editor', 'super_admin'].includes(userData.role)
    },
    read: ({ req: { user } }) => {
      // Allow public read access to products
      return true
    },
    update: ({ req: { user } }) => {
      // Only authenticated users with proper roles can update products
      if (!user || user.collection !== 'users') return false
      
      const userData = user as any
      return ['admin', 'editor', 'super_admin'].includes(userData.role)
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
      admin: {
        description: 'Product categories for organization and filtering',
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
  },
}
