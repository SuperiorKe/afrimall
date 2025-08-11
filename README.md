# 🛍️ Afrimall - Modern E-commerce Platform

**Afrimall** is a production-ready, full-stack e-commerce platform built with modern web technologies. It features a beautiful, responsive frontend, powerful admin panel, and robust backend infrastructure designed for African markets and beyond.

## ✨ Features

### 🎯 Core E-commerce Functionality
- **Product Management**: Full CRUD operations for products with variants, categories, and media
- **Shopping Cart**: Persistent cart with real-time updates and session management
- **User Authentication**: Secure customer registration and login system
- **Checkout Process**: Multi-step checkout with billing, shipping, and payment integration
- **Order Management**: Complete order lifecycle from creation to fulfillment
- **Payment Processing**: Stripe integration for secure payment processing

### 🎨 Modern Frontend
- **Next.js 14**: Built with the latest Next.js App Router for optimal performance
- **TypeScript**: Full type safety and better development experience
- **Tailwind CSS**: Modern, utility-first CSS framework
- **Responsive Design**: Mobile-first approach with beautiful UI components
- **Dark Mode**: Built-in theme switching for better user experience

### 🔧 Powerful Backend
- **Payload CMS**: Headless CMS with powerful admin panel
- **Database**: SQLite for development, PostgreSQL for production
- **API**: RESTful API with GraphQL support
- **Authentication**: JWT-based authentication system
- **File Management**: Advanced media handling with image optimization

### 🚀 Production Ready
- **SEO Optimized**: Built-in SEO tools and meta management
- **Performance**: Optimized for Core Web Vitals
- **Security**: Secure by design with proper access controls
- **Scalability**: Built to handle growing e-commerce demands

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/afrimall.git
   cd afrimall
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.production.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   PAYLOAD_SECRET=your-secret-key
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   DATABASE_URL=your-database-url
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Admin Panel: [http://localhost:3000/admin](http://localhost:3000/admin)

## 🏗️ Project Structure

```
afrimall/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (frontend)/        # Customer-facing pages
│   │   ├── (payload)/         # Admin panel and API routes
│   │   └── api/               # Custom API endpoints
│   ├── collections/           # Payload CMS collections
│   ├── components/            # Reusable React components
│   │   ├── ecommerce/        # E-commerce specific components
│   │   └── ui/               # Base UI components
│   ├── blocks/                # Content blocks for pages
│   ├── hooks/                 # Custom React hooks
│   ├── utilities/             # Helper functions and utilities
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
├── docs/                      # Documentation
└── tests/                     # Test files
```

## 🛒 E-commerce Features

### Product Management
- **Products**: Create, edit, and manage product listings
- **Variants**: Handle multiple product variations (size, color, etc.)
- **Categories**: Organize products with hierarchical categories
- **Media**: Rich media support with image optimization

### Shopping Experience
- **Product Catalog**: Browse products with advanced filtering
- **Search**: Full-text search across products
- **Product Details**: Rich product pages with galleries
- **Related Products**: Smart product recommendations

### Customer Management
- **User Accounts**: Customer registration and profiles
- **Order History**: Complete order tracking
- **Wishlists**: Save favorite products
- **Reviews**: Product rating and feedback system

### Checkout & Payment
- **Multi-step Checkout**: Streamlined purchase process
- **Address Management**: Billing and shipping addresses
- **Payment Methods**: Secure payment processing via Stripe
- **Order Confirmation**: Email confirmations and receipts

## 🔐 Admin Panel

Access the powerful admin panel at `/admin` to manage:

- **Products & Inventory**: Add, edit, and manage products
- **Orders**: Process and fulfill customer orders
- **Customers**: Manage customer accounts and data
- **Content**: Create and edit website content
- **Media**: Upload and organize images and files
- **Analytics**: View sales and performance metrics

## 🚀 Deployment

### Environment Variables
Ensure these environment variables are set in production:

```env
PAYLOAD_SECRET=your-production-secret
DATABASE_URL=your-production-database-url
STRIPE_SECRET_KEY=your-production-stripe-key
STRIPE_PUBLISHABLE_KEY=your-production-stripe-publishable-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-production-stripe-publishable-key
```

### Build & Deploy
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Deployment Options
- **Vercel**: One-click deployment with Vercel
- **Netlify**: Deploy with Netlify's build system
- **Self-hosted**: Deploy to your own server or VPS
- **Docker**: Use the included Docker configuration

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Run all tests
npm run test:all
```

## 📚 Documentation

- [API Documentation](docs/API_PRODUCTS.md)
- [Admin Setup Guide](ADMIN_SETUP_GUIDE.md)
- [Production Checklist](PRODUCTION_CHECKLIST.md)
- [Stripe Integration Guide](STRIPE_INTEGRATION_GUIDE.md)
- [Brand Guidelines](AFRIMALL_BRAND_GUIDE.md)

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines and code of conduct.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/afrimall/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/afrimall/discussions)
- **Documentation**: Check the docs folder for detailed guides

## 🙏 Acknowledgments

- Built with [Payload CMS](https://payloadcms.com/)
- Frontend powered by [Next.js](https://nextjs.org/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Payment processing via [Stripe](https://stripe.com/)

---

**Afrimall** - Empowering African commerce through modern technology 🚀
