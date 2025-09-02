import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting complete database initialization...')

    const payload = await getPayload({ config })
    console.log('✅ Payload CMS initialized successfully')

    const results: any = {}
    const collections = [
      'users',
      'categories',
      'products',
      'media',
      'customers',
      'orders',
      'shopping_cart',
      'payload_preferences',
    ]

    // Step 1: Force schema creation for all collections
    console.log('🔧 Forcing database schema creation...')

    for (const collection of collections) {
      try {
        console.log(`📋 Creating schema for ${collection}...`)

        // Try to count first to see if table exists
        try {
          await payload.count({ collection: collection as any })
          results[collection] = {
            success: true,
            message: `Table ${collection} already exists`,
            action: 'skipped',
          }
          console.log(`✅ Table ${collection} already exists`)
        } catch (error: any) {
          // Table doesn't exist, create it by attempting to create a test document
          if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
            // Create test data based on collection type
            let testData: any = {}

            switch (collection) {
              case 'users':
                testData = {
                  name: 'Schema Test User',
                  email: 'schema-test@afrimall.com',
                  role: 'admin',
                  password: 'test123',
                }
                break
              case 'categories':
                testData = {
                  title: 'Schema Test Category',
                  description: 'Test category for schema creation',
                  status: 'active',
                }
                break
              case 'products':
                testData = {
                  title: 'Schema Test Product',
                  description: 'Test product for schema creation',
                  price: 9.99,
                  status: 'active',
                  sku: 'SCHEMA-TEST-001',
                  inventory: {
                    trackQuantity: true,
                    quantity: 10,
                    allowBackorder: false,
                    lowStockThreshold: 5,
                  },
                }
                break
              case 'media':
                testData = {
                  alt: 'Schema test media',
                }
                break
              case 'customers':
                testData = {
                  name: 'Schema Test Customer',
                  email: 'customer-test@afrimall.com',
                  phone: '+1234567890',
                }
                break
              case 'orders':
                testData = {
                  status: 'pending',
                  total: 9.99,
                  customerEmail: 'test@afrimall.com',
                }
                break
              case 'shopping_cart':
                testData = {
                  items: [],
                  total: 0,
                }
                break
              case 'payload_preferences':
                testData = {
                  key: 'schema-test',
                  value: 'test',
                }
                break
            }

            // Create test document to force table creation
            const testDoc = await payload.create({
              collection: collection as any,
              data: testData,
            })

            // Clean up test document
            await payload.delete({
              collection: collection as any,
              where: { id: { equals: testDoc.id } },
            })

            results[collection] = {
              success: true,
              message: `Table ${collection} created successfully`,
              action: 'created',
            }
            console.log(`✅ Table ${collection} created successfully`)
          } else {
            // Other error
            results[collection] = {
              success: false,
              error: error.message,
              action: 'failed',
            }
            console.log(`❌ Failed to create ${collection}:`, error.message)
          }
        }
      } catch (error: any) {
        results[collection] = {
          success: false,
          error: error.message,
          action: 'failed',
        }
        console.log(`❌ Error with ${collection}:`, error.message)
      }
    }

    // Step 2: Check overall success
    const successfulTables = Object.values(results).filter((result: any) => result.success)
    const failedTables = Object.values(results).filter((result: any) => !result.success)
    const createdTables = Object.values(results).filter(
      (result: any) => result.action === 'created',
    )

    console.log('📊 Database Initialization Summary:')
    console.log(`✅ Total tables: ${Object.keys(results).length}`)
    console.log(`✅ Successful: ${successfulTables.length}`)
    console.log(`🆕 Created: ${createdTables.length}`)
    console.log(`❌ Failed: ${failedTables.length}`)

    if (failedTables.length === 0) {
      console.log('🎉 Database initialization completed successfully!')
      return NextResponse.json({
        success: true,
        message: 'Database initialization completed successfully! All tables are now ready.',
        results,
        summary: {
          totalTables: Object.keys(results).length,
          successfulTables: successfulTables.length,
          createdTables: createdTables.length,
          failedTables: failedTables.length,
        },
        nextSteps: [
          '1. Run the /next/seed endpoint to populate initial data',
          '2. Run the /next/create-admin endpoint to create your admin user',
          '3. Access the admin panel at /admin',
        ],
      })
    } else {
      console.log('⚠️ Database initialization partially failed')
      return NextResponse.json(
        {
          success: false,
          message: 'Database initialization partially failed - some tables could not be created',
          results,
          summary: {
            totalTables: Object.keys(results).length,
            successfulTables: successfulTables.length,
            createdTables: createdTables.length,
            failedTables: failedTables.length,
          },
          error: 'Some tables failed to create - check the results for details',
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error('❌ Database initialization failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Database initialization failed',
        details: 'Check server logs for more information',
      },
      { status: 500 },
    )
  }
}
