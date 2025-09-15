import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    // Test 1: Get all categories
    const allCategories = await payload.find({
      collection: 'categories',
      limit: 100,
      depth: 0,
    })

    // Test 2: Get active categories only
    const activeCategories = await payload.find({
      collection: 'categories',
      where: {
        status: { equals: 'active' },
      },
      limit: 100,
      depth: 0,
    })

    // Test 3: Get categories with specific fields
    const categoriesWithFields = await payload.find({
      collection: 'categories',
      where: {
        status: { equals: 'active' },
      },
      limit: 100,
      depth: 0,
      fields: {
        id: true,
        title: true,
        slug: true,
        status: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        allCategories: {
          total: allCategories.totalDocs,
          docs: allCategories.docs.map((cat) => ({
            id: cat.id,
            title: cat.title,
            status: cat.status,
          })),
        },
        activeCategories: {
          total: activeCategories.totalDocs,
          docs: activeCategories.docs.map((cat) => ({
            id: cat.id,
            title: cat.title,
            status: cat.status,
          })),
        },
        categoriesWithFields: {
          total: categoriesWithFields.totalDocs,
          docs: categoriesWithFields.docs,
        },
      },
    })
  } catch (error) {
    console.error('Debug categories error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
