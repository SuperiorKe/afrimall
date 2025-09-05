import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from '@/fields/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: ({ req: { user } }) => {
      // Temporarily allow access for debugging - TODO: Restore proper authentication
      return true
      // Only authenticated users with proper roles can create categories
      // if (!user || user.collection !== 'users') return false
      // const userData = user as any
      // return ['admin', 'editor', 'super_admin'].includes(userData.role)
    },
    delete: ({ req: { user } }) => {
      // Only authenticated users with proper roles can delete categories
      if (!user || user.collection !== 'users') return false

      const userData = user as any
      return ['admin', 'editor', 'super_admin'].includes(userData.role)
    },
    read: ({ req: { user } }) => {
      // Allow public read access to categories
      return true
    },
    update: ({ req: { user } }) => {
      // Temporarily allow access for debugging - TODO: Restore proper authentication
      return true
      // Only authenticated users with proper roles can update categories
      // if (!user || user.collection !== 'users') return false
      // const userData = user as any
      // return ['admin', 'editor', 'super_admin'].includes(userData.role)
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'parent', 'status', 'sortOrder'],
    group: 'E-commerce',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Category name',
      },
    },
    ...slugField(),
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Category description for SEO and display',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        description: 'Parent category (for hierarchical structure)',
        position: 'sidebar',
      },
      filterOptions: ({ id }) => {
        return {
          id: {
            not_equals: id, // Prevent self-referencing
          },
        }
      },
      // TODO: Add proper validation logic with correct Payload types
      // validate: (value, options) => {
      //   // Skip validation during creation when id doesn't exist yet
      //   if (options.operation === 'create') {
      //     return true
      //   }
      //   // Prevent circular references for updates
      //   if (value === options.id) {
      //     return 'A category cannot be its own parent'
      //   }
      //   return true
      // },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Category image/icon',
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
        description: 'Category visibility status',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Feature this category on homepage',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Sort order (lower numbers appear first)',
      },
    },
    {
      name: 'breadcrumbPath',
      type: 'text',
      admin: {
        description: 'Auto-generated breadcrumb path (Home > Parent > Current)',
        readOnly: true,
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
            description: 'SEO title (leave empty to use category title)',
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
      async ({ data, req, operation }) => {
        // Auto-generate SEO title if not provided
        if (!data.seo?.title && data.title) {
          data.seo = { ...data.seo, title: data.title }
        }

        // Auto-generate SEO description if not provided
        if (!data.seo?.description && data.description) {
          data.seo = { ...data.seo, description: data.description }
        }

        // Generate breadcrumb path only if we have access to req.payload
        if (req?.payload && data.parent) {
          try {
            const breadcrumbParts = []
            let currentParentId = data.parent

            // Build breadcrumb trail
            while (currentParentId) {
              try {
                const parentCategory = await req.payload.findByID({
                  collection: 'categories',
                  id: currentParentId,
                  depth: 0,
                })

                if (parentCategory) {
                  breadcrumbParts.unshift(parentCategory.title)
                  currentParentId = parentCategory.parent
                } else {
                  break
                }
              } catch (error) {
                // If parent not found, break the loop
                console.warn('Parent category not found during breadcrumb generation:', error)
                break
              }
            }

            // Add current category to breadcrumb path
            if (data.title) {
              breadcrumbParts.push(data.title)
            }

            // Create breadcrumb path string
            data.breadcrumbPath =
              breadcrumbParts.length > 0 ? `Home > ${breadcrumbParts.join(' > ')}` : 'Home'
          } catch (error) {
            // If breadcrumb generation fails, set a default
            console.warn('Breadcrumb generation failed:', error)
            data.breadcrumbPath = data.title ? `Home > ${data.title}` : 'Home'
          }
        } else {
          // Set default breadcrumb path
          data.breadcrumbPath = data.title ? `Home > ${data.title}` : 'Home'
        }

        return data
      },
    ],
  },
}
