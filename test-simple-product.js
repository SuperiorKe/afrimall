// Simple test script to verify products API basic functionality
const testSimpleProduct = async () => {
  const baseUrl = 'http://localhost:3000/api/products'

  console.log('🧪 Testing Simple Product Creation...\n')

  try {
    console.log('Testing POST with minimal required fields')
    const formData = new FormData()
    formData.append('title', 'Simple Test Product')
    formData.append('description', 'A simple test product')
    formData.append('price', '9.99')
    formData.append('sku', 'SIMPLE-001')
    formData.append('status', 'draft')
    
    // Add a simple image reference
    formData.append('images[0][image]', 'test-image-id')
    formData.append('images[0][alt]', 'Test image')

    console.log('FormData entries:')
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`)
    }

    const response = await fetch(baseUrl, {
      method: 'POST',
      body: formData
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    const data = await response.json()
    console.log('Response data:', JSON.stringify(data, null, 2))

    if (data.success) {
      console.log('✅ Product created successfully!')
      console.log('🆔 ID:', data.data.id)
      console.log('📝 Title:', data.data.title)
    } else {
      console.log('❌ Failed to create product')
      console.log('Error:', data.error)
    }
  } catch (error) {
    console.log('❌ Test failed with error:', error.message)
    console.log('Error details:', error)
  }

  console.log('\n🏁 Simple product test completed!')
}

// Run the test
testSimpleProduct().catch(console.error)
