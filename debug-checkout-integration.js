#!/usr/bin/env node

/**
 * Debug script to identify checkout integration issues
 * Run with: node debug-checkout-integration.js
 */

const BASE_URL = 'http://localhost:3000'

async function debugCheckoutFlow() {
  console.log('🔍 Debugging Checkout Integration...\n')

  try {
    // Test 1: Check if server is running
    console.log('1. Checking server connectivity...')
    try {
      const healthResponse = await fetch(`${BASE_URL}/api/health`)
      if (healthResponse.ok) {
        console.log('✅ Server is running and responding')
      } else {
        console.log('⚠️ Server responded but with error:', healthResponse.status)
      }
    } catch (error) {
      console.log('❌ Server connection failed:', error.message)
      console.log('💡 Make sure your development server is running: npm run dev')
      return
    }

    // Test 2: Check database connection via products API
    console.log('\n2. Testing database connection...')
    try {
      const productsResponse = await fetch(`${BASE_URL}/api/products`)
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        console.log('✅ Database connection working')
        console.log(`   Found ${productsData.data?.length || 0} products`)
      } else {
        console.log('❌ Database connection failed:', productsResponse.status)
        const errorText = await productsResponse.text()
        console.log('   Error details:', errorText)
      }
    } catch (error) {
      console.log('❌ Database test failed:', error.message)
    }

    // Test 3: Test customer creation with detailed error
    console.log('\n3. Testing customer creation with detailed logging...')
    try {
      const customerData = {
        email: 'test@example.com',
        phone: '+1234567890',
        firstName: 'John',
        lastName: 'Doe',
        subscribeToNewsletter: true,
        addresses: []
      }

      console.log('   Sending data:', JSON.stringify(customerData, null, 2))

      const customerResponse = await fetch(`${BASE_URL}/api/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      })

      console.log(`   Response status: ${customerResponse.status}`)
      console.log(`   Response headers:`, Object.fromEntries(customerResponse.headers.entries()))

      const responseText = await customerResponse.text()
      console.log('   Response body:', responseText)

      if (customerResponse.ok) {
        const customerResult = JSON.parse(responseText)
        console.log('✅ Customer created successfully:', customerResult.data.id)
      } else {
        console.log('❌ Customer creation failed')
        try {
          const errorData = JSON.parse(responseText)
          console.log('   Error details:', errorData)
        } catch (parseError) {
          console.log('   Raw error response:', responseText)
        }
      }
    } catch (error) {
      console.log('❌ Customer creation test failed:', error.message)
      console.log('   Stack trace:', error.stack)
    }

    // Test 4: Check if cart API exists
    console.log('\n4. Testing cart API availability...')
    try {
      const cartResponse = await fetch(`${BASE_URL}/api/cart?sessionId=test_session`)
      console.log(`   Cart API status: ${cartResponse.status}`)
      
      if (cartResponse.ok) {
        const cartData = await cartResponse.json()
        console.log('✅ Cart API working')
      } else {
        const errorText = await cartResponse.text()
        console.log('❌ Cart API error:', errorText)
      }
    } catch (error) {
      console.log('❌ Cart API test failed:', error.message)
    }

    // Test 5: Check Stripe configuration
    console.log('\n5. Testing Stripe configuration...')
    try {
      const stripeResponse = await fetch(`${BASE_URL}/api/stripe/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1000, // $10.00
          currency: 'usd',
          customerEmail: 'test@example.com',
        }),
      })

      console.log(`   Stripe API status: ${stripeResponse.status}`)
      
      if (stripeResponse.ok) {
        const stripeData = await stripeResponse.json()
        console.log('✅ Stripe API working')
      } else {
        const errorText = await stripeResponse.text()
        console.log('❌ Stripe API error:', errorText)
      }
    } catch (error) {
      console.log('❌ Stripe API test failed:', error.message)
    }

    // Test 6: Check environment variables
    console.log('\n6. Checking environment configuration...')
    console.log('   NODE_ENV:', process.env.NODE_ENV || 'not set')
    console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'set' : 'not set')
    console.log('   STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'set' : 'not set')
    console.log('   STRIPE_PUBLISHABLE_KEY:', process.env.STRIPE_PUBLISHABLE_KEY ? 'set' : 'not set')

    console.log('\n🔍 Debug Summary:')
    console.log('   - Check if your development server is running')
    console.log('   - Verify database connection (SQLite file or PostgreSQL)')
    console.log('   - Check environment variables in .env file')
    console.log('   - Look for any console errors in your server logs')

  } catch (error) {
    console.error('❌ Debug script failed:', error.message)
    console.log('   Stack trace:', error.stack)
  }
}

// Run the debug script
debugCheckoutFlow()
