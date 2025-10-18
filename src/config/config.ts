import { z } from 'zod'
import { logger } from '../lib/api/logger'

// Environment variable schemas
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().optional(),

  // Payload CMS
  PAYLOAD_SECRET: z.string().min(32, 'PAYLOAD_SECRET must be at least 32 characters'),
  MONGODB_URL: z.string().optional(),

  // Next.js
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_SERVER_URL: z.string().url().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters').optional(),

  // Email (for production)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.number().min(1).max(65535).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  ADMIN_EMAIL: z.string().email().optional(),

  // File Storage
  UPLOAD_DIR: z.string().default('./uploads'),

  // Security
  CORS_ORIGIN: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.number().default(100),

  // Monitoring
  SENTRY_DSN: z.string().optional(),

  // Feature Flags
  ENABLE_ANALYTICS: z.boolean().default(false),
  ENABLE_DEBUG_MODE: z.boolean().default(false),
})

// Runtime configuration schema
const runtimeConfigSchema = z.object({
  // App
  isDevelopment: z.boolean(),
  isProduction: z.boolean(),
  isTest: z.boolean(),

  // Server
  serverUrl: z.string(),
  port: z.number().default(3000),

  // Database
  database: z.object({
    type: z.enum(['sqlite', 'mongodb', 'postgresql']),
    url: z.string().optional(),
  }),

  // Security
  security: z.object({
    corsOrigin: z.string().optional(),
    rateLimit: z.object({
      windowMs: z.number(),
      maxRequests: z.number(),
    }),
  }),

  // Features
  features: z.object({
    analytics: z.boolean(),
    debugMode: z.boolean(),
    emailEnabled: z.boolean(),
    stripeEnabled: z.boolean(),
  }),
})

type EnvConfig = z.infer<typeof envSchema>
type RuntimeConfig = z.infer<typeof runtimeConfigSchema>

class ConfigManager {
  private envConfig!: EnvConfig
  private runtimeConfig!: RuntimeConfig

  constructor() {
    this.validateEnvironment()
    this.buildRuntimeConfig()
  }

