// Test database connection
import { Client } from 'pg'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

console.log('Testing database connection...')
console.log('DATABASE_URL:', process.env.DATABASE_URL)

if (process.env.DATABASE_URL) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  client
    .connect()
    .then(() => {
      console.log('✅ Database connection successful!')
      return client.query('SELECT NOW()')
    })
    .then((result) => {
      console.log('✅ Database query successful:', result.rows[0])
      client.end()
    })
    .catch((err) => {
      console.error('❌ Database connection failed:', err.message)
      console.error('Error details:', err)
    })
} else {
  console.error('❌ DATABASE_URL not found in environment variables')
}
