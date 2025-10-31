# Backend Changelog

All notable changes to the Nephslair backend API will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-XX

### 🎉 Initial Release

Production-ready backend API for Nephslair content management platform.

### ✨ Added

#### Authentication & User Management

- **User Registration**
  - Email normalization (lowercase) for consistency
  - Username validation (3-50 characters, alphanumeric + underscore)
  - Password hashing with bcryptjs (10 salt rounds)
  - Automatic role assignment (default: user)
  - Welcome email after successful registration

- **User Login**
  - Case-insensitive email search (compatible with existing records)
  - Secure password comparison
  - JWT token generation with configurable expiry
  - Token invalidation on password change

- **Password Reset Flow**
  - Forgot password endpoint: generates secure 32-byte token
  - Reset password endpoint: validates token, expires after 30 minutes
  - Password reset email with modern HTML template
  - JWT invalidation: old tokens become invalid after password reset
  - `password_changed_at` field tracking

- **JWT Authentication**
  - Bearer token authentication
  - Token expiry checking
  - `iat` (issued at) validation against password change time
  - Admin role verification middleware

#### Projects Management

- Full CRUD operations (Create, Read, Update, Delete)
- Project slug generation and uniqueness validation
- Project status management (active/inactive)
- Latest version tracking
- Public endpoints (published projects only)
- Admin endpoints (all projects including drafts)

#### Posts Management

- **Core Features**
  - Full CRUD operations
  - Draft and published status
  - SEO-friendly slug generation
  - Post-to-project association
  - Author attribution

- **Post Voting**
  - Upvote/downvote system
  - Vote counting and aggregation
  - Rate limiting on vote endpoints

- **Post Linking**
  - Post-to-poll linking with display order
  - Post-to-release linking
  - Post-to-download file linking

- **Public Features**
  - Published posts listing with comments count
  - Project-specific post filtering
  - Post details with full associations

#### Releases Management

- **Release CRUD**
  - Version management
  - Release date tracking
  - Published/draft status
  - Release-to-project association

- **File Management**
  - Platform-specific file uploads (Windows, macOS, Linux)
  - File upload validation (platform required before upload)
  - Download tracking (download count increment)
  - Physical file deletion on release/file removal
  - Orphan file prevention

- **Release Linking**
  - Release-to-post linking with display order

#### Polls System

- **Poll Types**
  - Standalone polls (homepage polls)
  - Project-specific polls
  - Post-specific polls

- **Poll Management**
  - Multiple choice options
  - Vote counting per option
  - Poll finalization
  - Active/expired status management
  - End date tracking

- **Intelligent Poll Updates**
  - Vote preservation: existing votes preserved when options updated
  - Option diffing: only adds new options, removes deleted ones, updates changed ones
  - Vote cleanup: votes for deleted options are removed
  - Prevents vote count reset on poll edits

#### Comments System

- **Comment Features**
  - Threaded comments (parent-child relationships)
  - Comment editing
  - Comment history tracking
  - Comment voting (upvote/downvote)
  - Soft delete support

- **Comment Management**
  - Comment-to-post association
  - User attribution
  - Admin comment management

#### Website Settings

- **Site Configuration**
  - Site name and description
  - SEO description
  - Footer contact information

- **Site Control**
  - Maintenance mode toggle
  - Announcement banner (enabled/disabled, custom text)

- **Dynamic Settings**
  - Settings cache for performance
  - Public settings endpoint
  - Admin-only settings update

#### Email System

- **SMTP Integration**
  - Nodemailer integration
  - Configurable via environment variables
  - Mock mode for development/testing

- **Email Templates**
  - Welcome email (modern HTML design)
  - Password reset email (secure, 30-minute expiry)
  - Consistent design language

#### File Upload System

- **Secure Uploads**
  - Multer integration
  - File size limits (500MB)
  - Platform validation
  - File type filtering

- **File Management**
  - Physical file storage
  - Download URL generation
  - File deletion utilities
  - Orphan file prevention

### 🔧 Improved

#### Code Quality & Standards

