import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { logger } from './logger'

// Database connection test utility
export class DatabaseTest {
  private static instance: DatabaseTest
  private isConnected: boolean = false
  private lastTestTime: number = 0
  private testInterval: number = 300000 // 5 minutes

  private constructor() {}

  public static getInstance(): DatabaseTest {
    if (!DatabaseTest.instance) {
      DatabaseTest.instance = new DatabaseTest()
    }
    return DatabaseTest.instance
  }

  // Test database connection
  async testConnection(): Promise<{
    success: boolean
    message: string
    details?: any
    timestamp: number
  }> {
    const now = Date.now()
    
    // Skip test if recently tested
    if (this.isConnected && (now - this.lastTestTime) < this.testInterval) {
      return {
        success: true,
        message: 'Database connection verified (cached)',
        timestamp: now,
      }
    }

    try {
      const payload = await getPayloadHMR({ config: configPromise })
      
      // Test basic database operations
      const testResult = await this.performTestOperations(payload)
      
      this.isConnected = true
      this.lastTestTime = now
      
      logger.info('Database connection test successful', 'DatabaseTest', testResult)
      
      return {
        success: true,
        message: 'Database connection successful',
        details: testResult,
        timestamp: now,
      }
    } catch (error) {
      this.isConnected = false
      this.lastTestTime = now
      
      logger.error('Database connection test failed', 'DatabaseTest', error as Error)
      
      return {
        success: false,
        message: 'Database connection failed',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
        timestamp: now,
      }
    }
  }

  // Perform test operations to verify database functionality
  private async performTestOperations(payload: any) {
    const results = {
      collections: [] as string[],
      adminUser: null as any,
      timestamp: new Date().toISOString(),
    }

    try {
      // Test 1: List collections
      const collections = await payload.collections
      results.collections = Object.keys(collections)
      
      // Test 2: Check if admin user exists
      try {
        const adminUsers = await payload.find({
          collection: 'users',
          where: {
            role: { equals: 'admin' },
          },
          limit: 1,
        })
        
        if (adminUsers.docs.length > 0) {
          results.adminUser = {
            id: adminUsers.docs[0].id,
            email: adminUsers.docs[0].email,
            role: adminUsers.docs[0].role,
          }
        }
      } catch (userError) {
        logger.warn('Could not verify admin user', 'DatabaseTest', userError as Error)
      }

      // Test 3: Check database type and connection info
      const dbInfo = {
        type: payload.db.constructor.name,
        url: process.env.DATABASE_URL || 'file:./afrimall.db',
        environment: process.env.NODE_ENV || 'development',
      }
      
      return {
        ...results,
        database: dbInfo,
      }
    } catch (error) {
      throw new Error(`Test operations failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get connection status
  getConnectionStatus(): { isConnected: boolean; lastTestTime: number } {
    return {
      isConnected: this.isConnected,
      lastTestTime: this.lastTestTime,
    }
  }

  // Force refresh connection test
  async refreshConnection(): Promise<ReturnType<typeof this.testConnection>> {
    this.lastTestTime = 0 // Reset last test time to force refresh
    return this.testConnection()
  }

  // Health check endpoint data
  async getHealthCheckData() {
    const connectionTest = await this.testConnection()
    
    return {
      status: connectionTest.success ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: connectionTest.success,
        lastTest: new Date(connectionTest.timestamp).toISOString(),
        message: connectionTest.message,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'not configured',
        stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not configured',
        email: process.env.SMTP_HOST ? 'configured' : 'not configured',
        s3: process.env.AWS_S3_BUCKET ? 'configured' : 'not configured',
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    }
  }
}

// Export singleton instance
export const databaseTest = DatabaseTest.getInstance()

// Convenience function for quick connection test
export const testDatabaseConnection = () => databaseTest.testConnection()

// Health check function
export const getHealthCheck = () => databaseTest.getHealthCheckData()
