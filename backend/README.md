# Nephslair Backend API

Modern, production-ready REST API backend for a content management platform built with Node.js, Express, and Sequelize (MySQL).

## 📋 Overview

The Nephslair backend provides a comprehensive API for managing projects, posts, releases, polls, comments, and user authentication. Built with clean code principles, standardized responses, and comprehensive error handling.

### Technology Stack

- **Runtime**: Node.js (v20+)
- **Framework**: Express.js 5.x
- **ORM**: Sequelize 6.x
- **Database**: MySQL 8.0+
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer (SMTP support, mock mode for development)
- **File Upload**: Multer
- **Documentation**: Swagger/OpenAPI (with dark theme)
- **Testing**: Jest + Supertest

## 🎯 Core Features

### 1. **Authentication & Authorization**

- **User Registration**: Email normalization (lowercase), username validation
- **User Login**: Case-insensitive email search, secure password comparison
- **JWT Token Management**: Configurable expiry, token invalidation on password change
- **Password Reset Flow**:
  - Forgot password: Generates secure token, sends email with reset link
  - Reset password: Validates token, expires after 30 minutes
  - JWT invalidation: Old tokens invalidated after password reset
- **Role-Based Access Control**: Admin and user roles with middleware protection

### 2. **Projects Management**

- Create, read, update, delete projects
- Project slug generation and uniqueness
- Project status (active/inactive)
- Latest version tracking
- Public and admin endpoints

### 3. **Posts Management**

- Full CRUD operations for posts
- Post-to-project association
- Draft and published status
- Post voting (upvote/downvote)
- Post-to-poll linking
- Post-to-release linking
- Post-to-download file linking
- Public posts listing with comments count
- SEO-friendly slug generation

### 4. **Releases Management**

- Release versioning and management
- Release file uploads with platform selection (Windows, macOS, Linux)
- File download tracking
- Release-to-project association
- Release-to-post linking
- Release date management
- Published/draft status

### 5. **Polls System**

- Standalone polls (homepage polls)
- Project-specific polls
- Post-specific polls
- Multiple choice options
- Vote counting and preservation
- Intelligent poll updates: preserves existing votes when options change
- Poll finalization and results
- Active/expired status management

### 6. **Comments System**

- Threaded comments (parent-child relationships)
- Comment editing with history tracking
- Comment voting (upvote/downvote)
- Soft delete support
- Comment-to-post association
- User attribution

### 7. **Website Settings**

- Site name and description
- SEO description
- Footer contact information
- Maintenance mode toggle
- Announcement banner (enabled/disabled, custom text)
- Dynamic settings cache

### 8. **Changelogs**

- Project changelog entries
- Release date association
- Version tracking

### 9. **File Management**

- Secure file upload (Multer with size limits)
- Physical file deletion on release/file removal
- Download URL generation
- Platform-specific file organization

### 10. **Email System**

- SMTP configuration via environment variables
- Mock email mode (development/testing)
- Welcome email (after registration)
- Password reset email
- Modern HTML email templates

## 🏗️ Architecture