- **Standardized Responses**
  - Consistent JSON response format: `{ success, data?, message?, error? }`
  - HTTP status code standardization (200, 201, 204, 400, 401, 403, 404, 500)
  - DELETE operations return 204 No Content (no body)

- **Centralized Utilities**
  - `utils/response.js`: Standardized success/error responses
  - `utils/validate.js`: Centralized input validation
  - `utils/files.js`: File operation helpers
  - `utils/email.js`: Email sending abstraction

- **DRY Principles**
  - Removed duplicate code across controllers
  - Reusable helper functions
  - Consistent error handling

#### Database Optimization

- **Indexes & Constraints**
  - Performance indexes on frequently queried fields
  - Unique constraints on email, username, slugs
  - Composite indexes for complex queries

- **Idempotent Migrations**
  - All migrations safe to run multiple times
  - Graceful handling of existing indexes/columns
  - Skip-if-exists pattern

- **Soft Delete & Timestamps**
  - Standardized `deleted_at` support
  - `created_at`, `updated_at` normalization
  - Safe migration handling

#### Security Enhancements

- **Rate Limiting**
  - Authentication endpoints (5 requests per 15 minutes)
  - File upload endpoints (10 requests per minute)
  - Voting endpoints (30 requests per minute)
  - Comment endpoints (30 requests per minute)

- **Input Validation**
  - Required field validation
  - Email format validation
  - Password strength requirements
  - Sanitization of reset tokens

- **Token Security**
  - JWT secret configuration
  - Token expiry enforcement
  - Token invalidation on password change
  - `iat` validation

#### API Documentation

- **Swagger/OpenAPI**
  - Comprehensive endpoint documentation
  - Request/response schemas
  - Authentication requirements
  - Rate limit documentation
  - Dark theme integration

### 🐛 Fixed

- **Password Reset**
  - Fixed double-hashing on password reset
  - Fixed token sanitization (removes quotes/whitespace)
  - Fixed email normalization in reset flow

- **Email System**
  - Fixed email sending failures (graceful degradation)
  - Fixed SMTP configuration handling
  - Fixed mock mode logging

- **Database**
  - Fixed duplicate index errors (idempotent migrations)
  - Fixed missing table handling
  - Fixed column existence checks

- **API Responses**
  - Fixed inconsistent status codes
  - Fixed DELETE responses (now 204 No Content)
  - Fixed error message exposure (development only)

### 🔒 Security

- **Authentication**
  - Email normalization prevents case-sensitivity issues
  - JWT invalidation on password change
  - Secure token generation for password reset

- **Rate Limiting**
  - Prevents brute-force attacks
  - Protects sensitive endpoints
  - In-memory rate limiting

- **Input Validation**
  - Centralized validation prevents injection
  - Required field checking
  - Email format validation

### 📊 Performance

- **Database**
  - Indexes on frequently queried fields
  - Optimized queries with proper associations
  - Soft delete for data retention

- **Caching**
  - Settings cache for reduced database queries
  - Transporter caching for email service

### 🧪 Testing

- **Automated Testing**
  - Jest + Supertest setup
  - HTTP status code validation
  - Response format consistency tests
  - Test coverage reports

- **CI/CD**
  - GitHub Actions workflow
  - Automatic testing on push/PR
  - MySQL service container for isolated testing

### 📝 Documentation

- **API Documentation**
  - Swagger/OpenAPI integration
  - Dark theme for better UX
  - Comprehensive endpoint documentation

- **Testing Guide**
  - Automated testing instructions
  - Manual testing methods
  - CI/CD setup guide

## Migration Notes

### Breaking Changes

None - this is the initial release.

### Upgrade Instructions

1. Ensure Node.js v20+ and MySQL 8.0+
2. Run all migrations: `npx sequelize-cli db:migrate`
3. Configure environment variables (see Setup section)
4. Restart server

### Known Limitations

- Basic role system (admin/user only)
- No file antivirus scanning
- Limited analytics/observability
- In-memory rate limiting (not distributed)

## Future Enhancements

- Role system expansion (moderator, editor, etc.)
- File CDN integration
- Advanced analytics and observability
- Distributed rate limiting (Redis)
- API versioning
- GraphQL endpoint (optional)

