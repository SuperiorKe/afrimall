import { NextRequest } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import {
  createSuccessResponse,
  createErrorResponse,
  withErrorHandling,
  ApiError,
} from '@/utilities/apiResponse'
import { logger } from '@/utilities/logger'

export const DELETE = withErrorHandling(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id: categoryId } = await params

    try {
      const payload = await getPayloadHMR({ config: configPromise })
      const { searchParams } = new URL(request.url)
      const force = searchParams.get('force') === 'true'

      logger.info('Starting category deletion', 'API:categories/[id]', {
        categoryId,
        force,
      })

      // First, check if category exists
      const existingCategory = await payload.findByID({
        collection: 'categories',
        id: categoryId,
      })

      if (!existingCategory) {
        throw new ApiError('Category not found', 404, 'NOT_FOUND')
      }

      // Check for child categories (unless force delete)
      if (!force) {
        const childCategories = await payload.find({
          collection: 'categories',
          where: {
            parent: { equals: categoryId },
          },
          limit: 1,
        })

        if (childCategories.docs.length > 0) {
          throw new ApiError(
            `Cannot delete category '${existingCategory.title}' - it has child categories. Delete child categories first or use force=true`,
            400,
            'HAS_CHILDREN',
          )
        }

        // Check for products in this category
        const productsInCategory = await payload.find({
          collection: 'products',
          where: {
            categories: {
              contains: categoryId,
            },
          },
          limit: 1,
        })

        if (productsInCategory.docs.length > 0) {
          throw new ApiError(
            `Cannot delete category '${existingCategory.title}' - it has products. Move products to another category first or use force=true`,
            400,
            'HAS_PRODUCTS',
          )
        }
      }

      // If force delete and there were products, remove category reference from products
      if (force) {
        try {
          // Find products in this category and remove the category reference
          const productsToUpdate = await payload.find({
            collection: 'products',
            where: {
              categories: {
                contains: categoryId,
              },
            },
            limit: 1000, // Adjust based on your needs
          })

          for (const product of productsToUpdate.docs) {
            const updatedCategories = Array.isArray(product.categories)
              ? product.categories.filter((cat: any) => cat !== categoryId)
              : []

            await payload.update({
              collection: 'products',
              id: product.id,
              data: {
                categories: updatedCategories,
              },
            })
          }

          if (productsToUpdate.docs.length > 0) {
            logger.info('Removed category reference from products', 'API:categories/[id]', {
              categoryId,
              productCount: productsToUpdate.docs.length,
            })
          }
        } catch (updateError) {
          logger.error(
            'Error updating products after category deletion',
            'API:categories/[id]',
            updateError as Error,
          )
          // Continue with deletion even if product update fails
        }
      }

      // Delete the category
      const deletedCategory = await payload.delete({
        collection: 'categories',
        id: categoryId,
      })

      logger.info('Category deleted successfully', 'API:categories/[id]', {
        categoryId: deletedCategory.id,
        title: deletedCategory.title,
      })

      return createSuccessResponse(
        {
          id: deletedCategory.id,
          title: deletedCategory.title,
          deletedAt: new Date().toISOString(),
        },
        200,
        'Category deleted successfully',
      )
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      logger.apiError('Error deleting category', `/api/categories/${categoryId}`, error as Error)
      throw new ApiError('Failed to delete category', 500, 'DELETE_ERROR')
    }
  },
)