```
backend/
├── server.js              # Express app entry point
├── app.js                 # Express app configuration (for testing)
├── config/
│   ├── config.js          # Sequelize CLI configuration
│   ├── database.js        # Sequelize instance
│   └── swagger.js         # Swagger/OpenAPI documentation
├── controllers/           # Business logic layer
│   ├── authController.js      # Authentication & password reset
│   ├── projectController.js   # Projects CRUD
│   ├── postController.js      # Posts CRUD & voting
│   ├── releaseController.js   # Releases & file management
│   ├── pollController.js      # Polls & voting
│   ├── commentController.js   # Comments & voting
│   ├── settingsController.js  # Website settings
│   ├── userController.js     # User management
│   ├── changelogController.js # Changelogs
│   └── uploadController.js    # File uploads
├── middleware/
│   ├── auth.js            # JWT authentication
│   ├── adminAuth.js       # Admin role verification
│   ├── rateLimit.js       # Rate limiting (in-memory)
│   └── upload.js          # Multer file upload
├── models/                # Sequelize models & associations
│   ├── User.js
│   ├── Project.js
│   ├── Post.js
│   ├── Release.js
│   ├── Poll.js
│   ├── Comment.js
│   └── index.js           # Model associations
├── routes/                # API route definitions
│   ├── auth.js            # Authentication routes
│   ├── projects.js        # Project routes
│   ├── posts.js           # Post routes
│   ├── releases.js        # Release routes
│   ├── polls.js           # Poll routes
│   ├── comments.js        # Comment routes
│   ├── settings.js        # Settings routes
│   └── upload.js          # Upload routes
├── migrations/            # Database migrations (idempotent)
├── utils/                 # Utility functions
│   ├── response.js        # Standardized API responses
│   ├── validate.js        # Input validation
│   ├── files.js           # File operations
│   └── email.js           # Email sending (SMTP/mock)
├── __tests__/             # Jest test suites
│   ├── statusCodes.test.js
│   └── health.test.js
└── jest.config.js         # Jest configuration
```

