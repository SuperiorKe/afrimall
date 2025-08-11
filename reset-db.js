#!/usr/bin/env node

/**
 * Database Reset Script for Afrimall
 * This script will reset the database and reseed with Afrimall data
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔄 Resetting Afrimall Database...')

// Remove existing database
const dbPath = path.join(__dirname, 'afrimall.db')
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath)
  console.log('✅ Removed existing database')
} else {
  console.log('ℹ️  No existing database found')
}

// Remove existing database files
const dbFiles = ['afrimall.db-shm', 'afrimall.db-wal']

dbFiles.forEach((file) => {
  const filePath = path.join(__dirname, file)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
    console.log(`✅ Removed ${file}`)
  }
})

console.log('🎉 Database reset complete!')
console.log('')
console.log('Next steps:')
console.log('1. Start your development server: npm run dev')
console.log('2. Go to /admin to create your admin account')
console.log('3. Use the seed button in admin to populate with Afrimall data')
console.log('')
console.log('🌍 Your Afrimall marketplace is ready!')
