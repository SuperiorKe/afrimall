#!/usr/bin/env node

/**
 * Debug script for image upload issues
 * Run with: node debug-image-upload.js
 */

const BASE_URL = 'http://localhost:3000'

async function debugImageUpload() {
  console.log('🔍 Debugging Image Upload Issues...\n')

  try {
    // Test 1: Check if admin panel is accessible
    console.log('1. Testing admin panel accessibility...')
    const adminResponse = await fetch(`${BASE_URL}/admin`)

    if (adminResponse.ok) {
      console.log('✅ Admin panel is accessible')
    } else {
      console.log('❌ Admin panel returned:', adminResponse.status)
    }

    // Test 2: Check if we can access the media API
    console.log('\n2. Testing media API access...')
    const mediaResponse = await fetch(`${BASE_URL}/api/media?depth=0&fallback-locale=null`)

    if (mediaResponse.ok) {
      console.log('✅ Media API is accessible')
      const mediaData = await mediaResponse.json()
      console.log('   Media count:', mediaData.totalDocs || 'Unknown')
    } else {
      console.log('❌ Media API returned:', mediaResponse.status)
      const errorText = await mediaResponse.text()
      console.log('   Error details:', errorText.substring(0, 200))
    }

    // Test 3: Check environment variables
    console.log('\n3. Checking environment configuration...')
    const envResponse = await fetch(`${BASE_URL}/api/health`)

    if (envResponse.ok) {
      const envData = await envResponse.json()
      console.log('✅ Health check passed')
      console.log('   Environment:', envData.data?.environment || 'Unknown')
      console.log('   Database:', envData.data?.database || 'Unknown')
    } else {
      console.log('❌ Health check failed:', envResponse.status)
    }

    // Test 4: Check if we can create a simple media entry (without file)
    console.log('\n4. Testing media creation permissions...')
    const testMediaData = {
      alt: 'Test Image',
      caption: 'Test caption for debugging',
    }

    const createResponse = await fetch(`${BASE_URL}/api/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMediaData),
    })

    if (createResponse.ok) {
      console.log('✅ Media creation API is accessible')
    } else {
      console.log('❌ Media creation failed:', createResponse.status)
      const errorText = await createResponse.text()
      console.log('   Error details:', errorText.substring(0, 200))
    }

    // Test 5: Check authentication status
    console.log('\n5. Testing authentication...')
    const authResponse = await fetch(`${BASE_URL}/api/users/me`)

    if (authResponse.ok) {
      const authData = await authResponse.json()
      console.log('✅ Authentication working')
      console.log('   User:', authData.data?.email || 'Unknown')
      console.log('   Role:', authData.data?.role || 'Unknown')
    } else {
      console.log('❌ Authentication failed:', authResponse.status)
      if (authResponse.status === 401) {
        console.log('   This is expected if not logged in')
      }
    }

    console.log('\n🔍 Diagnosis Summary:')
    console.log('   - If admin panel is accessible: ✅')
    console.log('   - If media API returns 403: ❌ Authorization issue')
    console.log('   - If media creation fails: ❌ Permission issue')
    console.log('   - If authentication fails: ❌ Login required')

    console.log('\n💡 Common Solutions:')
    console.log('   1. Make sure you are logged into the admin panel')
    console.log('   2. Check if your user has admin/editor role')
    console.log('   3. Verify environment variables are set correctly')
    console.log('   4. Check if the media directory exists and is writable')
    console.log('   5. Restart the development server')
  } catch (error) {
    console.error('❌ Debug failed:', error.message)
    console.log('💡 Make sure your development server is running: npm run dev')
  }
}

// Run the debug
debugImageUpload()
