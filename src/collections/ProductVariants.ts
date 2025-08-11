import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const ProductVariants: CollectionConfig = {
  slug: 'product-variants',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'product', 'price', 'sku', 'inventory'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Variant name (e.g., "Large Red", "Size M - Blue")',
      },
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      admin: {
        description: 'Parent product this variant belongs to',
      },
    },
    {
      name: 'sku',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique SKU for this variant',
      },
    },
    {
      name: 'price',
      type: 'number',
      min: 0,
      admin: {
        description: 'Variant price (leave empty to use product base price)',
        step: 0.01,
      },
    },
    {
      name: 'compareAtPrice',
      type: 'number',
      min: 0,
      admin: {
        description: 'Original price for this variant',
        step: 0.01,
      },
    },
    {
      name: 'options',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            description: 'Option name (e.g., "Size", "Color", "Material")',
          },
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          admin: {
            description: 'Option value (e.g., "Large", "Red", "Cotton")',
          },
        },
      ],
      admin: {
        description: 'Variant options (size, color, material, etc.)',
      },
    },
    {
      name: 'inventory',
      type: 'group',
      fields: [
        {
          name: 'quantity',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Stock quantity for this variant',
          },
        },
        {
          name: 'reserved',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Reserved quantity (in pending orders)',
            readOnly: true,
          },
        },
        {
          name: 'available',
          type: 'number',
          admin: {
            description: 'Available quantity (calculated: quantity - reserved)',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Variant-specific images (optional - will fallback to product images)',
      },
    },
    {
      name: 'weight',
      type: 'number',
      min: 0,
      admin: {
        description: 'Variant weight in kg (leave empty to use product weight)',
        step: 0.01,
      },
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Is this the default variant for the product?',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Inactive',
          value: 'inactive',
        },
      ],
      admin: {
        description: 'Variant availability status',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Calculate available inventory
        if (data.inventory) {
          const quantity = data.inventory.quantity || 0
          const reserved = data.inventory.reserved || 0
          data.inventory.available = Math.max(0, quantity - reserved)
        }

        return data
      },
    ],
  },
}
