import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Check if any users exist, but handle case where table doesn't exist yet
    let existingUsers
    try {
      existingUsers = await payload.count({
        collection: 'users',
      })
    } catch (error: any) {
      // If the users table doesn't exist, we need to create the schema first
      if (
        error.message?.includes('relation "users" does not exist') ||
        error.message?.includes('does not exist')
      ) {
        console.log('🔧 Users table does not exist - forcing schema creation...')

        // Force schema creation by creating a test user
        try {
          const testUser = await payload.create({
            collection: 'users',
            data: {
              name: 'Schema Test User',
              email: 'schema-test@afrimall.com',
              role: 'admin',
              password: 'test123',
            },
          })

          // Clean up test user
          await payload.delete({
            collection: 'users',
            where: { email: { equals: 'schema-test@afrimall.com' } },
          })

          console.log('✅ Users table created successfully')

          // Now try to count users again
          existingUsers = await payload.count({
            collection: 'users',
          })
        } catch (schemaError: any) {
          console.error('❌ Failed to create users table:', schemaError.message)
          return NextResponse.json(
            {
              success: false,
              message: 'Failed to create database schema',
              error: schemaError.message,
              suggestion:
                'Try running the /next/force-init endpoint first to create all database tables',
            },
            { status: 500 },
          )
        }
      } else {
        // Re-throw other errors
        throw error
      }
    }

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
      { status: 500 },
    )
  }
}
