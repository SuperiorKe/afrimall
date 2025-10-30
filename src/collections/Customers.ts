import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Customers: CollectionConfig = {
  slug: 'customers',
  auth: {
    // Enable authentication for customers
    tokenExpiration: 7200, // 2 hours
    // Disable Payload's built-in email verification to use our custom system
    verify: false,
    maxLoginAttempts: 5,
    lockTime: 600000, // 10 minutes
  },
  access: {
    // Customers can create their own accounts
    create: anyone,
    // Customers can read their own data, admins can read all
    read: ({ req: { user } }) => {
      if (user?.collection === 'users') return true // Admin access
      if (user?.collection === 'customers') return { id: { equals: user.id } } // Own data only
      return false
    },
    // Customers can update their own data, admins can update all
    update: ({ req: { user } }) => {
      if (user?.collection === 'users') return true // Admin access
      if (user?.collection === 'customers') return { id: { equals: user.id } } // Own data only
      return false
    },
    // Only admins can delete customers
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'status', 'createdAt'],
    group: 'E-commerce',
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
      required: true,
      admin: {
        description: 'Customer first name',
      },
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
      admin: {
        description: 'Customer last name',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      admin: {
        description: 'Customer email address (used for login)',
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        description: 'Customer phone number',
      },
    },
    {
      name: 'dateOfBirth',
      type: 'date',
      admin: {
        description: 'Customer date of birth',
      },
    },
    {
      name: 'addresses',
      type: 'array',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            {
              label: 'Shipping',
              value: 'shipping',
            },
            {
              label: 'Billing',
              value: 'billing',
            },
          ],
        },
        {
          name: 'isDefault',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Is this the default address for this type?',
          },
        },
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
          admin: {
            description: 'Company name (optional)',
          },
        },
        {
          name: 'address1',
          type: 'text',
          required: true,
          admin: {
            description: 'Street address line 1',
          },
        },
        {
          name: 'address2',
          type: 'text',
          admin: {
            description: 'Street address line 2 (optional)',
          },
        },
        {
          name: 'city',
          type: 'text',
          required: true,
        },
        {
          name: 'state',
          type: 'text',
          admin: {
            description: 'State/Province',
          },
        },
        {
          name: 'postalCode',
          type: 'text',
          required: true,
        },
        {
          name: 'country',
          type: 'select',
          required: true,
          options: [
            { label: 'Nigeria', value: 'NG' },
            { label: 'Kenya', value: 'KE' },
            { label: 'South Africa', value: 'ZA' },
            { label: 'Ghana', value: 'GH' },
            { label: 'Uganda', value: 'UG' },
            { label: 'Tanzania', value: 'TZ' },
            { label: 'Ethiopia', value: 'ET' },
            { label: 'Morocco', value: 'MA' },
            { label: 'Egypt', value: 'EG' },
            { label: 'Algeria', value: 'DZ' },
            { label: 'Other', value: 'OTHER' },
          ],
        },
      ],
      admin: {
        description: 'Customer addresses (shipping and billing)',
      },
    },
    {
      name: 'preferences',
      type: 'group',
      fields: [
        {
          name: 'currency',
          type: 'select',
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
          name: 'language',
          type: 'select',
          defaultValue: 'en',
          options: [
            { label: 'English', value: 'en' },
            { label: 'French', value: 'fr' },
            { label: 'Arabic', value: 'ar' },
            { label: 'Swahili', value: 'sw' },
          ],
        },
        {
          name: 'newsletter',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Subscribe to newsletter',
          },
        },
        {
          name: 'smsMarketing',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Receive SMS marketing messages',
          },
        },
      ],
      admin: {
        description: 'Customer preferences and settings',
      },
    },
    {
      name: 'resetPasswordToken',
      type: 'text',
      admin: {
        description: 'Password reset token (auto-generated)',
        hidden: true,
      },
    },
    {
      name: 'resetPasswordExpiration',
      type: 'date',
      admin: {
        description: 'Password reset token expiration date',
        hidden: true,
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
        {
          label: 'Suspended',
          value: 'suspended',
        },
      ],
      admin: {
        description: 'Customer account status',
      },
    },
    {
      name: 'customerGroup',
      type: 'select',
      defaultValue: 'regular',
      options: [
        {
          label: 'Regular',
          value: 'regular',
        },
        {
          label: 'VIP',
          value: 'vip',
        },
        {
          label: 'Wholesale',
          value: 'wholesale',
        },
      ],
      admin: {
        description: 'Customer group for pricing and promotions',
      },
    },
    {
      name: 'totalSpent',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Total amount spent by customer',
        readOnly: true,
        step: 0.01,
      },
    },
    {
      name: 'totalOrders',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Total number of orders placed',
        readOnly: true,
      },
    },
    {
      name: 'lastOrderDate',
      type: 'date',
      admin: {
        description: 'Date of last order',
        readOnly: true,
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about the customer (admin only)',
        condition: (data, siblingData, { user }) => user?.collection === 'users',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Set default address logic
        if (data.addresses && data.addresses.length > 0) {
          const shippingAddresses = data.addresses.filter((addr: any) => addr.type === 'shipping')
          const billingAddresses = data.addresses.filter((addr: any) => addr.type === 'billing')

          // If no default shipping address is set, make the first one default
          if (
            shippingAddresses.length > 0 &&
            !shippingAddresses.some((addr: any) => addr.isDefault)
          ) {
            shippingAddresses[0].isDefault = true
          }

          // If no default billing address is set, make the first one default
          if (
            billingAddresses.length > 0 &&
            !billingAddresses.some((addr: any) => addr.isDefault)
          ) {
            billingAddresses[0].isDefault = true
          }
        }

        return data
      },
    ],
  },
}
