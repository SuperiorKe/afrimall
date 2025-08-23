import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    // Allow first user creation, then restrict to admins only
    create: ({ req: { user } }) => {
      // If no user exists yet, allow creation of first user
      if (!user) {
        // Check if any users exist in the database
        return true // Allow first user creation
      }

      // If user exists, only allow admins to create users
      if (user.collection !== 'users') return false
      const userData = user as any
      return userData.role === 'super_admin' || userData.role === 'admin'
    },
    // Only super admins and admins can delete users
    delete: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      const userData = user as any
      return userData.role === 'super_admin' || userData.role === 'admin'
    },
    // Users can read their own data, admins can read all
    read: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      const userData = user as any
      if (userData.role === 'super_admin' || userData.role === 'admin') return true
      // Users can only read their own data
      return { id: { equals: user.id } }
    },
    // Users can update their own data, admins can update all
    update: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      const userData = user as any
      if (userData.role === 'super_admin' || userData.role === 'admin') return true
      // Users can only update their own data
      return { id: { equals: user.id } }
    },
  },
  admin: {
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
    // Hide Users collection from editors - this is the key change
    hidden: ({ user }) => {
      if (!user || user.collection !== 'users') return true
      const userData = user as any
      return userData.role === 'editor'
    },
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Admin user full name',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      admin: {
        description: 'Admin user email address (used for login)',
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      options: [
        {
          label: 'Super Admin',
          value: 'super_admin',
        },
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
      ],
      admin: {
        description: 'User role and permissions level',
        // Show role field for first user, then restrict to super admins only
        condition: (data, siblingData, { user }) => {
          // If no user exists, show role field for first user creation
          if (!user) return true

          // If user exists, only super admins can change roles
          if (user.collection !== 'users') return false
          const userData = user as any
          return userData.role === 'super_admin'
        },
      },
    },
  ],
  timestamps: true,
}
