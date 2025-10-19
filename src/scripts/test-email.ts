#!/usr/bin/env node

/**
 * Test script for email functionality
 * Usage: npx tsx src/scripts/test-email.ts
 */

// Load environment variables FIRST, before any other imports
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

// Now import the email services after environment variables are loaded
import { emailService } from '../lib/email/email'
import { emailQueue } from '../lib/email/emailQueue'

async function testEmailSystem() {
  console.log('🧪 Testing AfriMall Email System...\n')

  // Debug: Show loaded environment variables
  console.log('🔍 Environment Variables Debug:')
  console.log('   SMTP_HOST:', process.env.SMTP_HOST ? '✅ Set' : '❌ Missing')
  console.log('   SMTP_PORT:', process.env.SMTP_PORT ? '✅ Set' : '❌ Missing')
  console.log('   SMTP_USER:', process.env.SMTP_USER ? '✅ Set' : '❌ Missing')
  console.log('   SMTP_PASS:', process.env.SMTP_PASS ? '✅ Set' : '❌ Missing')
  console.log('   SMTP_FROM:', process.env.SMTP_FROM ? '✅ Set' : '❌ Missing')
  console.log('   ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? '✅ Set' : '❌ Missing')
  console.log('')

  // Reinitialize email service with loaded environment variables
  console.log('🔄 Reinitializing email service with environment variables...')
  emailService.reinitializeConfig()

  // Test 1: Check email configuration
  console.log('1️⃣ Checking email configuration...')
  const configStatus = emailService.getConfigStatus()
  console.log('   Configuration Status:', configStatus)

  if (!configStatus.configured) {
    console.log('❌ Email service is not configured. Please set up SMTP environment variables.')
    console.log('   Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS')
    console.log('   Optional: SMTP_FROM, ADMIN_EMAIL')
    return
  }

  // Test 2: Test email connection
  console.log('\n2️⃣ Testing email connection...')
  const connectionTest = await emailService.testConnection()
  console.log('   Connection Test:', connectionTest ? '✅ Success' : '❌ Failed')

  if (!connectionTest) {
    console.log('❌ Cannot connect to email service. Please check your SMTP settings.')
    return
  }

  // Test 3: Test queue status
  console.log('\n3️⃣ Checking email queue...')
  const queueStatus = emailQueue.getStatus()
  console.log('   Queue Status:', queueStatus)

  // Test 4: Send test admin notification (if ADMIN_EMAIL is set)
  if (process.env.ADMIN_EMAIL) {
    console.log('\n4️⃣ Sending test admin notification...')
    try {
      const success = await emailService.sendAdminNotification(
        'Email System Test',
        `This is a test email sent at ${new Date().toLocaleString()}.\n\nIf you received this email, the AfriMall email system is working correctly!\n\nTest completed successfully. ✅`,
        process.env.ADMIN_EMAIL,
      )
      console.log('   Admin Notification:', success ? '✅ Sent' : '❌ Failed')
    } catch (error) {
      console.log('   Admin Notification: ❌ Error -', (error as Error).message)
    }
  } else {
    console.log('\n4️⃣ Skipping admin notification test (ADMIN_EMAIL not set)')
  }

  // Test 5: Test order confirmation email template
  console.log('\n5️⃣ Testing order confirmation email template...')
  try {
    const testOrderData = {
      orderNumber: 'TEST123456',
      customerName: 'John Doe',
      customerEmail: 'test@example.com',
      orderDate: new Date().toISOString(),
      items: [
        {
          title: 'Test Product',
          quantity: 2,
          unitPrice: 29.99,
          totalPrice: 59.98,
          sku: 'TEST-SKU-001',
          image: 'https://via.placeholder.com/60x60',
        },
      ],
      subtotal: 59.98,
      shipping: {
        cost: 9.99,
        method: 'standard',
        address: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Test Street',
          address2: 'Apt 4B',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'United States',
        },
      },
      total: 69.97,
      currency: 'USD',
    }

    // Generate HTML to test template (don't actually send)
    const htmlContent = (emailService as any).generateOrderConfirmationHTML(testOrderData)
    console.log('   Template Generation:', htmlContent ? '✅ Success' : '❌ Failed')
    console.log('   Template Length:', htmlContent?.length || 0, 'characters')
  } catch (error) {
    console.log('   Template Generation: ❌ Error -', (error as Error).message)
  }

  // Test 6: Test queue operations
  console.log('\n6️⃣ Testing email queue operations...')
  try {
    const queueId = await emailQueue.addToQueue(
      'admin_notification',
      {
        subject: 'Queue Test',
        message: 'This is a test email queued for processing.',
      },
      'high',
    )
    console.log('   Queue Add:', `✅ Added with ID: ${queueId}`)

    const updatedStatus = emailQueue.getStatus()
    console.log('   Queue Status After Add:', updatedStatus.total, 'items')

    // Clear the test item
    emailQueue.clearQueue()
    console.log('   Queue Clear:', '✅ Cleared')
  } catch (error) {
    console.log('   Queue Operations: ❌ Error -', (error as Error).message)
  }

  console.log('\n🎉 Email system test completed!')
  console.log('\nNext steps:')
  console.log('1. Set up your SMTP credentials in environment variables')
  console.log('2. Test with a real email address using the /api/email/test endpoint')
  console.log('3. Place a test order to verify order confirmation emails')
}

// Run the test
testEmailSystem().catch((error) => {
  console.error('❌ Test failed with error:', error)
  process.exit(1)
})
