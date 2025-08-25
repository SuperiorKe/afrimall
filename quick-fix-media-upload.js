#!/usr/bin/env node

/**
 * Quick fix script for media upload issues
 * Run with: node quick-fix-media-upload.js
 */

const BASE_URL = 'http://localhost:3000'

async function quickFixMediaUpload() {
  console.log('🚀 Quick Fix for Media Upload Issues...\n')

  try {
    // Step 1: Test current state
    console.log('1. Testing current media creation...')
    const testData = {
      alt: 'Quick Fix Test',
      caption: 'Testing media creation after quick fix',
    }

    const createResponse = await fetch(`${BASE_URL}/api/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    })

    if (createResponse.ok) {
      console.log('✅ Media creation is working!')
      const media = await createResponse.json()

      // Clean up
      await fetch(`${BASE_URL}/api/media/${media.data.id}`, { method: 'DELETE' })
      console.log('✅ Test media cleaned up')

      console.log('\n🎉 SUCCESS! Media upload should work now.')
      console.log('   Try uploading an image in the admin panel')
      return
    }

    console.log('❌ Media creation still failing:', createResponse.status)
    const errorText = await createResponse.text()
    console.log('   Error:', errorText.substring(0, 200))

    // Step 2: Check if it's an authentication issue
    console.log('\n2. Checking authentication...')
    const authResponse = await fetch(`${BASE_URL}/api/users/me`)

    if (!authResponse.ok) {
      console.log('❌ Authentication issue detected')
      console.log('   Status:', authResponse.status)
      console.log('   You need to log into the admin panel first')
      console.log('\n💡 Solution:')
      console.log('   1. Go to http://localhost:3000/admin')
      console.log('   2. Log in with your admin credentials')
      console.log('   3. Try uploading an image again')
      return
    }

    console.log('✅ Authentication working')
    const userData = await authResponse.json()
    console.log('   User:', userData.data?.email)
    console.log('   Role:', userData.data?.role)

    // Step 3: Check if it's a server restart issue
    console.log('\n3. Server restart required...')
    console.log('   The access control changes require a server restart')
    console.log('\n💡 Solution:')
    console.log('   1. Stop your development server (Ctrl+C)')
    console.log('   2. Run: npm run dev')
    console.log('   3. Wait for server to start')
    console.log('   4. Try uploading an image again')
    console.log('\n   If it still fails, check the server console for debug logs')
  } catch (error) {
    console.error('❌ Quick fix failed:', error.message)
    console.log('💡 Make sure your development server is running: npm run dev')
  }
}

// Run the quick fix
quickFixMediaUpload()
