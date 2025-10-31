# Frontend Changelog

All notable changes to the Nephslair frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-XX

### 🎉 Initial Release

Production-ready React frontend for Nephslair content management platform.

### ✨ Added

#### Public Pages

- **Homepage**
  - Latest published posts display
  - Standalone polls sidebar
  - Announcement banner with 1-hour dismissal
  - Loading and error states

- **Project Pages**
  - Project homepage with posts and polls
  - Project about page with details
  - Project downloads page with release files
  - Project changelogs page with version history
  - Unified sidebar: "Latest Version" and "Last Updated" across all project pages

- **Post Pages**
  - Full post content with markdown rendering
  - Embedded polls within posts
  - Linked release downloads
  - Threaded comment system
  - Comment voting
  - Edit history modal
  - Reply functionality

#### Authentication Pages

- **Login Page**
  - Email and password authentication
  - "Forgot password?" link
  - Form validation
  - Error handling

- **Register Page**
  - Username, email, password, confirm password
  - Client-side validation
  - Automatic redirect to login after registration
  - Error handling

- **Forgot Password Page**
  - Email submission form
  - Success message
  - Redirect to login

- **Reset Password Page**
  - Token validation on load
  - New password and confirm password fields
  - Automatic redirect if token invalid
  - Success redirect to login

#### Admin Panel

- **Admin Dashboard**
  - Statistics overview (users, projects, posts, comments, releases, polls)
  - Quick actions (direct link to Create Poll)
  - Centered grid layout

- **Projects Management**
  - List all projects
  - Create new project
  - Edit existing project

- **Posts Management**
  - List all posts with filtering
  - Create post with:
    - Project association
    - Draft/published status
    - Poll linking
    - Release linking
  - Edit post

- **Releases Management**
  - List all releases with file counts
  - Create/edit release:
    - Version and release date
    - File upload (platform required)
    - Orphan file prevention
    - Tooltip for disabled save button

- **Polls Management**
  - List all polls
  - Create poll
  - Edit poll (vote preservation)
  - Poll details with results

- **Comments Management**
  - List all comments
  - Filter and moderation

- **Users Management**
  - List all users
  - User role display

- **Website Settings**
  - Site name and description
  - SEO description
  - Footer contact email
  - Maintenance mode toggle
  - Announcement banner configuration

#### Core Components

- **Layout Components**
  - **Navbar**: Dynamic site name, projects dropdown, user menu
  - **Footer**: Dynamic copyright, contact info from settings
  - **SeoHead**: Dynamic page titles and meta descriptions

- **Common Components**
  - **ErrorBoundary**: Catches and displays React errors
  - **MaintenanceGate**: Blocks public routes during maintenance
  - **Loading**: Loading spinner
  - **ErrorMessage**: Standardized error display
  - **PostCard**: Post preview card
  - **PollWidget**: Poll display widget
  - **AdminRoute**: Route protection for admin pages

#### Advanced Features

- **Maintenance Mode**
  - Full-screen maintenance page
  - Admin routes remain accessible
  - Login page accessible
  - `/register` blocked during maintenance

- **Announcement Banner**
  - Dismissible per message
  - 1-hour persistence in localStorage
  - Resets when announcement text changes
  - Subtle yellow theme

- **SEO Optimization**
  - Dynamic page titles: `{pageTitle} | {siteName}`
  - Meta descriptions
  - Settings-driven SEO
  - Per-page SEO override support

- **Error Handling**
  - ErrorBoundary for React errors
  - Graceful error display
  - Development mode error details

### 🔧 Improved

#### Code Quality & Standards

- **Standardized Services**
  - All API calls use `request()` wrapper
  - Consistent error handling
  - Loading state management

- **Form Handling**
  - `useFormHandler` hook for all forms
  - Centralized validation
  - Consistent form patterns

- **UI Consistency**
  - Unified button styling
  - Standardized form layouts
  - Consistent error display
  - Loading states throughout

#### API Integration

- **API Base URL Management**
  - Priority-based URL determination
  - Environment variable support
  - Runtime configuration support
  - Development/production fallbacks

- **Request Wrapper**
  - Automatic error handling
  - Loading state management
  - Error message display
  - Consistent error propagation

#### User Experience

- **Form Validation**
  - Client-side validation
  - Real-time error display
  - Field-specific error messages

- **Loading States**
  - Spinner animations
  - Disabled buttons during loading
  - Loading indicators

- **Error States**
  - User-friendly error messages
  - Toast notifications
  - Graceful error handling

### 🐛 Fixed

- **API Response Handling**
  - Fixed undefined array access (`.length` on undefined)
  - Safe array handling in services
  - Response validation in `authService`

- **Form Handling**
  - Fixed registration redirect logic
  - Fixed form submission error handling
  - Fixed loading state management

- **Routing**
  - Fixed 404 page for unmatched routes
  - Fixed maintenance mode routing
  - Fixed SPA routing in production

### 🔒 Security

- **Authentication**
  - Secure token storage (localStorage)
  - Automatic token injection in requests
  - Token validation

- **Route Protection**
  - Admin routes protected by `AdminRoute`
  - Maintenance mode routing
  - Authentication checks

### 📊 Performance

- **Code Splitting**
  - Vite automatic code splitting
  - Lazy loading where appropriate

- **Caching**
  - Settings cache in localStorage
  - User data cache
  - Token caching

- **Optimization**
  - Production build optimization
  - Minified JavaScript and CSS
  - Tree-shaking for unused code

### 🎨 UI/UX Improvements

- **Design Consistency**
  - Unified color palette
  - Consistent spacing
  - Standardized typography
  - Dark theme throughout

- **Responsive Design**
  - Mobile-first approach
  - Responsive navigation
  - Adaptive layouts
  - Breakpoint optimization

- **Accessibility**
  - Semantic HTML
  - ARIA labels where needed
  - Keyboard navigation support

## Migration Notes

### Breaking Changes

None - this is the initial release.

### Upgrade Instructions

1. Ensure Node.js v18+
2. Install dependencies: `npm install`
3. Configure `.env` or `.env.production`
4. Build: `npm run build`
5. Deploy `dist/` directory

### Known Limitations

- Basic error boundary (catches React errors only)
- Limited analytics integration
- No offline support (PWA)
- Client-side routing requires server configuration

## Future Enhancements

- PWA support (offline mode, service workers)
- Advanced analytics integration
- Real-time updates (WebSocket)
- Advanced search functionality
- Dark/light theme toggle
- Internationalization (i18n)
- Advanced form validation library integration
- Component library expansion

