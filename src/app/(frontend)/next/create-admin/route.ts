import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // Check if any users exist
    const existingUsers = await payload.count({
      collection: 'users',
    })

    let adminUser
    let message

    if (existingUsers.totalDocs === 0) {
      // Create the first admin user
      adminUser = await payload.create({
        collection: 'users',
        data: {
          name: 'Admin User',
          email: 'admin@afrimall.com',
          password: 'admin123',
          role: 'admin',
        },
      })
      message = 'First admin user created successfully!'
    } else {
      // Check if admin user already exists
      const adminExists = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: 'admin@afrimall.com',
          },
        },
      })

      if (adminExists.docs.length === 0) {
        // Create admin user
        adminUser = await payload.create({
          collection: 'users',
          data: {
            name: 'Admin User',
            email: 'admin@afrimall.com',
            password: 'admin123',
            role: 'admin',
          },
        })
        message = 'Admin user created successfully!'
      } else {
        // Update existing admin user password
        adminUser = await payload.update({
          collection: 'users',
          id: adminExists.docs[0].id,
          data: {
            password: 'admin123',
          },
        })
        message = 'Admin user password reset successfully!'
      }
    }

    return NextResponse.json({
      success: true,
      message,
      credentials: {
        email: 'admin@afrimall.com',
        password: 'admin123',
        role: 'admin',
      },
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    })
  } catch (error: any) {
    console.error('Error creating admin user:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create admin user',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
