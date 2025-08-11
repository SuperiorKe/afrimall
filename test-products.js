// Test script to verify products API title field fix
const testProductsAPI = async () => {
  const baseUrl = 'http://localhost:3000/api/products'

  console.log('🧪 Testing Products API Title Field Fix...\n')

  // Test with Title field (capital T)
  try {
    console.log('1️⃣ Testing POST with Title field (capital T)')
    const formData = new FormData()
    formData.append('Title', 'Test Product with Capital T')
    formData.append('Description', 'Testing title field processing for products')
    formData.append('Status', 'active')
    formData.append('Price', '29.99')
    formData.append('SKU', 'TEST-PROD-001')
    formData.append('Featured', 'false')
    formData.append('SortOrder', '0')
    
    // Add required images field (mock data)
    formData.append('images[0][image]', 'mock-image-id-1')
    formData.append('images[0][alt]', 'Test product image')

    const response = await fetch(baseUrl, {
      method: 'POST',
      body: formData
    })

    const data = await response.json()
    console.log('✅ Title field test:', data.success ? 'Success' : 'Failed')
    if (data.success) {
      console.log('🆔 New product ID:', data.data.id)
      console.log('📝 Title:', data.data.title)
      console.log('💰 Price:', data.data.price)
    } else {
      console.log('❌ Error:', data.error)
    }
    console.log('')
  } catch (error) {
    console.log('❌ Title field test failed:', error.message)
  }

  // Test with title field (lowercase)
  try {
    console.log('2️⃣ Testing POST with title field (lowercase)')
    const formData = new FormData()
    formData.append('title', 'Test Product with lowercase t')
    formData.append('description', 'Testing lowercase title field for products')
    formData.append('status', 'active')
    formData.append('price', '19.99')
    formData.append('sku', 'TEST-PROD-002')
    formData.append('featured', 'false')
    formData.append('sortOrder', '0')
    
    // Add required images field (mock data)
    formData.append('images[0][image]', 'mock-image-id-2')
    formData.append('images[0][alt]', 'Test product image 2')

    const response = await fetch(baseUrl, {
      method: 'POST',
      body: formData
    })

    const data = await response.json()
    console.log('✅ Lowercase title test:', data.success ? 'Success' : 'Failed')
    if (data.success) {
      console.log('🆔 New product ID:', data.data.id)
      console.log('📝 Title:', data.data.title)
      console.log('💰 Price:', data.data.price)
    } else {
      console.log('❌ Error:', data.error)
    }
    console.log('')
  } catch (error) {
    console.log('❌ Lowercase title test failed:', error.message)
  }

  console.log('🏁 Products API title field testing completed!')
}

// Run the test
testProductsAPI().catch(console.error)
