# Supabase Integration Guide for AfriMall

## 🚀 **Step 1: Environment Variables Setup**

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Database Configuration
POSTGRES_URL=your_supabase_postgres_connection_string_here
POSTGRES_HOST=your_supabase_host_here
POSTGRES_DATABASE=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_supabase_password_here

# PayloadCMS Configuration
PAYLOAD_SECRET=your_payload_secret_here

# Node Environment
NODE_ENV=development
```

## 🔧 **Step 2: Get Your Supabase Credentials**

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`

4. Navigate to Settings > Database
5. Copy the connection string → `POSTGRES_URL`

## 🗄️ **Step 3: Create Database Tables**

Run this SQL in your Supabase SQL Editor to create the necessary tables for PayloadCMS:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (PayloadCMS will manage this)
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT,
  "salt" TEXT,
  "resetPasswordToken" TEXT,
  "resetPasswordExpiration" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create media table
CREATE TABLE IF NOT EXISTS "media" (
  "id" SERIAL PRIMARY KEY,
  "filename" TEXT,
  "alt" TEXT,
  "width" INTEGER,
  "height" INTEGER,
  "mimeType" TEXT,
  "filesize" INTEGER,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS "categories" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "description" TEXT,
  "image" INTEGER REFERENCES "media"("id"),
  "status" TEXT DEFAULT 'active',
  "sortOrder" INTEGER DEFAULT 0,
  "featured" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS "products" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "description" TEXT,
  "fullDescription" TEXT,
  "price" DECIMAL(10,2) NOT NULL,
  "compareAtPrice" DECIMAL(10,2),
  "sku" TEXT,
  "status" TEXT DEFAULT 'active',
  "featured" BOOLEAN DEFAULT FALSE,
  "inventory" JSONB,
  "weight" DECIMAL(8,2),
  "dimensions" JSONB,
  "tags" JSONB,
  "seo" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create product_categories junction table
CREATE TABLE IF NOT EXISTS "product_categories" (
  "id" SERIAL PRIMARY KEY,
  "product_id" INTEGER REFERENCES "products"("id") ON DELETE CASCADE,
  "category_id" INTEGER REFERENCES "categories"("id") ON DELETE CASCADE,
  UNIQUE(product_id, category_id)
);

-- Create product_images junction table
CREATE TABLE IF NOT EXISTS "product_images" (
  "id" SERIAL PRIMARY KEY,
  "product_id" INTEGER REFERENCES "products"("id") ON DELETE CASCADE,
  "media_id" INTEGER REFERENCES "media"("id") ON DELETE CASCADE,
  "alt" TEXT,
  "sortOrder" INTEGER DEFAULT 0
);

-- Create customers table
CREATE TABLE IF NOT EXISTS "customers" (
  "id" SERIAL PRIMARY KEY,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "phone" TEXT,
  "address" JSONB,
  "preferences" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS "orders" (
  "id" SERIAL PRIMARY KEY,
  "orderNumber" TEXT UNIQUE NOT NULL,
  "customer_id" INTEGER REFERENCES "customers"("id"),
  "status" TEXT DEFAULT 'pending',
  "total" DECIMAL(10,2) NOT NULL,
  "currency" TEXT DEFAULT 'USD',
  "items" JSONB,
  "shipping" JSONB,
  "payment" JSONB,
  "metadata" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create shopping_cart table
CREATE TABLE IF NOT EXISTS "shopping_cart" (
  "id" SERIAL PRIMARY KEY,
  "customer_id" INTEGER REFERENCES "customers"("id"),
  "items" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "media" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shopping_cart" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Public read access" ON "categories" FOR SELECT USING (true);
CREATE POLICY "Public read access" ON "products" FOR SELECT USING (true);
CREATE POLICY "Public read access" ON "media" FOR SELECT USING (true);

-- Create RLS policies for authenticated users
CREATE POLICY "Users can manage own data" ON "customers" FOR ALL USING (auth.uid()::text = id::text);
CREATE POLICY "Users can manage own orders" ON "orders" FOR ALL USING (auth.uid()::text = customer_id::text);
CREATE POLICY "Users can manage own cart" ON "shopping_cart" FOR ALL USING (auth.uid()::text = customer_id::text);
```

## 🧪 **Step 4: Test the Connection**

Create a test page to verify Supabase connection:

```tsx
// app/test-supabase/page.tsx
import { supabase } from '@/utilities/supabase'

export default async function TestSupabase() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(5)
    
    if (error) throw error
    
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
        <div className="bg-green-100 p-4 rounded">
          ✅ Successfully connected to Supabase!
        </div>
        <pre className="mt-4 p-4 bg-gray-100 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    )
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
        <div className="bg-red-100 p-4 rounded">
          ❌ Failed to connect to Supabase: {error.message}
        </div>
      </div>
    )
  }
}
```

## 🚀 **Step 5: Start Your Application**

1. Make sure your `.env.local` file is created with the correct values
2. Run `npm run dev`
3. Visit `http://localhost:3000/test-supabase` to test the connection
4. If successful, your PayloadCMS admin panel will now use Supabase!

## 🔍 **Troubleshooting**

- **Connection errors**: Check your environment variables and Supabase credentials
- **Table not found**: Make sure you've run the SQL script in Supabase
- **Permission errors**: Verify your RLS policies are set up correctly

## 📚 **Next Steps**

Once connected:
1. Access your PayloadCMS admin panel at `/admin`
2. Create your first categories and products
3. Test the e-commerce functionality
4. Deploy to Vercel with your environment variables
