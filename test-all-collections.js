#!/usr/bin/env node

/**
 * Comprehensive test for all collections
 * Run with: node test-all-collections.js
 */

const BASE_URL = 'http://localhost:3000'

async function testAllCollections() {
  console.log('🧪 Testing All Collections Access Control...\n')

  const collections = [
    { name: 'Media', endpoint: '/api/media' },
    { name: 'Products', endpoint: '/api/products' },
    { name: 'Categories', endpoint: '/api/categories' },
    { name: 'Users', endpoint: '/api/users' },
  ]

  const results = {}

  for (const collection of collections) {
    console.log(`Testing ${collection.name} collection...`)

    try {
      // Test read access
      const readResponse = await fetch(`${collection.endpoint}?depth=0&limit=1`)
      results[collection.name] = {
        read: readResponse.ok,
        readStatus: readResponse.status,
        readError: readResponse.ok
          ? null
          : await readResponse.text().then((t) => t.substring(0, 100)),
      }

      // Test create access (with minimal data)
      let createData = {}
      if (collection.name === 'Products') {
        createData = {
          title: `Test ${collection.name}`,
          description: 'Test description',
          sku: `TEST-${Date.now()}`,
          price: 19.99,
          status: 'draft',
        }
      } else if (collection.name === 'Categories') {
        createData = {
          title: `Test ${collection.name}`,
          status: 'active',
        }
      } else if (collection.name === 'Media') {
        createData = {
          alt: `Test ${collection.name}`,
        }
      }

      if (Object.keys(createData).length > 0) {
        const createResponse = await fetch(collection.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createData),
        })

        results[collection.name].create = createResponse.ok
        results[collection.name].createStatus = createResponse.status

        if (createResponse.ok) {
          const created = await createResponse.json()
          results[collection.name].createdId = created.data?.id

          // Clean up
          await fetch(`${collection.endpoint}/${created.data.id}`, { method: 'DELETE' })
          console.log(`  ✅ ${collection.name}: Created and cleaned up`)
        } else {
          results[collection.name].createError = await createResponse
            .text()
            .then((t) => t.substring(0, 100))
          console.log(`  ❌ ${collection.name}: Create failed - ${createResponse.status}`)
        }
      }
    } catch (error) {
      results[collection.name] = {
        error: error.message,
      }
      console.log(`  ❌ ${collection.name}: Error - ${error.message}`)
    }
  }

  // Summary
  console.log('\n📊 Collection Access Test Results:')
  console.log('=====================================')

  Object.entries(results).forEach(([name, result]) => {
    if (result.error) {
      console.log(`❌ ${name}: ${result.error}`)
    } else {
      const readStatus = result.read ? '✅' : '❌'
      const createStatus = result.create ? '✅' : '❌'
      console.log(`${readStatus} ${name}:`)
      console.log(`   Read: ${result.read ? 'OK' : `${result.readStatus} - ${result.readError}`}`)
      if (result.create !== undefined) {
        console.log(
          `   Create: ${result.create ? 'OK' : `${result.createStatus} - ${result.createError}`}`,
        )
      }
    }
  })

  // Recommendations
  console.log('\n💡 Recommendations:')
  const failedCollections = Object.entries(results).filter(
    ([name, result]) => result.error || !result.read || !result.create,
  )

  if (failedCollections.length === 0) {
    console.log('🎉 All collections are working properly!')
    console.log('   Try creating a product in the admin panel now')
  } else {
    console.log('🔧 Issues detected in:')
    failedCollections.forEach(([name]) => console.log(`   - ${name}`))
    console.log('\n   Solutions:')
    console.log('   1. Restart your development server')
    console.log('   2. Check server console for debug logs')
    console.log('   3. Verify all collection access controls are updated')
  }
}

// Run the test
testAllCollections()
