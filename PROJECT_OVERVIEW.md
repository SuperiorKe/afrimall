# Afrimall Project Overview

## 🎯 Project Summary
**Afrimall** is a modern, full-stack e-commerce platform built with Next.js 15, Payload CMS 3.49.1, and TypeScript. It's designed for African markets with a focus on performance, scalability, and user experience.

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15.4.4 (App Router), React 19.1.0, TypeScript 5.7.3
- **Backend**: Payload CMS 3.49.1 (Headless CMS)
- **Database**: PostgreSQL (production), SQLite (development)
- **Styling**: Tailwind CSS 3.4.3, shadcn/ui components
- **Payments**: Stripe integration
- **Storage**: AWS S3 + CloudFront (optional)
- **Deployment**: Vercel-ready with Docker support

### Key Features
- ✅ Complete e-commerce functionality (products, cart, checkout, orders)
- ✅ Customer authentication & registration
- ✅ Admin panel for order/product management
- ✅ Payment processing with Stripe
- ✅ Responsive design with dark mode
- ✅ SEO optimization
- ✅ Email notifications
- ✅ File upload & media management

## 📁 Project Structure

```
afrimall/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (frontend)/              # Customer-facing pages
│   │   │   ├── page.tsx             # Homepage
│   │   │   ├── products/            # Product catalog & details
│   │   │   ├── cart/                # Shopping cart
│   │   │   ├── checkout/            # Checkout process
│   │   │   ├── auth/                # Customer auth (login/register)
│   │   │   └── account/             # Customer account pages
│   │   ├── (payload)/               # Admin panel
│   │   │   └── admin/               # Payload CMS admin interface
│   │   └── api/                     # Custom API endpoints
│   │       ├── ecommerce/           # E-commerce APIs
│   │       │   ├── products/        # Product CRUD
│   │       │   ├── cart/            # Cart management
│   │       │   ├── orders/          # Order processing
│   │       │   ├── customers/       # Customer auth & management
│   │       │   ├── categories/      # Category management
│   │       │   ├── search/          # Product search
│   │       │   └── stripe/          # Payment processing
│   │       └── admin/               # Admin-specific APIs
│   ├── collections/                 # Payload CMS collections
│   │   ├── Products.ts              # Product schema & validation
│   │   ├── Categories.ts            # Category schema
│   │   ├── Orders.ts                # Order schema & workflow
│   │   ├── Customers.ts             # Customer schema
│   │   ├── ProductVariants.ts       # Product variant management
│   │   ├── ShoppingCart.ts          # Cart persistence
│   │   ├── Media.ts                 # File upload & management
│   │   └── Users.ts                 # Admin user management
│   ├── components/                  # React components
│   │   ├── ecommerce/              # E-commerce specific components
│   │   │   ├── ProductCard.tsx     # Product display card
│   │   │   ├── ProductGrid.tsx     # Product listing grid
│   │   │   ├── ShoppingCartComponent.tsx # Cart UI
│   │   │   ├── CheckoutForm.tsx    # Checkout process
│   │   │   ├── ProductDetail.tsx   # Product detail page
│   │   │   ├── ProductFilters.tsx  # Filtering & search
│   │   │   └── AddToCartButton.tsx # Add to cart functionality
│   │   ├── admin/                   # Admin panel components
│   │   │   ├── AdminOrderDashboard.tsx # Order management
│   │   │   └── OrderDetailsModal.tsx  # Order details view
│   │   ├── ui/                      # Base UI components (shadcn/ui)
│   │   ├── layout/                  # Layout components
│   │   └── forms/                   # Form components
│   ├── contexts/                    # React contexts
│   │   ├── CartContext.tsx          # Shopping cart state management
│   │   └── CustomerAuthContext.tsx  # Customer authentication
│   ├── lib/                         # Utility libraries
│   │   ├── api/                     # API utilities
│   │   ├── payments/                # Stripe integration
│   │   ├── orders/                  # Order management utilities
│   │   ├── products/                # Product utilities
│   │   ├── email/                   # Email services
│   │   └── validation/              # Form validation schemas
│   ├── hooks/                       # Custom React hooks
│   ├── utils/                       # Helper functions
│   ├── types/                       # TypeScript type definitions
│   └── config/                      # Configuration files
│       ├── index.ts                 # Main config export
│       ├── config.ts                # App configuration
│       └── database-init.ts         # Database initialization
├── public/                          # Static assets
├── docs/                           # Documentation
├── scripts/                        # Build & deployment scripts
└── payload-types.ts               # Generated TypeScript types
```

## 🔧 Core Collections (Payload CMS)

### Products Collection
- **Fields**: title, slug, description, price, images, categories, variants, inventory, SEO
- **Access**: Public read, admin write
- **Features**: Product variants, inventory tracking, image galleries

### Orders Collection
- **Fields**: orderNumber, customer, items, status, payment, shipping, totals
- **Access**: Customer own orders, admin full access
- **Features**: Order lifecycle management, status tracking, notes system

### Customers Collection
- **Fields**: email, password, firstName, lastName, phone, preferences
- **Access**: Self-management, admin oversight
- **Features**: Authentication, profile management, order history

### Categories Collection
- **Fields**: title, slug, description, parent category, image
- **Access**: Public read, admin write
- **Features**: Hierarchical categories, filtering support

