import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const ShoppingCart: CollectionConfig = {
  slug: 'shopping-cart',
  access: {
    create: anyone, // Allow anyone to create cart (for guest users)
    // Users can access their own cart, admins can access all
    read: ({ req: { user } }) => {
      if (user?.collection === 'users') return true // Admin access
      if (user?.collection === 'customers') return { customer: { equals: user.id } } // Own cart only
      // For guest users, allow access based on session ID
      return true // We'll handle guest access in the frontend
    },
    update: ({ req: { user } }) => {
      if (user?.collection === 'users') return true // Admin access
      if (user?.collection === 'customers') return { customer: { equals: user.id } } // Own cart only
      return true // Guest users can update their cart
    },
    delete: ({ req: { user } }) => {
      if (user?.collection === 'users') return true // Admin access
      if (user?.collection === 'customers') return { customer: { equals: user.id } } // Own cart only
      return true // Guest users can delete their cart
    },
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['customer', 'sessionId', 'itemCount', 'total', 'updatedAt'],
    group: 'E-commerce',
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      admin: {
        description: 'Customer (if logged in)',
      },
    },
    {
      name: 'sessionId',
      type: 'text',
      admin: {
        description: 'Session ID for guest users',
      },
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'variant',
          type: 'relationship',
          relationTo: 'product-variants',
          admin: {
            description: 'Product variant (if applicable)',
          },
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
          defaultValue: 1,
        },
        {
          name: 'unitPrice',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Current price per unit',
            step: 0.01,
          },
        },
        {
          name: 'totalPrice',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Total price for this item',
            step: 0.01,
            readOnly: true,
          },
        },
        {
          name: 'addedAt',
          type: 'date',
          defaultValue: () => new Date().toISOString(),
          admin: {
            description: 'When item was added to cart',
            readOnly: true,
          },
        },
      ],
      admin: {
        description: 'Items in the cart',
      },
    },
    {
      name: 'subtotal',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Cart subtotal',
        step: 0.01,
        readOnly: true,
      },
    },
    {
      name: 'itemCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Total number of items in cart',
        readOnly: true,
      },
    },
    {
      name: 'currency',
      type: 'select',
      required: true,
      defaultValue: 'USD',
      options: [
        { label: 'US Dollar (USD)', value: 'USD' },
        { label: 'Nigerian Naira (NGN)', value: 'NGN' },
        { label: 'Kenyan Shilling (KES)', value: 'KES' },
        { label: 'South African Rand (ZAR)', value: 'ZAR' },
        { label: 'Ghanaian Cedi (GHS)', value: 'GHS' },
        { label: 'Ugandan Shilling (UGX)', value: 'UGX' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Abandoned', value: 'abandoned' },
        { label: 'Converted', value: 'converted' },
      ],
      admin: {
        description: 'Cart status',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        description: 'When this cart expires (for cleanup)',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Customer notes or special instructions',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // Set expiration date for new carts (30 days from now)
        if (!data.expiresAt) {
          const expirationDate = new Date()
          expirationDate.setDate(expirationDate.getDate() + 30)
          data.expiresAt = expirationDate.toISOString()
        }

        return data
      },
    ],
    beforeChange: [
      ({ data }) => {
        // Calculate cart totals
        if (data.items && Array.isArray(data.items)) {
          // Calculate item totals
          data.items.forEach((item: any) => {
            if (item.quantity && item.unitPrice) {
              item.totalPrice = item.quantity * item.unitPrice
            }
          })

          // Calculate subtotal
          data.subtotal = data.items.reduce((sum: number, item: any) => {
            return sum + (item.totalPrice || 0)
          }, 0)

          // Calculate item count
          data.itemCount = data.items.reduce((count: number, item: any) => {
            return count + (item.quantity || 0)
          }, 0)
        } else {
          data.subtotal = 0
          data.itemCount = 0
        }

        return data
      },
    ],
    afterChange: [
      ({ doc, operation }) => {
        // Mark cart as abandoned if it hasn't been updated in 24 hours
        const oneDayAgo = new Date()
        oneDayAgo.setHours(oneDayAgo.getHours() - 24)

        if (doc.updatedAt && new Date(doc.updatedAt) < oneDayAgo && doc.status === 'active') {
          // This would be handled by a scheduled job in a real application
          console.log(`Cart ${doc.id} should be marked as abandoned`)
        }
      },
    ],
  },
}
