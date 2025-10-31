# Nephslair

Modern, opinionated content platform for posts, projects, releases and polls — with clean code, consistent APIs, admin tools, and a polished frontend UX.

## Overview
- Full-stack JS: Node/Express + Sequelize (MySQL), React + Vite
- Admin-first workflow: Posts, Projects, Releases (files), Polls, Comments
- Clean code + DRY: centralized validation, error/response helpers, file utils
- Performance + integrity: indexes, unique constraints, soft-delete/timestamps
- Safety: JWT auth, role-based admin guards, rate-limiting on sensitive routes
- UX standards: request() wrapper, useFormHandler hook, unified buttons, SEO/meta, maintenance mode, announcement bar

## Core Features
- Posts with project association, comments, voting
- Projects with unified sidebar (Latest Version, Last Updated) across pages
- Releases with files (upload, manage), post-to-release linking
- Polls (standalone/project/post), vote counts preserved on updates
- Comments with history, up/down votes, threaded display
- Admin dashboard + CRUD pages for everything
- Website Settings (site name/description, SEO description, footer contact, maintenance mode, announcement banner)
- Auth: Login/Register, Forgot/Reset Password (email-ready; SMTP optional)
- Maintenance Mode: full site offline page for users, admins + login remain accessible
- Announcement Bar: dismissible one hour per message

## Architecture
```
backend/
  server.js                # Express app + swagger + static downloads
  config/                  # sequelize config, swagger
  controllers/             # business logic
  middleware/              # auth/adminAuth, rateLimit, upload
  models/                  # Sequelize models + associations + sync
  migrations/              # idempotent, guarded schema changes
  routes/                  # REST endpoints
  utils/                   # response, validate, files, email mock/SMTP

frontend/
  src/components           # layout (Navbar/Footer), common widgets, Maintenance, SeoHead
  src/pages                # Admin (Dashboard, Settings, Posts, Projects, Releases, Polls), Home, Post, Project
  src/services             # api (axios + token), request wrapper, entity services
  src/utils                # useFormHandler, helpers
```

## API Conventions
- Responses: `{ success, data?, message?, error? }`
- Errors: consistent, validation-first
- Rate limits: auth, upload, voting, comments
- Auth: Bearer JWT; admin endpoints gated by adminAuth
- **Status Codes**: REST-compliant (200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error)

## Notable Backend Utilities
- `utils/response.js`: standardized success/error responses
- `utils/validate.js`: required fields validation
- `utils/files.js`: download URL + physical deletion helpers
- `utils/email.js`: SMTP via env, safe mock if unset
- **Testing**: Jest + Supertest for HTTP status code validation

## Database
- MySQL via Sequelize
- Indexes & unique constraints for core tables
- Soft delete + timestamps standardization
- Hardened migrations (skip-if-exists, guarded operations)

## Frontend Standards
- `services/api.js`: baseURL, token injector, dev logs, `refreshSettingsCache()`
- `services/request.js`: error/loading wrapper
- `utils/useFormHandler.js`: state + validation + submit wrapper
- Unified button styling and disabled/loading states
- Navbar/SEO/Footer driven by Website Settings cache
- `MaintenanceGate`: blocks public routes during maintenance (admins + login allowed)
- Announcement bar: subtle yellow, dismiss persists 1 hour per message

## Setup
### Backend
Create `.env` with:
```
PORT=
NODE_ENV=
BASE_URL=
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_DIALECT=
JWT_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
FRONTEND_BASE_URL=
```
Install & migrate:
```
npm i
npx sequelize-cli db:migrate --config backend/config/config.js --migrations-path backend/migrations
node backend/server.js
```

### Frontend
Create `.env` (for development) or `.env.production` (for production build):
```
VITE_API_BASE_URL=https://api.nephslair.com
```
**Note:** The `/api` suffix will be added automatically if not present.

Install & run:
```
npm i
npm run dev
```

**Production Build:**
```bash
# Create .env.production with your backend URL
VITE_API_BASE_URL=https://api.nephslair.com

# Then build
npm run build
```

## Key Workflows
- Forgot/Reset Password: token emailed (mock if SMTP missing); reset invalidates old JWTs (`password_changed_at`, middleware checks `iat`).
- Release Files: requires platform before upload; prevents orphan pending file on save; tooltip explains disabled save.
- Poll Update: preserves vote counts, diffs options, only add/delete/keep.
- Maintenance Mode: toggled in Website Settings; blocks public except `/login` and all `/admin` paths.

## Extending
- Social links in footer, per-page SEO overrides
- Email provider integration (SendGrid/Mailgun)
- Analytics/observability, audit logs, feature flags
- Cache layer for high-traffic endpoints

## Security Notes
- Admin-only routes hardened by `auth` + `adminAuth`
- Rate limits for auth/upload/vote/comment
- Standardized error surfaces (no stack in production)
- JWT invalidation on password change

## Developer Experience
- DRY helpers, minimal boilerplate
- Safe migrations (idempotent add, guarded change/remove)
- Predictable UI patterns (forms, buttons, loaders)

## Testing

### Automated Tests

The project includes automated tests using Jest + Supertest for HTTP status code validation.

**Running Tests:**
```bash
cd backend

# Run all tests with coverage
npm test

# Run only status code tests
npm run test:status

# Watch mode (auto-run on changes)
npm run test:watch
```

**Test Coverage:**
- Coverage reports are generated in `backend/coverage/`
- Tests cover HTTP status codes (200, 201, 204, 400, 401, 403, 404)
- Response format consistency validation

### CI/CD (GitHub Actions)

Automated tests run on every push/PR via GitHub Actions:

- **Service Container**: Automatic MySQL 8.0 container for isolated testing
- **No Configuration Needed**: Tests run automatically on push to `main` or `develop`
- **Results**: Check the **Actions** tab in your GitHub repository

**Workflow File:** `.github/workflows/test.yml`

For detailed testing documentation, see [backend/TESTING.md](./backend/TESTING.md)

### Manual Testing

You can also test manually using:
- **Swagger UI**: `http://localhost:3001/api-docs`
- **Postman/cURL**: See [backend/TESTING.md](./backend/TESTING.md) for examples
- **Browser DevTools**: Network tab for status code inspection

## License
This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.
