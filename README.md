# 🛍️ Afrimall - Modern E-commerce Platform

**Afrimall** is a production-ready, full-stack e-commerce platform built with modern web technologies. It features a beautiful, responsive frontend, powerful admin panel, and robust backend infrastructure designed for African markets and beyond.

[![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Payload CMS](https://img.shields.io/badge/Payload%20CMS-3.49.1-blue?style=flat-square)](https://payloadcms.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## ✨ Features

### 🎯 Core E-commerce Functionality
- **Product Management**: Full CRUD operations for products with variants, categories, and media
- **Shopping Cart**: Persistent cart with real-time updates and session management
- **User Authentication**: Secure customer registration and login system
- **Checkout Process**: Multi-step checkout with billing, shipping, and payment integration
- **Order Management**: Complete order lifecycle from creation to fulfillment
- **Payment Processing**: Stripe integration for secure payment processing

### 🎨 Modern Frontend
- **Next.js 15**: Built with the latest Next.js App Router for optimal performance
- **TypeScript**: Full type safety and better development experience
- **Tailwind CSS**: Modern, utility-first CSS framework with custom African-inspired theme
- **Responsive Design**: Mobile-first approach with beautiful UI components
- **Dark Mode**: Built-in theme switching for better user experience

### 🔧 Powerful Backend
- **Payload CMS**: Headless CMS with powerful admin panel
- **Database**: PostgreSQL for production, SQLite for development
- **API**: RESTful API with comprehensive error handling
- **Authentication**: JWT-based authentication system
- **File Management**: Advanced media handling with image optimization

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- **Node.js 18+** ([Download](https://nodejs.org/))
- **pnpm** (recommended) or npm/yarn
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL** (for production) or SQLite (for development)

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/yourusername/afrimall.git
cd afrimall

# Install dependencies (using pnpm - recommended)
pnpm install

# Or using npm
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit the environment file
nano .env.local  # or use your preferred editor
```

**Required Environment Variables:**
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/afrimall
# OR for development (SQLite will be used automatically)
# DATABASE_URL=file:./afrimall.db

# Payload CMS
PAYLOAD_SECRET=your-super-secret-key-here

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Optional: Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. Database Setup
```bash
# Generate TypeScript types
pnpm run generate:types

# Seed the database with sample data (optional)
# This will create sample products, categories, and an admin user
curl -X POST http://localhost:3000/api/seed
```

### 4. Start Development
```bash
# Start the development server
pnpm run dev

# Or using npm
npm run dev
```

### 5. Access the Application
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **API Documentation**: [http://localhost:3000/api/graphql-playground](http://localhost:3000/api/graphql-playground)

**Default Admin Credentials:**
- Email: `admin@afrimall.com`
- Password: `admin123` (⚠️ Change this immediately!)

## 🏗️ Project Structure

```
afrimall/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (frontend)/        # Customer-facing pages
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── products/      # Product catalog
│   │   │   ├── cart/          # Shopping cart
│   │   │   ├── checkout/      # Checkout process
│   │   │   └── auth/          # Authentication
│   │   ├── (payload)/         # Admin panel
│   │   │   └── admin/         # Payload admin interface
│   │   └── api/               # Custom API endpoints
│   │       ├── products/      # Product CRUD
│   │       ├── cart/          # Cart management
│   │       ├── orders/        # Order processing
│   │       └── stripe/        # Payment processing
│   ├── collections/           # Payload CMS collections
│   │   ├── Products.ts        # Product schema
│   │   ├── Categories.ts      # Category schema
│   │   ├── Orders.ts          # Order schema
│   │   └── Customers.ts       # Customer schema
│   ├── components/            # React components
│   │   ├── ecommerce/        # E-commerce specific
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ShoppingCartComponent.tsx
│   │   │   └── CheckoutForm.tsx
│   │   └── ui/               # Base UI components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       └── card.tsx
│   ├── contexts/             # React contexts
│   │   └── CartContext.tsx   # Shopping cart state
│   ├── utilities/            # Helper functions
│   │   ├── apiResponse.ts    # API response helpers
│   │   ├── formatPrice.ts    # Price formatting
│   │   └── stripe.ts         # Stripe utilities
│   └── types/                # TypeScript definitions
│       └── ecommerce.ts      # E-commerce types
├── public/                   # Static assets
├── docs/                     # Documentation
└── payload-types.ts          # Generated types
```

## 🛒 E-commerce Features

### Product Management
- **Products**: Create, edit, and manage product listings with variants
- **Categories**: Hierarchical category system with filtering
- **Media**: Rich media support with automatic image optimization
- **Inventory**: Stock tracking with low-stock alerts

### Shopping Experience
- **Product Catalog**: Advanced filtering and search capabilities
- **Product Details**: Rich product pages with image galleries
- **Shopping Cart**: Persistent cart with real-time updates
- **Wishlist**: Save favorite products for later

### Checkout & Payment
- **Multi-step Checkout**: Streamlined 4-step checkout process
- **Address Management**: Billing and shipping address handling
- **Payment Processing**: Secure Stripe integration
- **Order Confirmation**: Email confirmations and receipts

## 🔐 Admin Panel

Access the powerful admin panel at `/admin` to manage:

- **Products & Inventory**: Add, edit, and manage products
- **Orders**: Process and fulfill customer orders
- **Customers**: Manage customer accounts and data
- **Categories**: Organize products with categories
- **Media**: Upload and organize images and files
- **Analytics**: View sales and performance metrics

## 🚀 Deployment

### Environment Variables for Production
```env
# Database (Required)
DATABASE_URL=postgresql://username:password@host:5432/afrimall

# Payload CMS (Required)
PAYLOAD_SECRET=your-production-secret-key

# Stripe (Required for payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Optional: Email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Optional: S3 for file storage
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### Build & Deploy
```bash
# Build the application
pnpm run build

# Start production server
pnpm start
```

### Deployment Options

#### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on every push

#### Docker
```bash
# Build Docker image
docker build -t afrimall .

# Run with Docker Compose
docker-compose up -d
```

#### Self-hosted
1. Set up PostgreSQL database
2. Configure environment variables
3. Build and start the application
4. Set up reverse proxy (nginx/Apache)

## 🧪 Development

### Available Scripts
```bash
# Development
pnpm run dev              # Start development server
pnpm run build            # Build for production
pnpm run start            # Start production server

# Code Quality
pnpm run lint             # Run ESLint
pnpm run lint:fix         # Fix ESLint errors

# Payload CMS
pnpm run generate:types   # Generate TypeScript types
pnpm run payload          # Access Payload CLI

# Database
pnpm run check:db         # Check database connection
```

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with Next.js rules
- **Prettier**: Code formatting
- **Conventional Commits**: Standardized commit messages

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check database connection
pnpm run check:db

# Verify environment variables
echo $DATABASE_URL
```

#### 2. Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 3. Styling Issues
```bash
# Ensure PostCSS is configured
ls postcss.config.js

# Check Tailwind configuration
ls tailwind.config.mjs
```

#### 4. Payload CMS Issues
```bash
# Generate types
pnpm run generate:types

# Check Payload configuration
pnpm run payload --help
```

### Getting Help
- **Issues**: [GitHub Issues](https://github.com/yourusername/afrimall/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/afrimall/discussions)
- **Documentation**: Check the `docs/` folder

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### 1. Fork & Clone
```bash
git clone https://github.com/yourusername/afrimall.git
cd afrimall
```

### 2. Create Feature Branch
```bash
git checkout -b feature/amazing-feature
```

### 3. Make Changes
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

### 4. Commit & Push
```bash
git commit -m "feat: add amazing feature"
git push origin feature/amazing-feature
```

### 5. Create Pull Request
- Open a pull request on GitHub
- Describe your changes clearly
- Link any related issues

### Development Guidelines
- **TypeScript**: Use strict typing
- **Components**: Follow React best practices
- **Styling**: Use Tailwind CSS utilities
- **Testing**: Write tests for new features
- **Documentation**: Update README for significant changes

## 📚 Documentation

- [API Documentation](docs/API_PRODUCTS.md)
- [Admin Setup Guide](docs/ADMIN_SETUP.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Contributing Guidelines](docs/CONTRIBUTING.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Payload CMS](https://payloadcms.com/)
- Frontend powered by [Next.js](https://nextjs.org/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Payment processing via [Stripe](https://stripe.com/)

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/afrimall/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/afrimall/discussions)
- **Email**: support@afrimall.com

---

**Afrimall** - Empowering African commerce through modern technology 🚀

*Built with ❤️ for the African market*