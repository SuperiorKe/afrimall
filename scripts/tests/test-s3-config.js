// Test S3 configuration
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

console.log('Testing S3 configuration...')
console.log('AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET)
console.log('AWS_S3_ACCESS_KEY_ID:', process.env.AWS_S3_ACCESS_KEY_ID ? 'Set' : 'Not set')
console.log('AWS_S3_SECRET_ACCESS_KEY:', process.env.AWS_S3_SECRET_ACCESS_KEY ? 'Set' : 'Not set')
console.log('AWS_S3_REGION:', process.env.AWS_S3_REGION)

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
})

async function testS3() {
  try {
    const command = new ListBucketsCommand({})
    const response = await s3Client.send(command)
    console.log('✅ S3 connection successful!')
    console.log('Available buckets:', response.Buckets.map(b => b.Name))
    
    // Check if our bucket exists
    const ourBucket = response.Buckets.find(b => b.Name === process.env.AWS_S3_BUCKET)
    if (ourBucket) {
      console.log('✅ Target bucket found:', ourBucket.Name)
    } else {
      console.log('❌ Target bucket not found:', process.env.AWS_S3_BUCKET)
    }
  } catch (error) {
    console.error('❌ S3 connection failed:', error.message)
    console.error('Error details:', error)
  }
}

testS3()

