#!/usr/bin/env node

/**
 * Setup script for media directories
 * Run with: node setup-media-directory.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function setupMediaDirectories() {
  console.log('📁 Setting up media directories...\n')

  try {
    // Create the main media directory
    const mediaDir = path.resolve(__dirname, 'public/media')
    if (!fs.existsSync(mediaDir)) {
      fs.mkdirSync(mediaDir, { recursive: true })
      console.log('✅ Created media directory:', mediaDir)
    } else {
      console.log('✅ Media directory already exists:', mediaDir)
    }

    // Create subdirectories for different media types
    const subdirs = ['images', 'documents', 'videos', 'thumbnails']

    subdirs.forEach((subdir) => {
      const subdirPath = path.join(mediaDir, subdir)
      if (!fs.existsSync(subdirPath)) {
        fs.mkdirSync(subdirPath, { recursive: true })
        console.log('✅ Created subdirectory:', subdirPath)
      } else {
        console.log('✅ Subdirectory already exists:', subdirPath)
      }
    })

    // Create a .gitkeep file to ensure the directory is tracked
    const gitkeepPath = path.join(mediaDir, '.gitkeep')
    if (!fs.existsSync(gitkeepPath)) {
      fs.writeFileSync(gitkeepPath, '# This file ensures the media directory is tracked by git')
      console.log('✅ Created .gitkeep file')
    }

    // Test write permissions
    const testFile = path.join(mediaDir, 'test-write-permissions.tmp')
    try {
      fs.writeFileSync(testFile, 'test')
      fs.unlinkSync(testFile)
      console.log('✅ Write permissions verified')
    } catch (error) {
      console.log('❌ Write permission test failed:', error.message)
      console.log('💡 You may need to run: chmod 755 public/media')
    }

    console.log('\n🎉 Media directories setup completed!')
    console.log('\n📝 Next steps:')
    console.log('   1. Restart your development server: npm run dev')
    console.log('   2. Log into the admin panel')
    console.log('   3. Try uploading an image again')
    console.log('   4. If issues persist, run: node debug-image-upload.js')
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  }
}

// Run the setup
setupMediaDirectories()
