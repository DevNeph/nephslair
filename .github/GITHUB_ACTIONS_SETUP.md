# GitHub Actions Database Setup Guide

## Current Setup (Service Container - Recommended)

**✅ No Configuration Needed!**

The current setup uses a **Service Container** that automatically creates a fresh MySQL database for each test run. You don't need to do anything - it just works!

### How It Works:
- GitHub Actions automatically starts a MySQL 8.0 container
- Database is created fresh for each test run
- No external database needed
- No secrets to configure
- Completely isolated - no risk to production data

### Configuration Location:
All DB settings are **hardcoded in `.github/workflows/test.yml`**:
- Host: `127.0.0.1` (localhost - service container)
- User: `root`
- Password: `root`
- Database: `nephslair_test`

**These settings are only used in GitHub Actions, never in production.**

---

## Alternative: External Database (Optional)

If you want to use an external database (not recommended for most cases):

### Step 1: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

| Secret Name | Example Value | Description |
|------------|---------------|-------------|
| `DB_HOST` | `your-db-host.com` | Your database host |
| `DB_USER` | `test_user` | Database username |
| `DB_PASSWORD` | `secure_password` | Database password |
| `DB_NAME` | `nephslair_test` | Test database name |
| `DB_DIALECT` | `mysql` | Database dialect (mysql, postgres, etc.) |

### Step 2: Update Workflow File

Replace `.github/workflows/test.yml` with the example from `.github/workflows/test-external-db.example.yml`

**Note:** The external DB option requires you to:
- Have a separate test database server
- Maintain it
- Handle security
- Pay for it (if cloud-based)

**Service Container is recommended** - it's free, automatic, and isolated.

---

## Which Should You Use?

### ✅ Use Service Container (Current Setup) If:
- You want zero configuration
- You want free, automatic test database
- You want isolated tests (no risk to production)
- You're OK with temporary databases (created fresh each test)

### ❌ Use External Database If:
- You need persistent test data between runs
- You need to test specific database configurations
- You have a dedicated test database server
- You need to test database migrations on real DB

**Recommendation:** Stick with Service Container unless you have a specific need for external DB.

---

## Testing the Setup

After pushing to GitHub:

1. Go to your repository on GitHub
2. Click **Actions** tab
3. You should see "Test Suite" workflow running
4. Click on it to see the test results
5. If MySQL service container starts successfully, you'll see:
   ```
   ✓ Database connection established successfully.
   ✓ All models synchronized successfully.
   ```

---

## Troubleshooting

### Tests fail with "Can't connect to MySQL server"
- Check if `services.mysql` section is in workflow file
- Make sure `DB_HOST` is `127.0.0.1` (not `localhost`)
- Wait for health check to complete (30 seconds max)

### Migrations fail
- Check if migrations path is correct
- Make sure database exists (service container creates it automatically)
- Check if `--env test` flag is used

### Tests timeout
- Service container might be slow to start
- Increase timeout in workflow options
- Check if database is accessible from runner

---

## Current Configuration

**File:** `.github/workflows/test.yml`

**Service Container:**
- Image: `mysql:8.0`
- Port: `3306`
- Root Password: `root`
- Database: `nephslair_test`
- Health Check: MySQL ping (every 10s, max 3 retries)

**Environment Variables (in workflow):**
```yaml
DB_HOST: 127.0.0.1
DB_USER: root
DB_PASSWORD: root
DB_NAME: nephslair_test
DB_DIALECT: mysql
JWT_SECRET: test_jwt_secret_key_for_ci
```

**Note:** These are only used during GitHub Actions test runs, never in your actual application.

