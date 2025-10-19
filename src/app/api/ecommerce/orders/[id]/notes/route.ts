import { NextRequest } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { createSuccessResponse, withErrorHandling, ApiError } from '@/lib/api/apiResponse'
import { logger } from '@/lib/api/logger'

// POST endpoint for adding order notes
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(
    async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
      try {
        const body = await request.json()
        const payload = await getPayloadHMR({ config: configPromise })
        const { id: orderId } = await params

        const {
          type = 'internal', // 'internal' or 'customer'
          content,
          author = 'admin',
          isVisibleToCustomer = false,
        } = body

        // Validate required fields
        if (!content || content.trim().length === 0) {
          throw new ApiError('Note content is required', 400, 'MISSING_CONTENT')
        }

        // Get the order
        const order = await payload.findByID({
          collection: 'orders',
          id: orderId,
        })

        if (!order) {
          throw new ApiError('Order not found', 404, 'NOT_FOUND')
        }

        // Create new note
        const newNote = {
          id: Date.now().toString(),
          type,
          content: content.trim(),
          author,
          isVisibleToCustomer,
          createdAt: new Date().toISOString(),
        }

        // Get existing notes
        const existingNotes = (order.notes as unknown as any[]) || []
        const updatedNotes = [...existingNotes, newNote]

        // Update order with new note
        const updatedOrder = await payload.update({
          collection: 'orders',
          id: orderId,
          data: {
            notes: updatedNotes as any,
            metadata: {
              ...(order as any).metadata,
              updatedAt: new Date().toISOString(),
              updatedBy: author,
              lastNoteAdded: new Date().toISOString(),
            },
          } as any,
        })

        logger.info('Order note added successfully', 'API:orders:notes', {
          orderId: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          noteId: newNote.id,
          noteType: type,
          author,
          isVisibleToCustomer,
        })

        return createSuccessResponse(
          {
            note: newNote,
            order: updatedOrder,
          },
          201,
          'Order note added successfully',
        )
      } catch (error) {
        if (error instanceof ApiError) {
          throw error
        }

        const { id } = await params
        logger.apiError('Error adding order note', `/api/orders/${id}/notes`, error as Error)
        throw new ApiError('Failed to add order note', 500, 'ADD_NOTE_ERROR')
      }
    },
  )(request, { params })
}

// GET endpoint for retrieving order notes
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(
    async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
      try {
        const { searchParams } = new URL(request.url)
        const payload = await getPayloadHMR({ config: configPromise })
        const { id: orderId } = await params

        const type = searchParams.get('type') // 'internal', 'customer', or null for all
        const includeInternal = searchParams.get('includeInternal') !== 'false'

        // Get the order
        const order = await payload.findByID({
          collection: 'orders',
          id: orderId,
        })

        if (!order) {
          throw new ApiError('Order not found', 404, 'NOT_FOUND')
        }

        // Filter notes based on parameters
        let notes = (order.notes as unknown as any[]) || []

        if (type) {
          notes = notes.filter((note: any) => note.type === type)
        }

        if (!includeInternal) {
          notes = notes.filter((note: any) => note.isVisibleToCustomer)
        }

        // Sort notes by creation date (newest first)
        notes = notes.sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )

        return createSuccessResponse(
          {
            notes,
            total: notes.length,
            orderId: order.id,
            orderNumber: order.orderNumber,
          },
          200,
          'Order notes retrieved successfully',
        )
      } catch (error) {
        if (error instanceof ApiError) {
          throw error
        }

        const { id } = await params
        logger.apiError('Error retrieving order notes', `/api/orders/${id}/notes`, error as Error)
        throw new ApiError('Failed to retrieve order notes', 500, 'RETRIEVE_NOTES_ERROR')
      }
    },
  )(request, { params })
}

