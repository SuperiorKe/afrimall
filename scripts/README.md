# 🔧 Afrimall Scripts

This directory contains all build, database, and utility scripts organized by purpose.

## 📁 Directory Structure

```
scripts/
├── build/              # Build-related scripts
├── database/           # Database initialization scripts
├── database-init/      # Payload database initialization
├── tests/              # Test and validation scripts
└── README.md          # This file
```

---

## 🏗️ Build Scripts (`build/`)

### `pre-build.js`
**Purpose**: Pre-build script that ensures database is ready before Next.js build  
**Usage**: Automatically runs via `pnpm run prebuild` (defined in `package.json`)  
**What it does**:
- Checks if we're in production environment with `DATABASE_URL`
- Initializes database schema by generating types
- Generates import map for Payload CMS
- Allows build to continue even if database initialization has warnings

**When to use**: Automatically runs before every build - no manual execution needed

### `build-with-db-init.js`
**Purpose**: Build script that includes database initialization step  
**Usage**: `pnpm run build:with-db`  
**What it does**:
- Runs database initialization
- Executes Next.js production build
- Ensures database is ready before building

**When to use**: When you want to build with explicit database initialization

---

## 🗄️ Database Scripts (`database/`)

### `init-postgres.js`
**Purpose**: Initialize PostgreSQL database by dropping and clearing existing tables  
**Usage**: `node scripts/database/init-postgres.js`  
**What it does**:
- Connects to PostgreSQL database using `DATABASE_URL`
- Drops all existing Payload CMS tables (CASCADE)
- Clears database for fresh start
- Prepares database for Payload to create schema automatically

**⚠️ Warning**: This script will delete all data! Use with caution in production.

**Environment Requirements**:
- `DATABASE_URL` in `.env.local`
- PostgreSQL database must be accessible

**When to use**:
- Setting up fresh database
- Resetting database during development
- Before running migrations on empty database

---

## 🔄 Database Initialization (`database-init/`)

These scripts handle Payload CMS database schema initialization.

### `db-init.js`
**Purpose**: Initialize Payload CMS database schema  
**Usage**: `node scripts/database-init/db-init.js`  
**What it does**:
- Generates TypeScript types (triggers schema creation)
- Verifies database connection via migration status

**When to use**: When you need to initialize a fresh database schema

### `init-db.js`
**Purpose**: Database initialization with collection verification  
**Usage**: `node scripts/database-init/init-db.js`  
**What it does**:
- Initializes database schema
- Tests database connection
- Verifies all Payload collections are accessible
- Counts documents in each collection

**When to use**: For comprehensive database initialization and verification

### `force-db-init.js`
**Purpose**: Force database initialization (for troubleshooting)  
**Usage**: `node scripts/database-init/force-db-init.js`  
**What it does**:
- Aggressively initializes database
- Useful when normal initialization fails

**When to use**: When standard database initialization fails

---

## 🧪 Test Scripts (`tests/`)

### `test-s3-config.js`
**Purpose**: Test AWS S3 configuration and connectivity  
**Usage**: `node scripts/tests/test-s3-config.js`  
**What it does**:
- Tests S3 client connection
- Lists available S3 buckets
- Verifies target bucket exists
- Validates AWS credentials

**Environment Requirements**:
- `AWS_S3_BUCKET` in `.env.local`
- `AWS_S3_ACCESS_KEY_ID` in `.env.local`
- `AWS_S3_SECRET_ACCESS_KEY` in `.env.local`
- `AWS_S3_REGION` in `.env.local`

**When to use**:
- Verifying S3 credentials are correct
- Troubleshooting S3 file upload issues
- Testing S3 configuration before deployment

---

## 📝 Usage Examples

### Development Workflow

```bash
# Start development server (automatic pre-build runs)
pnpm run dev

# Build for production
pnpm run build

# Build with explicit database initialization
pnpm run build:with-db
```

### Database Management

```bash
# Initialize fresh PostgreSQL database
node scripts/database/init-postgres.js

# Initialize Payload CMS schema
node scripts/database-init/init-db.js

# Test S3 configuration
node scripts/tests/test-s3-config.js
```

### Troubleshooting

```bash
# Force database initialization
node scripts/database-init/force-db-init.js

# Test database connection
node scripts/database-init/db-init.js
```

---

## 🔧 Script Development Guidelines

When creating new scripts:

1. **Place scripts in appropriate directory**:
   - Build-related → `build/`
   - Database-related → `database/` or `database-init/`
   - Tests → `tests/`

2. **Include proper documentation**:
   - Add JSDoc comments at the top
   - Explain purpose and usage
   - List environment requirements

3. **Error handling**:
   - Use try-catch blocks
   - Provide helpful error messages
   - Exit with appropriate codes

4. **Environment variables**:
   - Document required env vars
   - Load from `.env.local` using dotenv
   - Provide clear error if missing

---

## 🔗 Related Documentation

- [Deployment Guide](../docs/deployment/DEPLOYMENT_CHECKLIST.md)
- [Database Setup](../docs/guides/S3_SETUP_GUIDE.md)
- [S3 Configuration](../docs/guides/S3_SETUP_GUIDE.md)
- [Main README](../README.md)

---

**Last Updated**: December 2024  
**Maintainer**: Afrimall Development Team

