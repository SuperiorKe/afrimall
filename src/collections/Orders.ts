import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Orders: CollectionConfig = {
  slug: 'orders',
  access: {
    create: anyone, // Allow customers to create orders
    // Customers can read their own orders, admins can read all
    read: ({ req: { user } }) => {
      if (user?.collection === 'users') return true // Admin access
      if (user?.collection === 'customers') return { customer: { equals: user.id } } // Own orders only
      return false
    },
    // Only admins can update orders (for status changes, etc.)
    update: authenticated,
    // Only admins can delete orders
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'customer', 'status', 'total', 'createdAt'],
    group: 'E-commerce',
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique order number',
        readOnly: true,
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      admin: {
        description: 'Customer who placed the order',
      },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
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
        },
        {
          name: 'unitPrice',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Price per unit at time of order',
            step: 0.01,
          },
        },
        {
          name: 'totalPrice',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Total price for this item (quantity × unitPrice)',
            step: 0.01,
            readOnly: true,
          },
        },
        {
          name: 'productSnapshot',
          type: 'group',
          admin: {
            description: 'Product details at time of order (for record keeping)',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'sku',
              type: 'text',
              required: true,
            },
            {
              name: 'image',
              type: 'text',
              required: false,
              admin: {
                description: 'Product image URL at time of order (optional)',
              },
            },
          ],
        },
      ],
      admin: {
        description: 'Items in this order',
      },
    },
    {
      name: 'subtotal',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Subtotal before taxes and shipping',
        step: 0.01,
        readOnly: true,
      },
    },
    {
      name: 'shipping',
      type: 'group',
      fields: [
        {
          name: 'method',
          type: 'select',
          required: true,
          options: [
            { label: 'Standard Shipping', value: 'standard' },
            { label: 'Express Shipping', value: 'express' },
            { label: 'Overnight Shipping', value: 'overnight' },
            { label: 'Pickup', value: 'pickup' },
          ],
        },
        {
          name: 'cost',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            step: 0.01,
          },
        },
        {
          name: 'address',
          type: 'group',
          fields: [
            {
              name: 'firstName',
              type: 'text',
              required: true,
            },
            {
              name: 'lastName',
              type: 'text',
              required: true,
            },
            {
              name: 'company',
              type: 'text',
            },
            {
              name: 'address1',
              type: 'text',
              required: true,
            },
            {
              name: 'address2',
              type: 'text',
            },
            {
              name: 'city',
              type: 'text',
              required: true,
            },
            {
              name: 'state',
              type: 'text',
            },
            {
              name: 'postalCode',
              type: 'text',
              required: true,
            },
            {
              name: 'country',
              type: 'text',
              required: true,
            },
            {
              name: 'phone',
              type: 'text',
            },
          ],
        },
        {
          name: 'trackingNumber',
          type: 'text',
          admin: {
            description: 'Shipping tracking number',
          },
        },
        {
          name: 'estimatedDelivery',
          type: 'date',
          admin: {
            description: 'Estimated delivery date',
          },
        },
      ],
    },
    {
      name: 'billing',
      type: 'group',
      fields: [
        {
          name: 'address',
          type: 'group',
          fields: [
            {
              name: 'firstName',
              type: 'text',
              required: true,
            },
            {
              name: 'lastName',
              type: 'text',
              required: true,
            },
            {
              name: 'company',
              type: 'text',
            },
            {
              name: 'address1',
              type: 'text',
              required: true,
            },
            {
              name: 'address2',
              type: 'text',
            },
            {
              name: 'city',
              type: 'text',
              required: true,
            },
            {
              name: 'state',
              type: 'text',
            },
            {
              name: 'postalCode',
              type: 'text',
              required: true,
            },
            {
              name: 'country',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'tax',
      type: 'group',
      fields: [
        {
          name: 'amount',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            step: 0.01,
          },
        },
        {
          name: 'rate',
          type: 'number',
          defaultValue: 0,
          min: 0,
          max: 1,
          admin: {
            description: 'Tax rate (e.g., 0.15 for 15%)',
            step: 0.01,
          },
        },
        {
          name: 'inclusive',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Is tax included in product prices?',
          },
        },
      ],
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Total order amount (subtotal + shipping + tax)',
        step: 0.01,
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
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
      ],
      admin: {
        description: 'Order status',
      },
    },
    {
      name: 'paymentStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Partially Refunded', value: 'partially_refunded' },
      ],
      admin: {
        description: 'Payment status',
      },
    },
    {
      name: 'paymentMethod',
      type: 'select',
      options: [
        { label: 'Credit Card', value: 'credit_card' },
        { label: 'PayPal', value: 'paypal' },
        { label: 'M-Pesa', value: 'mpesa' },
        { label: 'MTN Mobile Money', value: 'mtn_mobile_money' },
        { label: 'Airtel Money', value: 'airtel_money' },
        { label: 'Bank Transfer', value: 'bank_transfer' },
        { label: 'Cash on Delivery', value: 'cod' },
      ],
      admin: {
        description: 'Payment method used',
      },
    },
    {
      name: 'paymentReference',
      type: 'text',
      admin: {
        description: 'Payment gateway reference/transaction ID',
      },
    },
    {
      name: 'stripePaymentIntentId',
      type: 'text',
      admin: {
        description: 'Stripe PaymentIntent ID for this order',
        condition: (data) => data?.paymentMethod === 'credit_card',
      },
    },
    {
      name: 'stripeClientSecret',
      type: 'text',
      admin: {
        description: 'Stripe client secret (for frontend confirmation)',
        condition: (data) => data?.paymentMethod === 'credit_card',
        hidden: true, // Hide from admin UI for security
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Order notes (customer or admin)',
      },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: {
        description: 'Internal notes (admin only)',
        condition: (data, siblingData, { user }) => user?.collection === 'users',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Generate order number for new orders
        if (operation === 'create' && !data.orderNumber) {
          const timestamp = Date.now()
          const random = Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, '0')
          data.orderNumber = `AFR${timestamp}${random}`
        }

        // Calculate totals
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

          // Calculate total
          const shippingCost = data.shipping?.cost || 0
          const taxAmount = data.tax?.amount || 0
          data.total = data.subtotal + shippingCost + taxAmount
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Update customer statistics after order changes
        if (operation === 'create' && doc.customer && doc.status === 'confirmed') {
          try {
            const customer = await req.payload.findByID({
              collection: 'customers',
              id: doc.customer,
            })

            if (customer) {
              await req.payload.update({
                collection: 'customers',
                id: customer.id,
                data: {
                  totalSpent: (customer.totalSpent || 0) + doc.total,
                  totalOrders: (customer.totalOrders || 0) + 1,
                  lastOrderDate: new Date().toISOString(),
                },
              })
            }
          } catch (error) {
            console.error('Error updating customer statistics:', error)
          }
        }
      },
    ],
  },
}
