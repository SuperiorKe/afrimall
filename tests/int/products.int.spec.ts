import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createMocks } from 'node-mocks-http'
import { GET, POST, PUT, DELETE } from '@/app/api/products/route'

// Mock the Payload CMS utilities
vi.mock('@payloadcms/next/utilities', () => ({
  getPayloadHMR: vi.fn(),
}))

// Mock the utilities
vi.mock('@/utilities/apiResponse', () => ({
  createSuccessResponse: vi.fn((data, status, message) => ({
    status,
    json: () => ({ success: true, data, message }),
  })),
  createErrorResponse: vi.fn((message, status, code) => ({
    status,
    json: () => ({ success: false, error: message, code }),
  })),
  withErrorHandling: vi.fn((handler) => handler),
  ApiError: class ApiError extends Error {
    constructor(message: string, public status: number, public code: string) {
      super(message)
      this.name = 'ApiError'
    }
  },
}))

vi.mock('@/utilities/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    apiError: vi.fn(),
  },
}))

describe('Products API Integration', () => {
  let mockPayload: any

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Setup mock payload
    mockPayload = {
      find: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByID: vi.fn(),
    }
    
    // Mock getPayloadHMR to return our mock
    const { getPayloadHMR } = require('@payloadcms/next/utilities')
    getPayloadHMR.mockResolvedValue(mockPayload)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('GET /api/products', () => {
    it('should fetch products with default parameters', async () => {
      const mockProducts = [
        { id: '1', title: 'Product 1', price: 100 },
        { id: '2', title: 'Product 2', price: 200 },
      ]
      
      mockPayload.find.mockResolvedValue({
        docs: mockProducts,
        totalDocs: 2,
        page: 1,
        limit: 12,
      })

      const { req } = createMocks({
        method: 'GET',
        url: '/api/products',
      })

      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockProducts)
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'products',
        where: { status: { equals: 'active' } },
        limit: 12,
        page: 1,
        sort: '-createdAt',
        populate: {
          categories: true,
          images: true,
        },
      })
    })

    it('should handle custom filters and pagination', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/products?page=2&limit=5&category=electronics&search=laptop&featured=true&minPrice=100&maxPrice=1000&status=active',
      })

      mockPayload.find.mockResolvedValue({
        docs: [],
        totalDocs: 0,
        page: 2,
        limit: 5,
      })

      const response = await GET(req)
      
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'products',
        where: {
          status: { equals: 'active' },
          categories: { in: ['electronics'] },
          or: [
            { title: { contains: 'laptop' } },
            { description: { contains: 'laptop' } },
            { 'tags.tag': { contains: 'laptop' } },
          ],
          featured: { equals: true },
          price: {
            greater_than_equal: 100,
            less_than_equal: 1000,
          },
        },
        limit: 5,
        page: 2,
        sort: '-createdAt',
        populate: {
          categories: true,
          images: true,
        },
      })
    })

    it('should validate and sanitize input parameters', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/products?page=-1&limit=200&sort=invalid&order=invalid',
      })

      mockPayload.find.mockResolvedValue({
        docs: [],
        totalDocs: 0,
        page: 1, // Should be clamped to 1
        limit: 100, // Should be clamped to 100
      })

      const response = await GET(req)
      
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'products',
        where: { status: { equals: 'active' } },
        limit: 100, // Clamped from 200
        page: 1, // Clamped from -1
        sort: '-createdAt', // Default sort since 'invalid' is not allowed
        populate: {
          categories: true,
          images: true,
        },
      })
    })
  })

  describe('POST /api/products', () => {
    it('should create a product with JSON data', async () => {
      const productData = {
        title: 'New Product',
        description: 'Product description',
        price: 99.99,
        status: 'active',
      }

      const createdProduct = { id: '123', ...productData }
      mockPayload.create.mockResolvedValue(createdProduct)

      const { req } = createMocks({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(productData),
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(createdProduct)
      expect(mockPayload.create).toHaveBeenCalledWith({
        collection: 'products',
        data: productData,
      })
    })

    it('should handle form data from admin panel', async () => {
      const formData = new FormData()
      formData.append('title', 'Form Product')
      formData.append('description', 'Form description')
      formData.append('price', '149.99')
      formData.append('featured', 'true')
      formData.append('categories', 'cat1,cat2')

      const expectedData = {
        title: 'Form Product',
        description: 'Form description',
        price: 149.99,
        featured: true,
        categories: ['cat1', 'cat2'],
      }

      const createdProduct = { id: '456', ...expectedData }
      mockPayload.create.mockResolvedValue(createdProduct)

      const { req } = createMocks({
        method: 'POST',
        headers: { 'content-type': 'multipart/form-data' },
        body: formData,
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
    })

    it('should validate required fields', async () => {
      const invalidData = {
        description: 'No title provided',
        price: -10, // Invalid price
      }

      const { req } = createMocks({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(invalidData),
      })

      // Should throw validation error
      await expect(POST(req)).rejects.toThrow('Validation failed')
    })
  })

  describe('PUT /api/products', () => {
    it('should update an existing product', async () => {
      const updateData = {
        title: 'Updated Product',
        price: 199.99,
      }

      const updatedProduct = { id: '123', ...updateData }
      mockPayload.findByID.mockResolvedValue({ id: '123', title: 'Old Title' })
      mockPayload.update.mockResolvedValue(updatedProduct)

      const { req } = createMocks({
        method: 'PUT',
        url: '/api/products?id=123',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      const response = await PUT(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(updatedProduct)
      expect(mockPayload.update).toHaveBeenCalledWith({
        collection: 'products',
        id: '123',
        data: updateData,
      })
    })

    it('should return 404 for non-existent product', async () => {
      mockPayload.findByID.mockRejectedValue(new Error('Not found'))

      const { req } = createMocks({
        method: 'PUT',
        url: '/api/products?id=999',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: 'Updated' }),
      })

      await expect(PUT(req)).rejects.toThrow('Product not found')
    })
  })

  describe('DELETE /api/products', () => {
    it('should delete an existing product', async () => {
      const existingProduct = { id: '123', title: 'Product to Delete' }
      mockPayload.findByID.mockResolvedValue(existingProduct)
      mockPayload.delete.mockResolvedValue(undefined)

      const { req } = createMocks({
        method: 'DELETE',
        url: '/api/products?id=123',
      })

      const response = await DELETE(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.message).toBe('Product deleted successfully')
      expect(mockPayload.delete).toHaveBeenCalledWith({
        collection: 'products',
        id: '123',
      })
    })

    it('should return 404 for non-existent product', async () => {
      mockPayload.findByID.mockRejectedValue(new Error('Not found'))

      const { req } = createMocks({
        method: 'DELETE',
        url: '/api/products?id=999',
      })

      await expect(DELETE(req)).rejects.toThrow('Product not found')
    })
  })
})