## 📡 API Conventions

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Error details (development only)"
}
```

### HTTP Status Codes

- **200 OK**: Successful GET, PUT requests
- **201 Created**: Successful POST requests (resource created)
- **204 No Content**: Successful DELETE requests (no body)
- **400 Bad Request**: Validation errors, invalid input
- **401 Unauthorized**: Missing/invalid authentication token
- **403 Forbidden**: Insufficient permissions (not admin)
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Server Error**: Internal server errors

### Authentication

- **Bearer Token**: JWT token sent in `Authorization` header
  ```
  Authorization: Bearer <token>
  ```
- **Token Expiry**: Configurable via `JWT_EXPIRE` env var (default: 7d)
- **Token Invalidation**: Tokens invalidated after password change

### Rate Limiting

In-memory rate limiting applied to:
- `/api/auth/login` and `/api/auth/register` (5 requests per 15 minutes)
- `/api/upload/*` (10 requests per minute)
- `/api/posts/:id/vote` (30 requests per minute)
- `/api/polls/:id/vote` (30 requests per minute)
- `/api/comments` and `/api/comments/:id/vote` (30 requests per minute)

## 🔧 Setup

### Prerequisites

- Node.js v20 or higher
- MySQL 8.0 or higher
- npm or yarn

### Installation

1. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create `.env` file:**
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=production
   BASE_URL=https://api.nephslair.com

   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=nephslair
   DB_DIALECT=mysql
   DB_PORT=3306

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
   JWT_EXPIRE=7d

   # Email Configuration (SMTP - Optional)
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@example.com
   SMTP_PASS=your_password
   SMTP_FROM=noreply@nephslair.com

   # Frontend URL (for email links)
   FRONTEND_BASE_URL=https://nephslair.com
   ```

3. **Run Database Migrations:**
   ```bash
   npx sequelize-cli db:migrate \
     --config config/config.js \
     --migrations-path migrations \
     --env production
   ```

4. **Start Server:**
   ```bash
   npm start
   # Or for development:
   npm run dev
   ```

## 🗄️ Database

### Migrations

All migrations are **idempotent** (safe to run multiple times):

- Index creation: Skips if index already exists
- Column addition: Handles missing columns gracefully
- Soft delete fields: Checks before adding
- Unique constraints: Prevents duplicate errors

**Running Migrations:**
```bash
# Run all pending migrations
npx sequelize-cli db:migrate \
  --config config/config.js \
  --migrations-path migrations

# Check migration status
npx sequelize-cli db:migrate:status \
  --config config/config.js \
  --migrations-path migrations

# Rollback last migration
npx sequelize-cli db:migrate:undo \
  --config config/config.js \
  --migrations-path migrations
```

### Key Database Features

- **Indexes**: Performance indexes on frequently queried fields
- **Unique Constraints**: Email, username, slugs
- **Soft Delete**: `deleted_at` column support
- **Timestamps**: `created_at`, `updated_at` standardization
- **Foreign Keys**: Cascade deletes where appropriate

## 🔐 Security Features

### Authentication & Authorization

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds (10)
- **Token Invalidation**: Tokens invalidated after password change
- **Role-Based Access**: Admin routes protected by `adminAuth` middleware
- **Email Normalization**: Case-insensitive email handling

### Rate Limiting

- In-memory rate limiting for sensitive endpoints
- Configurable windows and request limits
- Prevents brute-force attacks on authentication
- Protects file upload endpoints

### Input Validation

- Centralized validation via `utils/validate.js`
- Required field checking
- Email format validation
- Password strength requirements

### Error Handling

- Standardized error responses
- No sensitive information in production errors
- Proper HTTP status codes
- Detailed error logging (development mode)

## 📧 Email System

### Configuration

The email system supports two modes:

1. **SMTP Mode** (Production):
   - Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
   - Real emails sent via Nodemailer

2. **Mock Mode** (Development):
   - If SMTP not configured, logs email content to console
   - Prevents email failures from breaking functionality

### Email Templates

- **Welcome Email**: Sent after successful registration
  - Modern HTML design
  - Sign-in button
  - Homepage link

- **Password Reset Email**: Sent for password reset requests
  - Secure reset link (30-minute expiry)
  - Modern HTML design
  - Security warnings

## 🧪 Testing

### Automated Testing (Jest + Supertest)

**Run Tests:**
```bash
# Run all tests with coverage
npm test

# Run only status code tests
npm run test:status

# Watch mode (auto-run on changes)
npm run test:watch
```

**Test Coverage:**
- HTTP status code validation (200, 201, 204, 400, 401, 403, 404)
- Response format consistency
- Coverage reports in `coverage/` directory

### Manual Testing

- **Swagger UI**: `http://localhost:3001/api-docs`
- **cURL/Postman**: Test endpoints directly
- See [TESTING.md](./TESTING.md) for detailed testing guide

## 📚 API Documentation

Interactive API documentation available at:

```
http://localhost:3001/api-docs
```

Features:
- Dark theme
- All endpoints documented
- Request/response schemas
- Authentication requirements
- Rate limit information

## 🚀 Deployment

### VPS Deployment

See deployment guide for VPS setup:
- SSH-based updates
- PM2 process management
- Environment variable configuration
- Database migration strategies

### Environment Variables

**Required:**
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production/test)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Database credentials
- `JWT_SECRET`: Secret key for JWT signing

**Optional:**
- `SMTP_*`: Email configuration (if not set, mock mode used)
- `FRONTEND_BASE_URL`: Frontend URL for email links
- `BASE_URL`: API base URL

## 🔧 Utilities

### Response Helpers (`utils/response.js`)

- `success(res, data, message, status)`: Standardized success response
- `error(res, message, status, errorDetails)`: Standardized error response
- Handles 204 No Content (no body sent)

### Validation (`utils/validate.js`)

- `validateFields(body, requiredFields)`: Checks for required fields
- Returns error message or null

### File Operations (`utils/files.js`)

- `buildDownloadUrl(fileId)`: Generates download URL
- `deletePhysicalDownload(filePath)`: Safely deletes files

### Email (`utils/email.js`)

- `sendMail({ to, subject, html, text })`: General email sending
- `sendWelcomeEmail(user)`: Registration welcome email
- `sendPasswordResetEmail(user, token)`: Password reset email

## 🐛 Troubleshooting

### Common Issues

1. **Migration Errors**: Migrations are idempotent - safe to re-run
2. **Email Failures**: Check SMTP configuration or use mock mode
3. **JWT Errors**: Verify `JWT_SECRET` is set and consistent
4. **Database Connection**: Verify credentials and MySQL is running

### Logs

- Development: Detailed console logs
- Production: Minimal logging (errors only)
- Email: Logged in development, silent in production

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](../LICENSE) file for details.

