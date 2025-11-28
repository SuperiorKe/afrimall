#!/usr/bin/env node

/**
 * Build script that handles database initialization
 * This script ensures the database is properly set up before building
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

async function buildWithDatabaseInit() {
  try {
    console.log('🚀 Starting Afrimall build process...')

    // Step 1: Generate TypeScript types (this also initializes the database schema)
    console.log('📝 Step 1: Generating TypeScript types and initializing database schema...')
    try {
      await runCommand('npm', ['run', 'generate:types'])
      console.log('✅ TypeScript types generated successfully')
    } catch (error) {
      console.warn('⚠️  Type generation failed, continuing with build:', error.message)
    }

    // Step 2: Run the actual build
    console.log('🏗️  Step 2: Building Next.js application...')
    await runCommand('npm', ['run', 'build'])
    console.log('✅ Build completed successfully')

    // Step 3: Generate sitemap
    console.log('🗺️  Step 3: Generating sitemap...')
    try {
      await runCommand('npm', ['run', 'postbuild'])
      console.log('✅ Sitemap generated successfully')
    } catch (error) {
      console.warn('⚠️  Sitemap generation failed, but build is complete:', error.message)
    }

    console.log('🎉 Build process completed successfully!')
  } catch (error) {
    console.error('💥 Build process failed:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildWithDatabaseInit()
}

export { buildWithDatabaseInit }
