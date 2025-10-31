# Nephslair

Modern, production-ready content management platform for posts, projects, releases, and polls. Built with clean code principles, standardized APIs, comprehensive admin tools, and a polished frontend UX.

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ (v20+ recommended)
- **MySQL** 8.0+
- **npm** or **yarn**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/DevNeph/nephslair.git
   cd nephslair
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Create .env file (see backend/README.md)
   npx sequelize-cli db:migrate --config config/config.js --migrations-path migrations
   npm start
   ```
   📖 **For detailed backend setup, see [backend/README.md](./backend/README.md)**

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   # Create .env file (see frontend/README.md)
   npm run dev
   ```
   📖 **For detailed frontend setup, see [frontend/README.md](./frontend/README.md)**

## 📋 Overview

Nephslair is a full-stack JavaScript content management platform featuring:

- **Backend**: Node.js + Express + Sequelize (MySQL) REST API
- **Frontend**: React + Vite + Tailwind CSS SPA
- **Admin Panel**: Comprehensive content management interface
- **Public Site**: User-friendly content viewing and interaction

### Technology Stack

- **Backend**: Express.js 5.x, Sequelize 6.x, MySQL 8.0+, JWT, bcryptjs, Nodemailer, Multer
- **Frontend**: React 18.3, Vite 6.x, React Router 6.x, Tailwind CSS 3.x, Axios
- **Testing**: Jest + Supertest (backend), GitHub Actions CI/CD
- **Documentation**: Swagger/OpenAPI (dark theme)

## 🎯 Core Features

### Content Management
- **Projects**: Organize content by projects with version tracking
- **Posts**: Rich content posts with markdown support, voting, and comments
- **Releases**: Versioned releases with platform-specific file downloads
- **Polls**: Standalone, project-specific, or post-embedded polls with vote preservation
- **Comments**: Threaded comments with voting and edit history

### Admin Features
- **Admin Dashboard**: Statistics overview and quick actions
- **Content Management**: Full CRUD for projects, posts, releases, polls
- **User Management**: User list and role management
- **Website Settings**: Site configuration, maintenance mode, announcement banner

### User Features
- **Authentication**: Login, register, forgot/reset password
- **Content Viewing**: Posts, projects, polls, releases
- **Interactions**: Commenting, voting, file downloads

### Advanced Features
- **Maintenance Mode**: Full-site offline page (admins + login remain accessible)
- **Announcement Banner**: Dismissible banner with 1-hour persistence
- **SEO Optimization**: Dynamic page titles and meta descriptions
- **Email System**: Welcome emails and password reset emails (SMTP or mock mode)
- **Error Handling**: React ErrorBoundary and graceful error display

## 🏗️ Project Structure

```
nephslair/
├── backend/           # Node.js + Express REST API
│   ├── controllers/   # Business logic
│   ├── models/        # Sequelize models
│   ├── routes/        # API endpoints
│   ├── middleware/    # Auth, rate limiting, upload
│   ├── utils/         # Helpers (response, validate, email, files)
│   ├── migrations/    # Database migrations
│   └── README.md      # Backend documentation
│
├── frontend/          # React + Vite SPA
│   ├── src/
│   │   ├── pages/     # Page components
│   │   ├── components/# Reusable components
│   │   ├── services/  # API services
│   │   └── utils/     # Custom hooks and helpers
│   └── README.md      # Frontend documentation
│
├── .github/           # GitHub Actions workflows
├── LICENSE            # MIT License
└── README.md          # This file
```

## 📚 Documentation

### Backend
- 📖 **[Backend README](./backend/README.md)**: Complete backend API documentation
  - Setup instructions
  - API conventions and endpoints
  - Security features
  - Testing guide
  - Deployment guide

- 📝 **[Backend CHANGELOG](./backend/CHANGELOG.md)**: Backend version history and changes

### Frontend
- 📖 **[Frontend README](./frontend/README.md)**: Complete frontend documentation
  - Setup instructions
  - UI standards and patterns
  - Custom hooks documentation
  - Production build guide

- 📝 **[Frontend CHANGELOG](./frontend/CHANGELOG.md)**: Frontend version history and changes

### Testing
- 🧪 **[Testing Guide](./backend/TESTING.md)**: Backend testing documentation
  - Automated testing (Jest + Supertest)
  - Manual testing methods
  - CI/CD setup

## 🔐 Security

- **Authentication**: JWT-based authentication with token invalidation on password change
- **Authorization**: Role-based access control (admin/user)
- **Rate Limiting**: In-memory rate limiting for sensitive endpoints
- **Input Validation**: Centralized validation for all inputs
- **Error Handling**: Standardized error responses (no sensitive data in production)

## 🧪 Testing

### Automated Tests

Backend tests run automatically on push/PR via GitHub Actions:

```bash
cd backend
npm test              # Run all tests with coverage
npm run test:status   # Run only status code tests
npm run test:watch    # Watch mode
```

**Coverage**: Tests cover HTTP status codes (200, 201, 204, 400, 401, 403, 404) and response format consistency.

📖 **For detailed testing information, see [backend/TESTING.md](./backend/TESTING.md)**

## 🚀 Deployment

### Backend Deployment

Backend can be deployed to a VPS using the provided deployment script:

1. SSH into your VPS
2. Clone the repository
3. Configure `.env` file
4. Run migrations
5. Set up process manager (PM2 or systemd)

📖 **For detailed deployment instructions, see [backend/README.md](./backend/README.md#-deployment)**

### Frontend Deployment

Frontend builds as a static SPA:

1. Configure `.env.production` with your API URL
2. Build: `npm run build`
3. Deploy `dist/` directory to your web server
4. Configure server for SPA routing (redirect all routes to `index.html`)

📖 **For detailed deployment instructions, see [frontend/README.md](./frontend/README.md#-production-build)**

## 🎯 Key Workflows

- **Forgot/Reset Password**: Secure token emailed (30-minute expiry), old JWTs invalidated on reset
- **Release Files**: Platform required before upload, orphan file prevention
- **Poll Updates**: Vote counts preserved, intelligent option diffing
- **Maintenance Mode**: Public routes blocked, admins + login remain accessible

## 📝 Version History

### Version 1.0.0

Initial production-ready release featuring:

- Full content management system (projects, posts, releases, polls, comments)
- Comprehensive admin panel
- Authentication and password reset flow
- Website settings and maintenance mode
- Email system (SMTP or mock mode)
- Standardized API responses and error handling
- Automated testing (Jest + Supertest)
- CI/CD via GitHub Actions

📝 **For detailed changelogs, see:**
- [Backend CHANGELOG](./backend/CHANGELOG.md)
- [Frontend CHANGELOG](./frontend/CHANGELOG.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `cd backend && npm test`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

## 🔗 Links

- **Backend Documentation**: [backend/README.md](./backend/README.md)
- **Frontend Documentation**: [frontend/README.md](./frontend/README.md)
- **Backend Changelog**: [backend/CHANGELOG.md](./backend/CHANGELOG.md)
- **Frontend Changelog**: [frontend/CHANGELOG.md](./frontend/CHANGELOG.md)
- **Testing Guide**: [backend/TESTING.md](./backend/TESTING.md)

---

**Built with ❤️ for modern content management**
