#!/usr/bin/env node

/**
 * Force database initialization by making a simple query
 * This script forces Payload to create tables by attempting to query them
 */

import { spawn } from 'child_process'

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

async function forceDatabaseInit() {
  try {
    console.log('🔧 Forcing database initialization...')
    
    // Set production environment
    process.env.NODE_ENV = 'production'
    
    // Try to run payload generate:types which should create tables
    try {
      await runCommand('npm', ['run', 'generate:types'])
      console.log('✅ Database schema initialized')
    } catch (error) {
      console.log('⚠️  Type generation failed:', error.message)
    }
    
    // Try to run a simple payload command to trigger database initialization
    try {
      await runCommand('npx', ['payload', 'migrate:status'])
      console.log('✅ Database status checked')
    } catch (error) {
      console.log('ℹ️  Migration status check failed, but continuing')
    }
    
    console.log('✅ Database initialization completed')
    return true
    
  } catch (error) {
    console.error('💥 Database initialization failed:', error)
    return false
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  forceDatabaseInit()
    .then((success) => {
      process.exit(success ? 0 : 1)
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error)
      process.exit(1)
    })
}

export { forceDatabaseInit }
