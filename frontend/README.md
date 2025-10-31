# Nephslair Frontend

Modern, responsive React frontend for the Nephslair content management platform. Built with Vite, React Router, and Tailwind CSS.

## 📋 Overview

The Nephslair frontend provides a polished user experience for viewing and interacting with content, as well as a comprehensive admin panel for content management. Built with modern React patterns, custom hooks, and standardized UI components.

### Technology Stack

- **Build Tool**: Vite 6.x
- **Framework**: React 18.3
- **Routing**: React Router 6.x
- **Styling**: Tailwind CSS 3.x
- **HTTP Client**: Axios
- **Markdown**: react-markdown + marked
- **Date Formatting**: date-fns
- **Icons**: react-icons
- **Notifications**: react-hot-toast
- **Form Handling**: Custom `useFormHandler` hook

## 🎯 Core Features

### 1. **Public Pages**

#### Homepage
- **Posts Display**: Latest published posts with excerpts
- **Standalone Polls**: Homepage polls sidebar
- **Announcement Banner**: 
  - Dismissible per message
  - Persists for 1 hour in localStorage
  - Resets when announcement text changes
  - Subtle yellow theme

#### Project Pages
- **Project Homepage**: Posts, polls, and project information
- **Project About**: Project description and details
- **Project Downloads**: Release files with download counts
- **Project Changelogs**: Version history and release notes
- **Unified Sidebar**: "Latest Version" and "Last Updated" across all project pages

#### Post Pages
- **Post Display**: Full post content with markdown rendering
- **Post Polls**: Embedded polls within posts
- **Post Releases**: Linked release downloads
- **Post Comments**: 
  - Threaded comment system
  - Comment voting
  - Edit history modal
  - Reply functionality

### 2. **Authentication Pages**

#### Login Page
- Email and password authentication
- "Forgot password?" link
- Form validation with `useFormHandler`
- Error handling and loading states

#### Register Page
- Username, email, password, and confirm password
- Client-side validation
- Automatic redirect to login after successful registration
- Error handling

#### Forgot Password Page
- Email submission
- Success message (regardless of email existence)
- Redirect to login after submission

#### Reset Password Page
- Token validation on page load
- New password and confirm password fields
- Automatic redirect if token invalid/expired
- Success redirect to login

### 3. **Admin Panel**

#### Admin Dashboard
- Statistics overview:
  - Total users, projects, posts, comments, releases, polls
- Quick actions:
  - Direct link to "Create Poll"
  - Quick access to main admin sections
- Centered grid layout

#### Projects Management
- **Manage Projects**: List all projects with actions
- **Create Project**: New project creation form
- **Edit Project**: Update existing projects

#### Posts Management
- **Manage Posts**: List all posts with filtering
- **Create Post**: New post creation with:
  - Project association
  - Draft/published status
  - Poll linking
  - Release linking
- **Edit Post**: Update existing posts

#### Releases Management
- **Manage Releases**: List all releases with file counts
- **Create/Edit Release**: Release form with:
  - Version and release date
  - File upload (requires platform selection)
  - Orphan file prevention
  - Tooltip for disabled save button

#### Polls Management
- **Manage Polls**: List all polls with status
- **Create Poll**: New poll creation
- **Edit Poll**: Update polls (preserves votes)
- **Poll Details**: View poll results and statistics

#### Comments Management
- **Manage Comments**: List all comments
- Filter and moderation tools

#### Users Management
- **Manage Users**: List all users
- User role display

#### Website Settings
- **Site Configuration**:
  - Site name
  - Site description
  - SEO description
  - Footer contact email
- **Site Control**:
  - Maintenance mode toggle
  - Announcement banner (enabled/disabled, text)
- **Dynamic Updates**: Changes reflect immediately in header/footer

### 4. **Core Components**

#### Layout Components

- **Navbar**: 
  - Dynamic site name from settings
  - Projects dropdown
  - User menu with admin access
  - Responsive design

- **Footer**: 
  - Dynamic copyright: `© YEAR SITENAME. All rights reserved.`
  - Contact information from settings
  - Responsive layout

- **SeoHead**: 
  - Dynamic page titles: `{pageTitle} | {siteName}`
  - Meta description management
  - Fallback to settings SEO description

#### Common Components

- **ErrorBoundary**: Catches and displays React errors gracefully
- **MaintenanceGate**: Blocks public routes during maintenance (admins + login allowed)
- **Loading**: Loading spinner component
- **ErrorMessage**: Standardized error display
- **PostCard**: Post preview card
- **PollWidget**: Poll display widget
- **AdminRoute**: Route protection for admin pages

### 5. **Advanced Features**

#### Maintenance Mode
- Full-screen maintenance page for public users
- Admin routes remain accessible
- Login page accessible
- `/register` blocked during maintenance
- Toggle via Website Settings

#### Announcement Banner
- Dismissible per message
- 1-hour persistence in localStorage
- Resets when announcement text changes
- Subtle yellow theme

#### SEO Optimization
- Dynamic page titles
- Meta descriptions
- Settings-driven SEO
- Per-page SEO override support

#### Error Handling
- **ErrorBoundary**: Catches React errors
- Graceful error display
- Development mode error details
- Production-friendly error messages

## 🏗️ Architecture

```
frontend/
├── src/
│   ├── App.jsx              # Main app component with routing
│   ├── main.jsx             # React entry point
│   ├── components/
│   │   ├── common/           # Reusable components
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Maintenance.jsx
│   │   │   ├── SeoHead.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── ErrorMessage.jsx
│   │   │   ├── PostCard.jsx
│   │   │   ├── PollWidget.jsx
│   │   │   └── AdminRoute.jsx
│   │   ├── layout/           # Layout components
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   └── post/             # Post-specific components
│   │       ├── PostPolls.jsx
│   │       └── PostReleases.jsx
│   ├── pages/
│   │   ├── Home/             # Homepage
│   │   ├── Project/          # Project pages
│   │   ├── Post/             # Post pages
│   │   ├── Auth/             # Authentication pages
│   │   ├── Admin/             # Admin panel
│   │   └── NotFound.jsx       # 404 page
│   ├── services/
│   │   ├── api.js            # Axios instance + baseURL
│   │   ├── request.js        # Request wrapper (error/loading)
│   │   ├── authService.js    # Authentication services
│   │   ├── postService.js    # Post services
│   │   ├── projectService.js # Project services
│   │   ├── pollService.js    # Poll services
│   │   ├── releaseService.js # Release services
│   │   └── commentService.js # Comment services
│   ├── utils/
│   │   ├── useFormHandler.js # Form state management hook
│   │   ├── constants.js      # Constants (API URL, keys)
│   │   ├── helpers.js        # Utility functions
│   │   └── pollEvents.js     # Poll event system
│   └── context/
│       └── AuthContext.jsx   # Authentication context
├── public/
│   └── config.js            # Runtime API configuration
└── index.html               # HTML template
```

## 🔧 Setup

### Prerequisites

- Node.js v18 or higher
- npm or yarn

### Installation

1. **Install Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Create `.env` file (Development):**
   ```env
   VITE_API_BASE_URL=http://localhost:3001
   ```

3. **Create `.env.production` file (Production Build):**
   ```env
   VITE_API_BASE_URL=https://api.nephslair.com
   ```
   **Note:** The `/api` suffix is added automatically if not present.

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

5. **Build for Production:**
   ```bash
   npm run build
   ```

## 🌐 API Configuration

### Priority Order

The frontend determines the API base URL in the following priority:

1. **`VITE_API_BASE_URL`** (from `.env` or `.env.production`) - Highest priority
2. **`window.__APP_CONFIG__.API_BASE_URL`** (from `public/config.js`) - Runtime override
3. **`window.location.origin + '/api'`** (production fallback) - Same domain
4. **`http://localhost:3001/api`** (development fallback)

### Runtime Configuration

You can override the API URL at runtime without rebuilding:

1. Edit `public/config.js`:
   ```javascript
   window.__APP_CONFIG__ = {
     API_BASE_URL: 'https://api.nephslair.com/api'
   };
   ```

2. This file is included in `index.html` and loaded before the app starts

## 🎨 UI Standards

### Form Handling

All forms use the `useFormHandler` hook:
```javascript
const form = useFormHandler(initialValues, validateFunction);
```

**Features:**
- Centralized state management
- Built-in validation
- Loading states
- Error handling
- `setFieldValue` for programmatic updates
- `resetForm` for clearing forms

### Request Wrapper

All API calls use the `request()` wrapper:
```javascript
await request(() => api.get('/endpoint'), setError, setLoading);
```

**Features:**
- Automatic error handling
- Loading state management
- Error message display
- Consistent error propagation

### Button Styling

Standardized button styles:
- **Primary**: Purple background (`bg-purple-600`)
- **Secondary**: Neutral gray (`bg-neutral-800`)
- **Disabled**: Gray with opacity
- **Loading**: Spinner animation

### Unified Patterns

- Consistent error display
- Standardized loading states
- Unified form layouts
- Responsive design throughout

## 🔐 Authentication Flow

1. **Login**: Email/password → JWT token → localStorage
2. **Registration**: User data → Account created → Welcome email → Redirect to login
3. **Forgot Password**: Email → Reset token → Email sent
4. **Reset Password**: Token + New password → Password updated → Redirect to login

### Token Management

- Stored in `localStorage` as `nephslair_token`
- Automatically included in API requests (except login/register)
- User data cached in `localStorage` as `nephslair_user`
- Settings cache in `localStorage` as `website_settings`

## 🎯 Key Workflows

### Post Creation Flow

1. Admin selects project (optional)
2. Enters post title, content, excerpt
3. Sets status (draft/published)
4. Can link polls and releases
5. Form validation before submission
6. Success redirect or error display

### Release File Upload Flow

1. Select platform (required before upload)
2. Choose file and upload
3. File must be added to release before saving
4. "Add File to Release" button adds file to pending list
5. Save button disabled if pending file exists (with tooltip)
6. On save, all files are linked to release

### Poll Update Flow

1. Edit poll question and options
2. System automatically:
   - Preserves existing votes
   - Adds new options (with 0 votes)
   - Updates changed options (keeps votes)
   - Removes deleted options (deletes associated votes)

### Comment Threading

1. Reply to comment creates child comment
2. Threaded display with indentation
3. Edit history tracked
4. Voting available on all comments

## 🔧 Custom Hooks

### `useFormHandler`

Centralized form state management:

```javascript
const form = useFormHandler(
  { email: '', password: '' },
  (values) => {
    const errors = {};
    if (!values.email) errors.email = 'Email required';
    return errors;
  }
);

// Usage
<form onSubmit={form.handleSubmit(handleSubmit)}>
  <input 
    name="email"
    value={form.form.email}
    onChange={form.handleChange}
  />
  {form.errors.email && <span>{form.errors.email}</span>}
</form>
```

**Features:**
- State management (`form.form`)
- Validation errors (`form.errors`)
- Loading state (`form.loading`)
- Field change handler (`form.handleChange`)
- Submit handler (`form.handleSubmit`)
- Programmatic updates (`form.setFieldValue`)
- Form reset (`form.resetForm`)

## 🎨 Styling

### Tailwind CSS

- Custom color palette (purple accent, neutral grays)
- Responsive design utilities
- Dark theme throughout
- Consistent spacing and typography

### Component Styling

- **Cards**: `bg-neutral-900/50 border border-neutral-800`
- **Inputs**: `bg-neutral-950 border border-neutral-800`
- **Buttons**: Purple primary, gray secondary
- **Loading States**: Spinner animations

## 🐛 Error Handling

### Error Boundary

- Catches React component errors
- Displays user-friendly error message
- Development mode shows stack trace
- "Reload Page" and "Go Home" buttons

### API Errors

- Centralized error handling via `request()` wrapper
- Toast notifications for errors
- Error messages from API responses
- Graceful degradation

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Responsive navigation
- Adaptive layouts

## 🚀 Production Build

### Build Process

```bash
npm run build
```

**Output:**
- `dist/` directory with optimized assets
- Minified JavaScript and CSS
- Tree-shaking for unused code
- Asset optimization

### Deployment

1. Build the frontend: `npm run build`
2. Copy `dist/` contents to your web server
3. Ensure `.htaccess` (Apache) or server config handles SPA routing
4. Configure `public/config.js` if needed for runtime API URL override

### SPA Routing

For production, ensure all routes redirect to `index.html`:

**Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](../LICENSE) file for details.

