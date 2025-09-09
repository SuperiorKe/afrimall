import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
// Media collection configuration for S3 storage

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
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
      // Allow public read access to media
      return true
    },
    update: ({ req: { user } }) => {
      // Temporarily allow all access for debugging - TODO: Restore proper authentication
      return true
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
    {
      name: 'prefix',
      type: 'text',
      required: false,
      admin: {
        description: 'Storage prefix for S3 (automatically set)',
        readOnly: true,
      },
    },
  ],
  upload: {
    // Configure upload settings for both S3 and local storage
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
    // Use local storage for development when S3 is not configured
    ...(process.env.NODE_ENV === 'development' && !process.env.AWS_S3_BUCKET
      ? {
          staticDir: path.resolve(dirname, '../../public/media'),
        }
      : {}),
  },
}
