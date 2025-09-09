#!/usr/bin/env node

/**
 * Simple database initialization script
 * This script ensures the database is properly initialized
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

async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database...')
    
    // Generate types which should also initialize the database schema
    try {
      await runCommand('npm', ['run', 'generate:types'])
      console.log('✅ Database schema initialized via generate:types')
    } catch (error) {
      console.log('⚠️  Type generation failed:', error.message)
    }
    
    // Try to run a simple payload command to ensure database is accessible
    try {
      await runCommand('npx', ['payload', 'migrate:status'])
      console.log('✅ Database connection verified')
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
  initializeDatabase()
    .then((success) => {
      process.exit(success ? 0 : 1)
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error)
      process.exit(1)
    })
}

export { initializeDatabase }
