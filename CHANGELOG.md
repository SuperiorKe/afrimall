# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed
- Fixed Vercel build errors caused by PostgreSQL database connection timeouts during static generation.
- Decoupled `app/(frontend)/products/[slug]/page.tsx` from Payload CMS, changing it to use statically provided `MOCK_PRODUCTS` to prevent `getaddrinfo ENOTFOUND` crashes.
- Updated `app/(frontend)/search/page.tsx` to handle search requests via in-memory mock data filtering instead of running database queries.
