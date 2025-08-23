import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

// Remove unused imports since we're using local storage for now

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: ({ req: { user } }) => {
      // Only authenticated users with proper roles can create media
      if (!user || user.collection !== 'users') return false

      const userData = user as any
      return ['admin', 'editor', 'super_admin'].includes(userData.role)
    },
    delete: ({ req: { user } }) => {
      // Only authenticated users with proper roles can delete media
      if (!user || user.collection !== 'users') return false

      const userData = user as any
      return ['admin', 'editor', 'super_admin'].includes(userData.role)
    },
    read: ({ req: { user } }) => {
      // Allow public read access to media
      return true
    },
    update: ({ req: { user } }) => {
      // Only authenticated users with proper roles can update media
      if (!user || user.collection !== 'users') return false

      const userData = user as any
      return ['admin', 'editor', 'super_admin'].includes(userData.role)
    },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
      admin: {
        description: 'Alternative text for accessibility (optional)',
      },
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    // Use local storage for development
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
