import type { CollectionConfig } from 'payload'

export const PayloadPreferences: CollectionConfig = {
  slug: 'payload-preferences',
  access: {
    read: ({ req: { user } }) => {
      // Users can read their own preferences
      if (user) return true
      return false
    },
    create: ({ req: { user } }) => {
      // Users can create their own preferences
      if (user) return true
      return false
    },
    update: ({ req: { user } }) => {
      // Users can update their own preferences
      if (user) return true
      return false
    },
    delete: ({ req: { user } }) => {
      // Users can delete their own preferences
      if (user) return true
      return false
    },
  },
  admin: {
    useAsTitle: 'key',
    defaultColumns: ['key', 'collection', 'user'],
    hidden: true, // Hide from admin interface since it's auto-managed
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
    },
    {
      name: 'value',
      type: 'json',
      required: true,
    },
    {
      name: 'collection',
      type: 'text',
      required: false,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: false,
    },
  ],
  timestamps: true,
}
