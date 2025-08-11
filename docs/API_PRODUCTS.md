# Products API Documentation

This document describes the Products API endpoints for the Afrimall e-commerce platform.

## Base URL
```
/api/products
```

## Authentication
- **GET**: No authentication required (public)
- **POST, PUT, DELETE**: Requires authentication (admin/editor role)

## Endpoints

### 1. GET /api/products
Fetch products with filtering, pagination, and search capabilities.

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (1-based, clamped to 1-∞) |
| `limit` | number | 12 | Items per page (clamped to 1-100) |
| `category` | string | - | Filter by category ID |
| `search` | string | - | Search in title, description, and tags |
| `sort` | string | `createdAt` | Sort field: `title`, `price`, `createdAt`, `updatedAt`, `featured`, `sortOrder` |
| `order` | string | `desc` | Sort order: `asc` or `desc` |
| `featured` | boolean | - | Filter featured products (`true`/`false`) |
| `minPrice` | number | - | Minimum price filter |
| `maxPrice` | number | - | Maximum price filter |
| `status` | string | `active` | Product status: `active`, `draft`, `archived` |

#### Example Requests

**Basic fetch:**
```bash
GET /api/products
```

**With filters:**
```bash
GET /api/products?page=2&limit=20&category=electronics&search=laptop&featured=true&minPrice=100&maxPrice=1000&status=active
```

**Sort by price ascending:**
```bash
GET /api/products?sort=price&order=asc
```

#### Response Format
```json
{
  "success": true,
  "data": [
    {
      "id": "product_id",
      "title": "Product Name",
      "description": "Product description",
      "price": 99.99,
      "status": "active",
      "featured": false,
      "categories": ["category_id"],
      "images": [
        {
          "id": "image_id",
          "url": "image_url",
          "alt": "Image alt text"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Products fetched successfully"
}
```

### 2. POST /api/products
Create a new product.

#### Request Body
Supports both JSON and form data formats.

**JSON Example:**
```json
{
  "title": "New Product",
  "description": "Product description",
  "price": 99.99,
  "status": "active",
  "featured": false,
  "categories": ["category_id_1", "category_id_2"],
  "sku": "PROD-001",
  "tags": ["tag1", "tag2"]
}
```

**Form Data Example:**
```bash
curl -X POST /api/products \
  -F "title=New Product" \
  -F "description=Product description" \
  -F "price=99.99" \
  -F "status=active" \
  -F "featured=true" \
  -F "categories=cat1,cat2"
```

#### Required Fields
- `title`: String (max 200 chars)
- `description`: String (max 2000 chars)

#### Optional Fields
- `price`: Number (positive)
- `status`: `active`, `draft`, or `archived`
- `featured`: Boolean
- `categories`: Array of category IDs
- `sku`: String
- `tags`: Array of strings
- `images`: Array of image objects

#### Response Format
```json
{
  "success": true,
  "data": {
    "id": "new_product_id",
    "title": "New Product",
    // ... other fields
  },
  "message": "Product created successfully"
}
```

### 3. PUT /api/products?id={product_id}
Update an existing product.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Product ID to update |

#### Request Body
Same format as POST, but all fields are optional. Only provided fields will be updated.

**Example:**
```json
{
  "title": "Updated Product Title",
  "price": 149.99,
  "featured": true
}
```

#### Response Format
```json
{
  "success": true,
  "data": {
    "id": "product_id",
    "title": "Updated Product Title",
    "price": 149.99,
    "featured": true,
    // ... other fields
  },
  "message": "Product updated successfully"
}
```

### 4. DELETE /api/products?id={product_id}
Delete a product.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Product ID to delete |

#### Response Format
```json
{
  "success": true,
  "data": {
    "message": "Product deleted successfully",
    "productId": "deleted_product_id"
  },
  "message": "Product deleted successfully"
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `PRODUCT_NOT_FOUND`: Product with specified ID doesn't exist
- `MISSING_ID`: Product ID not provided for update/delete operations
- `INVALID_CONTENT_TYPE`: Unsupported content type
- `PAYLOAD_CREATE_ERROR`: Database creation error
- `PAYLOAD_UPDATE_ERROR`: Database update error
- `PAYLOAD_DELETE_ERROR`: Database deletion error

### HTTP Status Codes
- `200`: Success (GET, PUT, DELETE)
- `201`: Created (POST)
- `400`: Bad Request
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

## Field Normalization

The API automatically handles case sensitivity in field names:
- `Title` → `title`
- `Description` → `description`
- `Status` → `status`
- `Price` → `price`
- `Categories` → `categories`
- `Featured` → `featured`

## Form Data Handling

When using form data (e.g., from admin panel):
- Boolean fields: `"true"`/`"1"` → `true`, other values → `false`
- Number fields: Automatically converted from strings
- Array fields: Comma-separated strings automatically split into arrays
- Image arrays: Handles nested form field notation (`images[0][alt]`)

## Best Practices

1. **Pagination**: Use reasonable `limit` values (12-50) to avoid performance issues
2. **Search**: Trim search queries and use specific terms for better results
3. **Filtering**: Combine multiple filters for precise product selection
4. **Error Handling**: Always check the `success` field and handle errors gracefully
5. **Authentication**: Ensure proper authentication for write operations

## Rate Limiting

Currently no rate limiting implemented, but consider implementing for production use.

## Examples

### Frontend React Example
```typescript
import axios from 'axios'

// Fetch products
const fetchProducts = async (filters = {}) => {
  const params = new URLSearchParams(filters)
  const response = await axios.get(`/api/products?${params}`)
  return response.data
}

// Create product
const createProduct = async (productData: any) => {
  const response = await axios.post('/api/products', productData)
  return response.data
}

// Update product
const updateProduct = async (id: string, updates: any) => {
  const response = await axios.put(`/api/products?id=${id}`, updates)
  return response.data
}

// Delete product
const deleteProduct = async (id: string) => {
  const response = await axios.delete(`/api/products?id=${id}`)
  return response.data
}
```

### cURL Examples

**Create product:**
```bash
curl -X POST /api/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sample Product",
    "description": "A sample product description",
    "price": 29.99,
    "status": "active"
  }'
```

**Update product:**
```bash
curl -X PUT "/api/products?id=product_id" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 39.99,
    "featured": true
  }'
```

**Delete product:**
```bash
curl -X DELETE "/api/products?id=product_id"
```
