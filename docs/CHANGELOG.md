# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Mobile-friendly pagination with infinite scroll option
- Product transformation utility for consistent data handling
- Enhanced loading states with skeleton screens
- Touch-optimized pagination controls (44px+ touch targets)
- Page size selector (12, 24, 48 items per page)
- Jump to page functionality
- Smart page number display that adapts to screen size
- Skeleton loading animations with shimmer effects

### Fixed
- Related products now display actual product images
- Cart functionality now works from all product listings
- Optimistic cart updates for better UX
- Data structure mismatch between Payload CMS format and component expectations

### Changed
- Consolidated cart operations through CartContext
- Improved error handling with automatic retry on connection restore
- Optimized API pagination for mobile devices (cap at 24 items per request)
- Enhanced offline support with pending operations queue
- Reduced code duplication in cart management
- Better error recovery and user feedback

### Technical Details
- **Mobile Pagination**: Implemented with Intersection Observer for infinite scroll
- **Product Images**: Fixed by standardizing image URL construction (`/api/media/file/{filename}`)
- **Cart Management**: Centralized through React Context with optimistic updates
- **Performance**: Mobile API requests are capped at 24 items for optimal loading times
