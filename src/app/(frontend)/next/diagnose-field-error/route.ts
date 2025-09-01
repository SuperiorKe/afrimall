import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // Test data that might be causing the issue
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpassword123',
      role: 'admin'
    }
    
    console.log('🔍 Testing user creation with data:', testData)
    
    // Try to create a user and catch the specific error
    try {
      const result = await payload.create({
        collection: 'users',
        data: testData,
      })
      
      return NextResponse.json({
        success: true,
        message: 'User creation test passed',
        result: {
          id: result.id,
          name: result.name,
          email: result.email
        }
      })
    } catch (error: any) {
      console.log('❌ User creation failed:', error.message)
      
      // Analyze the error to identify the problematic field
      let fieldAnalysis = 'Unknown field'
      if (error.message.includes('value too long')) {
        // Try to extract field name from the error
        if (error.message.includes('hash')) fieldAnalysis = 'hash field (password hash)'
        else if (error.message.includes('salt')) fieldAnalysis = 'salt field (password salt)'
        else if (error.message.includes('reset_password_token')) fieldAnalysis = 'reset_password_token field'
        else if (error.message.includes('email')) fieldAnalysis = 'email field'
        else if (error.message.includes('name')) fieldAnalysis = 'name field'
        else fieldAnalysis = 'Unknown field - likely authentication-related'
      }
      
      return NextResponse.json({
        success: false,
        message: 'User creation test failed',
        error: error.message,
        fieldAnalysis,
        errorDetails: {
          type: error.type,
          code: error.code,
          length: error.length,
          severity: error.severity
        },
        testData
      })
    }
    
  } catch (error: any) {
    console.error('❌ Diagnostic endpoint error:', error)
    return NextResponse.json({
      success: false,
      message: 'Diagnostic endpoint failed',
      error: error.message
    }, { status: 500 })
  }
}
