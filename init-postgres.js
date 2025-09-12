// Initialize PostgreSQL database for Payload
import { Client } from 'pg'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

console.log('Initializing PostgreSQL database for Payload...')

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined,
  },
})

async function initDatabase() {
  try {
    await client.connect()
    console.log('✅ Connected to PostgreSQL')

    // Drop existing tables if they exist (be careful in production!)
    console.log('🗑️  Dropping existing tables...')
    const dropTables = [
      'DROP TABLE IF EXISTS users_sessions CASCADE',
      'DROP TABLE IF EXISTS customers_sessions CASCADE',
      'DROP TABLE IF EXISTS payload_preferences CASCADE',
      'DROP TABLE IF EXISTS order_tax CASCADE',
      'DROP TABLE IF EXISTS order_billing CASCADE',
      'DROP TABLE IF EXISTS order_shipping CASCADE',
      'DROP TABLE IF EXISTS order_items CASCADE',
      'DROP TABLE IF EXISTS orders CASCADE',
      'DROP TABLE IF EXISTS shopping_cart_items CASCADE',
      'DROP TABLE IF EXISTS shopping_cart CASCADE',
      'DROP TABLE IF EXISTS product_variant_images CASCADE',
      'DROP TABLE IF EXISTS product_variant_options CASCADE',
      'DROP TABLE IF EXISTS product_variants CASCADE',
      'DROP TABLE IF EXISTS product_tags CASCADE',
      'DROP TABLE IF EXISTS product_categories CASCADE',
      'DROP TABLE IF EXISTS product_images CASCADE',
      'DROP TABLE IF EXISTS products CASCADE',
      'DROP TABLE IF EXISTS categories CASCADE',
      'DROP TABLE IF EXISTS media CASCADE',
      'DROP TABLE IF EXISTS customer_preferences CASCADE',
      'DROP TABLE IF EXISTS customer_addresses CASCADE',
      'DROP TABLE IF EXISTS customers CASCADE',
      'DROP TABLE IF EXISTS users CASCADE',
    ]

    for (const query of dropTables) {
      try {
        await client.query(query)
      } catch (err) {
        // Ignore errors for tables that don't exist
        console.log(`  - ${query.split(' ')[5]} (dropped or didn't exist)`)
      }
    }

    console.log('✅ Database cleared')
    console.log('🚀 Ready for Payload to create schema automatically')
  } catch (error) {
    console.error('❌ Error initializing database:', error.message)
  } finally {
    await client.end()
  }
}

initDatabase()
