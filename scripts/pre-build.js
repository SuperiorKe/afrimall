#!/usr/bin/env node

/**
 * Pre-build script that ensures database is ready
 * This script runs before the Next.js build to ensure database schema exists
 */

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🔧 Running: ${command} ${args.join(' ')}`)

    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options,
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Command failed with exit code ${code}`))
      }
    })

    child.on('error', (error) => {
      reject(error)
    })
  })
}

async function preBuild() {
  try {
    console.log('🚀 Starting pre-build database initialization...')

    // Check if we're in production and have a DATABASE_URL
    const isProduction = process.env.NODE_ENV === 'production'
    const hasDatabaseUrl = !!process.env.DATABASE_URL

    if (isProduction && hasDatabaseUrl) {
      console.log('📊 Production environment detected with DATABASE_URL')

      // Try to generate types which will also initialize the database schema
      try {
        await runCommand('npm', ['run', 'generate:types'])
        console.log('✅ Database schema initialized successfully')
      } catch (error) {
        console.warn(
          '⚠️  Database initialization failed, but continuing with build:',
          error.message,
        )
        console.log('ℹ️  Database tables will be created on first application startup')
      }
    } else {
      console.log(
        'ℹ️  Development environment or no DATABASE_URL - skipping database initialization',
      )
    }

    console.log('✅ Pre-build completed')
  } catch (error) {
    console.error('💥 Pre-build failed:', error.message)
    // Don't exit with error code - let the build continue
    console.log('ℹ️  Continuing with build despite pre-build warnings')
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  preBuild()
}

export { preBuild }