  private validateEnvironment(): void {
    try {
      // Parse and validate environment variables
      const envData = {
        NODE_ENV: process.env.NODE_ENV,
        PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
        MONGODB_URL: process.env.MONGODB_URL,
        DATABASE_URL: process.env.DATABASE_URL,
        NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        JWT_SECRET: process.env.JWT_SECRET,
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS: process.env.SMTP_PASS,
        SMTP_FROM: process.env.SMTP_FROM,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL,
        UPLOAD_DIR: process.env.UPLOAD_DIR,
        CORS_ORIGIN: process.env.CORS_ORIGIN,
        RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS
          ? parseInt(process.env.RATE_LIMIT_WINDOW_MS)
          : undefined,
        RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS
          ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS)
          : undefined,
        SENTRY_DSN: process.env.SENTRY_DSN,
        ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true',
        ENABLE_DEBUG_MODE: process.env.ENABLE_DEBUG_MODE === 'true',
      }

      this.envConfig = envSchema.parse(envData)
      logger.info('Environment configuration validated successfully', 'Config')
    } catch (error) {
      if (error instanceof z.ZodError) {
        const zodError = error as z.ZodError
        const missingVars = zodError.issues.map((err: any) => err.path.join('.'))
        logger.error('Environment configuration validation failed', 'Config', error as Error, {
          missingVariables: missingVars,
          details: zodError.issues,
        })
        throw new Error(`Missing or invalid environment variables: ${missingVars.join(', ')}`)
      }
      throw error
    }
  }

  private buildRuntimeConfig(): void {
    const isDevelopment = this.envConfig.NODE_ENV === 'development'
    const isProduction = this.envConfig.NODE_ENV === 'production'
    const isTest = this.envConfig.NODE_ENV === 'test'

    // Determine database type
    let databaseType: 'sqlite' | 'mongodb' | 'postgresql' = 'sqlite'
    if (this.envConfig.MONGODB_URL) {
      databaseType = 'mongodb'
    } else if (
      this.envConfig.DATABASE_URL &&
      this.envConfig.DATABASE_URL.startsWith('postgresql://')
    ) {
      databaseType = 'postgresql'
    }

    // Build runtime configuration
    this.runtimeConfig = runtimeConfigSchema.parse({
      isDevelopment,
      isProduction,
      isTest,
      serverUrl: this.envConfig.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
      port: parseInt(process.env.PORT || '3000'),
      database: {
        type: databaseType,
        url: this.envConfig.MONGODB_URL || this.envConfig.DATABASE_URL,
      },
      security: {
        corsOrigin: this.envConfig.CORS_ORIGIN,
        rateLimit: {
          windowMs: this.envConfig.RATE_LIMIT_WINDOW_MS,
          maxRequests: this.envConfig.RATE_LIMIT_MAX_REQUESTS,
        },
      },
      features: {
        analytics: this.envConfig.ENABLE_ANALYTICS,
        debugMode: this.envConfig.ENABLE_DEBUG_MODE,
        emailEnabled: !!(
          this.envConfig.SMTP_HOST &&
          this.envConfig.SMTP_USER &&
          this.envConfig.SMTP_PASS
        ),
        stripeEnabled: !!(
          this.envConfig.STRIPE_SECRET_KEY && this.envConfig.STRIPE_PUBLISHABLE_KEY
        ),
      },
    })

    logger.info('Runtime configuration built successfully', 'Config', {
      environment: this.envConfig.NODE_ENV,
      databaseType,
      features: this.runtimeConfig.features,
    })
  }

  // Getters for configuration values
  get env(): EnvConfig {
    return this.envConfig
  }

  get runtime(): RuntimeConfig {
    return this.runtimeConfig
  }

  // Convenience getters
  get isDevelopment(): boolean {
    return this.runtimeConfig.isDevelopment
  }

  get isProduction(): boolean {
    return this.runtimeConfig.isProduction
  }

  get isTest(): boolean {
    return this.runtimeConfig.isTest
  }

  get serverUrl(): string {
    return this.runtimeConfig.serverUrl
  }

  get databaseType(): string {
    return this.runtimeConfig.database.type
  }

  get features(): RuntimeConfig['features'] {
    return this.runtimeConfig.features
  }

  // Validation methods
  requireFeature(feature: keyof RuntimeConfig['features']): boolean {
    if (!this.runtimeConfig.features[feature]) {
      throw new Error(`Feature '${feature}' is not enabled in the current configuration`)
    }
    return true
  }

  // Check if required services are configured
  isStripeConfigured(): boolean {
    return this.runtimeConfig.features.stripeEnabled
  }

  isEmailConfigured(): boolean {
    return this.runtimeConfig.features.emailEnabled
  }

  getEmailConfig(): {
    configured: boolean
    host?: string
    port?: number
    user?: string
    from?: string
    adminEmail?: string
  } {
    return {
      configured: this.isEmailConfigured(),
      host: this.envConfig.SMTP_HOST,
      port: this.envConfig.SMTP_PORT,
      user: this.envConfig.SMTP_USER,
      from: this.envConfig.SMTP_FROM || this.envConfig.SMTP_USER,
      adminEmail: this.envConfig.ADMIN_EMAIL,
    }
  }

  // Get configuration summary for debugging
  getSummary(): Record<string, any> {
    return {
      environment: this.envConfig.NODE_ENV,
      serverUrl: this.runtimeConfig.serverUrl,
      database: {
        type: this.runtimeConfig.database.type,
        configured: !!this.runtimeConfig.database.url,
      },
      features: this.runtimeConfig.features,
      security: {
        corsConfigured: !!this.runtimeConfig.security.corsOrigin,
        rateLimitConfigured: true,
      },
    }
  }
}

// Create and export the configuration manager instance
export const config = new ConfigManager()

// Export types for use in other modules
export type { EnvConfig, RuntimeConfig }
