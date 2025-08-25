#!/usr/bin/env node

/**
 * Debug script for product creation issues
 * Run with: node debug-product-creation.js
 */

const BASE_URL = 'http://localhost:3000'

async function debugProductCreation() {
  console.log('🔍 Debugging Product Creation Issues...\n')

  try {
    // Test 1: Check if products collection is accessible
    console.log('1. Testing products collection access...')
    const productsResponse = await fetch(`${BASE_URL}/api/products?depth=0&limit=1`)
    
    if (productsResponse.ok) {
      const productsData = await productsResponse.json()
      console.log('✅ Products collection accessible')
      console.log('   Total products:', productsData.totalDocs || 0)
    } else {
      console.log('❌ Products collection access failed:', productsResponse.status)
      const errorText = await productsResponse.text()
      console.log('   Error details:', errorText.substring(0, 200))
    }

    // Test 2: Check if media collection is accessible
    console.log('\n2. Testing media collection access...')
    const mediaResponse = await fetch(`${BASE_URL}/api/media?depth=0&limit=1`)
    
    if (mediaResponse.ok) {
      const mediaData = await mediaResponse.json()
      console.log('✅ Media collection accessible')
      console.log('   Total media items:', mediaData.totalDocs || 0)
    } else {
      console.log('❌ Media collection access failed:', mediaResponse.status)
      const errorText = await mediaResponse.text()
      console.log('   Error details:', errorText.substring(0, 200))
    }

    // Test 3: Test product creation with minimal data
    console.log('\n3. Testing product creation with minimal data...')
    const minimalProductData = {
      title: 'Test Product for Debugging',
      description: 'A test product to debug creation issues',
      sku: 'TEST-DEBUG-' + Date.now(),
      price: 29.99,
      images: [], // Empty images array
      status: 'draft'
    }

    const createResponse = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(minimalProductData),
    })

    if (createResponse.ok) {
      const createdProduct = await createResponse.json()
      console.log('✅ Product created successfully with minimal data')
      console.log('   Product ID:', createdProduct.data?.id)
      console.log('   Title:', createdProduct.data?.title)
      
      // Clean up
      const deleteResponse = await fetch(`${BASE_URL}/api/products/${createdProduct.data.id}`, {
        method: 'DELETE',
      })
      
      if (deleteResponse.ok) {
        console.log('✅ Test product cleaned up')
      } else {
        console.log('⚠️  Could not clean up test product')
      }
    } else {
      console.log('❌ Product creation failed:', createResponse.status)
      const errorText = await createResponse.text()
      console.log('   Error details:', errorText.substring(0, 200))
      
      // Try to parse JSON error
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.errors) {
          console.log('   Validation errors:')
          errorJson.errors.forEach((error, index) => {
            console.log(`     ${index + 1}. ${error.message}`)
            if (error.field) console.log(`        Field: ${error.field}`)
            if (error.validation) console.log(`        Validation: ${error.validation}`)
          })
        }
      } catch (e) {
        console.log('   Could not parse error response')
      }
    }

    // Test 4: Test product creation with image data
    console.log('\n4. Testing product creation with image data...')
    const productWithImageData = {
      title: 'Test Product with Image',
      description: 'A test product with image data',
      sku: 'TEST-IMG-' + Date.now(),
      price: 39.99,
      images: [
        {
          image: 'test-media-id', // This should fail validation
          alt: 'Test Image'
        }
      ],
      status: 'draft'
    }

    const createWithImageResponse = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productWithImageData),
    })

    if (createWithImageResponse.ok) {
      console.log('✅ Product created successfully with image data')
      const createdProduct = await createWithImageResponse.json()
      
      // Clean up
      await fetch(`${BASE_URL}/api/products/${createdProduct.data.id}`, { method: 'DELETE' })
      console.log('✅ Test product with image cleaned up')
    } else {
      console.log('❌ Product creation with image failed:', createWithImageResponse.status)
      const errorText = await createWithImageResponse.text()
      console.log('   Error details:', errorText.substring(0, 200))
    }

    // Test 5: Check admin panel product endpoint
    console.log('\n5. Testing admin product endpoint...')
    const adminProductResponse = await fetch(`${BASE_URL}/admin/collections/products`)
    
    if (adminProductResponse.ok) {
      console.log('✅ Admin product endpoint accessible')
    } else {
      console.log('❌ Admin product endpoint failed:', adminProductResponse.status)
    }

    console.log('\n🔍 Product Creation Debug Summary:')
    console.log('   - Products collection access: ' + (productsResponse.ok ? '✅' : '❌'))
    console.log('   - Media collection access: ' + (mediaResponse.ok ? '✅' : '❌'))
    console.log('   - Minimal product creation: ' + (createResponse.ok ? '✅' : '❌'))
    console.log('   - Product with image creation: ' + (createWithImageResponse.ok ? '✅' : '❌'))
    console.log('   - Admin product endpoint: ' + (adminProductResponse.ok ? '✅' : '❌'))

    if (createResponse.ok && createWithImageResponse.ok) {
      console.log('\n🎉 Product creation should work now!')
      console.log('   Try creating a product in the admin panel')
    } else {
      console.log('\n🔧 Issues detected:')
      console.log('   1. Check the validation errors above')
      console.log('   2. Verify media collection is working')
      console.log('   3. Check if required fields are missing')
      console.log('   4. Restart your development server')
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message)
    console.log('💡 Make sure your development server is running: npm run dev')
  }
}

// Run the debug
debugProductCreation()