## 🛒 E-commerce Flow

### Customer Journey
1. **Browse Products** → Product catalog with filtering/search
2. **View Product** → Product detail page with variants/gallery
3. **Add to Cart** → Cart persistence with real-time updates
4. **Checkout** → Multi-step checkout (shipping, payment, confirmation)
5. **Order Confirmation** → Email confirmation, order tracking

### Admin Workflow
1. **Order Management** → View, update status, add notes
2. **Product Management** → Create, edit, manage inventory
3. **Customer Support** → View customer orders, communication
4. **Analytics** → Sales reports, performance metrics

## 🔌 API Endpoints

### E-commerce APIs (`/api/ecommerce/`)
- `GET /products` - List products with filtering
- `GET /products/[slug]` - Get product details
- `GET /categories` - List categories
- `POST /cart` - Add item to cart
- `GET /cart` - Get cart contents
- `POST /orders` - Create order
- `GET /orders` - List customer orders
- `POST /customers/register` - Customer registration
- `POST /customers/login` - Customer login
- `POST /stripe/create-payment-intent` - Create payment intent

### Admin APIs (`/api/admin/`)
- `GET /orders` - List all orders (admin)
- `PATCH /orders/[id]` - Update order status
- `POST /orders/bulk` - Bulk order operations

## 🎨 UI Components

### E-commerce Components
- **ProductCard**: Displays product info with add-to-cart
- **ProductGrid**: Responsive product listing
- **ShoppingCartComponent**: Cart sidebar with item management
- **CheckoutForm**: Multi-step checkout process
- **ProductFilters**: Category, price, search filtering
- **AddToCartButton**: Quantity controls and cart actions

### Admin Components
- **AdminOrderDashboard**: Order management interface
- **OrderDetailsModal**: Detailed order view with status updates

## 🔐 Authentication & Security

### Customer Authentication
- JWT-based authentication
- Email verification for registration
- Password reset functionality
- Session management with localStorage

### Admin Authentication
- Payload CMS built-in authentication
- Role-based access control
- Secure admin panel access

### Security Features
- CSRF protection
- Input validation with Zod schemas
- Secure payment processing with Stripe
- Environment variable protection

## 💳 Payment Integration

### Stripe Integration
- Payment intent creation
- Webhook handling for payment events
- Support for multiple payment methods
- Refund processing
- Payment status tracking

### Checkout Process
1. **Cart Review** → Display items and totals
2. **Shipping Info** → Address collection
3. **Payment** → Stripe payment processing
4. **Confirmation** → Order confirmation and email

## 📊 State Management

### Cart Context
- Persistent cart across sessions
- Real-time updates
- Offline support
- Sync with backend

### Customer Auth Context
- Authentication state
- User profile management
- Login/logout functionality
- Token management

## 🚀 Deployment & Environment

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...

# Payload CMS
PAYLOAD_SECRET=your-secret-key

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email@domain.com
SMTP_PASS=password

# AWS S3 (optional)
AWS_S3_BUCKET=bucket-name
AWS_S3_ACCESS_KEY_ID=access-key
AWS_S3_SECRET_ACCESS_KEY=secret-key
AWS_S3_REGION=us-east-1
AWS_CLOUDFRONT_DOMAIN=domain.cloudfront.net
```

### Build Process
1. **Pre-build**: Database initialization
2. **Build**: Next.js production build
3. **Post-build**: Sitemap generation

### Deployment Options
- **Vercel**: Recommended for easy deployment
- **Docker**: Containerized deployment
- **Self-hosted**: Custom server setup

## 🐛 Recent Issues & Fixes

### Deployment Error (Fixed)
- **Issue**: React hooks warnings causing build failure
- **Files**: `AdminOrderDashboard.tsx`, `OrderDetailsModal.tsx`
- **Fix**: Wrapped `fetchOrders` and `fetchOrderDetails` functions in `useCallback`
- **Status**: ✅ Resolved

### Common Issues
- Database connection problems
- Stripe webhook configuration
- S3 file upload issues
- Build cache problems

## 🔄 Development Workflow

### Local Development
```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Generate types
pnpm run generate:types

# Run linting
pnpm run lint
```

### Code Quality
- TypeScript strict mode
- ESLint with Next.js rules
- Prettier formatting
- Conventional commits

## 📈 Performance Optimizations

### Frontend
- Next.js App Router for optimal performance
- Image optimization with Sharp
- Code splitting and lazy loading
- Responsive images with multiple sizes

### Backend
- Database query optimization
- Caching strategies
- API response optimization
- File upload optimization

## 🔮 Future Enhancements

### Planned Features
- Advanced analytics dashboard
- Multi-language support
- Mobile app integration
- Advanced inventory management
- Customer reviews and ratings
- Wishlist functionality
- Advanced search with filters

### Technical Improvements
- Performance monitoring
- Error tracking
- Automated testing
- CI/CD pipeline
- Database optimization

## 📞 Support & Maintenance

### Key Contacts
- **Developer**: Kenn Macharia
- **LinkedIn**: [kenn-macharia](https://www.linkedin.com/in/kenn-macharia/)
- **Company**: Superior Development

### Documentation
- API documentation in `/docs/`
- Deployment guides
- Contributing guidelines
- Troubleshooting guides

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅
