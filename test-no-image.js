// Test script to verify products API without images field
const testNoImage = async () => {
  const baseUrl = 'http://localhost:3000/api/products'

  console.log('🧪 Testing Product Creation Without Images...\n')

  try {
    console.log('Testing POST without images field')
    const formData = new FormData()
    formData.append('title', 'Test Product No Image')
    formData.append('description', 'A test product without images')
    formData.append('price', '15.99')
    formData.append('sku', 'NO-IMG-001')
    formData.append('status', 'draft')

    console.log('FormData entries:')
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`)
    }

    const response = await fetch(baseUrl, {
      method: 'POST',
      body: formData
    })

    console.log('Response status:', response.status)

    const data = await response.json()
    console.log('Response data:', JSON.stringify(data, null, 2))

    if (data.success) {
      console.log('✅ Product created successfully without images!')
      console.log('🆔 ID:', data.data.id)
      console.log('📝 Title:', data.data.title)
    } else {
      console.log('❌ Failed to create product')
      console.log('Error:', data.error)
    }
  } catch (error) {
    console.log('❌ Test failed with error:', error.message)
  }

  console.log('\n🏁 No-image product test completed!')
}

// Run the test
testNoImage().catch(console.error)
