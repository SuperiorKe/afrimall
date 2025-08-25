// Simple test script to test product creation
const testProductCreation = async () => {
  try {
    // Test with the same data structure that Payload admin sends
    const formData = new FormData()
    formData.append('_payload', JSON.stringify({
      title: 'Test Product',
      description: 'A test product for testing the API',
      price: 29.99,
      sku: 'TEST-001',
      status: 'active',
      featured: false,
      categories: [],
      images: []
    }))

    console.log('Testing product creation...')
    
    const response = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      body: formData
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      const result = await response.json()
      console.log('Success:', result)
    } else {
      const error = await response.text()
      console.log('Error:', error)
    }
  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Run the test
testProductCreation()