// PUT endpoint for updating an order note
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(
    async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
      try {
        const body = await request.json()
        const payload = await getPayloadHMR({ config: configPromise })
        const { id: orderId } = await params

        const { noteId, content, isVisibleToCustomer } = body

        // Validate required fields
        if (!noteId) {
          throw new ApiError('Note ID is required', 400, 'MISSING_NOTE_ID')
        }

        if (!content || content.trim().length === 0) {
          throw new ApiError('Note content is required', 400, 'MISSING_CONTENT')
        }

        // Get the order
        const order = await payload.findByID({
          collection: 'orders',
          id: orderId,
        })

        if (!order) {
          throw new ApiError('Order not found', 404, 'NOT_FOUND')
        }

        // Find and update the note
        const notes = (order.notes as unknown as any[]) || []
        const noteIndex = notes.findIndex((note: any) => note.id === noteId)

        if (noteIndex === -1) {
          throw new ApiError('Note not found', 404, 'NOTE_NOT_FOUND')
        }

        // Update the note
        const updatedNote = {
          ...notes[noteIndex],
          content: content.trim(),
          isVisibleToCustomer:
            isVisibleToCustomer !== undefined
              ? isVisibleToCustomer
              : notes[noteIndex].isVisibleToCustomer,
          updatedAt: new Date().toISOString(),
        }

        notes[noteIndex] = updatedNote

        // Update order with modified notes
        const updatedOrder = await payload.update({
          collection: 'orders',
          id: orderId,
          data: {
            notes: notes as any,
            metadata: {
              ...(order as any).metadata,
              updatedAt: new Date().toISOString(),
              updatedBy: 'admin',
              lastNoteUpdated: new Date().toISOString(),
            },
          } as any,
        })

        logger.info('Order note updated successfully', 'API:orders:notes', {
          orderId: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          noteId,
        })

        return createSuccessResponse(
          {
            note: updatedNote,
            order: updatedOrder,
          },
          200,
          'Order note updated successfully',
        )
      } catch (error) {
        if (error instanceof ApiError) {
          throw error
        }

        const { id } = await params
        logger.apiError('Error updating order note', `/api/orders/${id}/notes`, error as Error)
        throw new ApiError('Failed to update order note', 500, 'UPDATE_NOTE_ERROR')
      }
    },
  )(request, { params })
}

// DELETE endpoint for deleting an order note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandling(
    async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
      try {
        const { searchParams } = new URL(request.url)
        const payload = await getPayloadHMR({ config: configPromise })
        const { id: orderId } = await params

        const noteId = searchParams.get('noteId')

        if (!noteId) {
          throw new ApiError('Note ID is required', 400, 'MISSING_NOTE_ID')
        }

        // Get the order
        const order = await payload.findByID({
          collection: 'orders',
          id: orderId,
        })

        if (!order) {
          throw new ApiError('Order not found', 404, 'NOT_FOUND')
        }

        // Find and remove the note
        const notes = (order.notes as unknown as any[]) || []
        const noteIndex = notes.findIndex((note: any) => note.id === noteId)

        if (noteIndex === -1) {
          throw new ApiError('Note not found', 404, 'NOTE_NOT_FOUND')
        }

        const deletedNote = notes[noteIndex]
        notes.splice(noteIndex, 1)

        // Update order with modified notes
        const updatedOrder = await payload.update({
          collection: 'orders',
          id: orderId,
          data: {
            notes: notes as any,
            metadata: {
              ...(order as any).metadata,
              updatedAt: new Date().toISOString(),
              updatedBy: 'admin',
              lastNoteDeleted: new Date().toISOString(),
            },
          } as any,
        })

        logger.info('Order note deleted successfully', 'API:orders:notes', {
          orderId: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          noteId,
        })

        return createSuccessResponse(
          {
            deletedNote,
            order: updatedOrder,
          },
          200,
          'Order note deleted successfully',
        )
      } catch (error) {
        if (error instanceof ApiError) {
          throw error
        }

        const { id } = await params
        logger.apiError('Error deleting order note', `/api/orders/${id}/notes`, error as Error)
        throw new ApiError('Failed to delete order note', 500, 'DELETE_NOTE_ERROR')
      }
    },
  )(request, { params })
}
