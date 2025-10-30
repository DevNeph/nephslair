# HTTP Status Code Testing Guide

## Automated Testing (Jest + Supertest)

### Running Tests

```bash
cd backend

# Run all tests
npm test

# Run only status code tests
npm run test:status

# Watch mode (automatically run on changes)
npm run test:watch
```

### Test Coverage

Test coverage report is automatically generated in the `backend/coverage/` directory.

## Manual Testing Methods

### 1. Postman Collection

Create a new Collection in Postman and test these endpoints:

#### Public Endpoints (200 OK)
- `GET http://localhost:3001/`
- `GET http://localhost:3001/api/projects`
- `GET http://localhost:3001/api/posts`
- `GET http://localhost:3001/api/settings`

#### Authentication Endpoints
- `POST http://localhost:3001/api/auth/register` (201 Created - successful, 400 Bad Request - validation error)
  ```json
  {
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123"
  }
  ```

- `POST http://localhost:3001/api/auth/login` (200 OK - successful, 401 Unauthorized - wrong password)
  ```json
  {
    "email": "admin@example.com",
    "password": "password"
  }
  ```

#### Protected Endpoints (401 Unauthorized)
- `GET http://localhost:3001/api/users` (401 without token)

#### Not Found (404)
- `GET http://localhost:3001/api/projects/nonexistent-slug`
- `GET http://localhost:3001/api/posts/nonexistent-slug`
- `GET http://localhost:3001/nonexistent-route`

#### DELETE Endpoints (204 No Content)
- `DELETE http://localhost:3001/api/posts/:id` (Token required)
- `DELETE http://localhost:3001/api/projects/:id` (Token required)

### 2. cURL Scripts

```bash
# 200 OK - Get Projects
curl -X GET http://localhost:3001/api/projects

# 400 Bad Request - Missing fields
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test"}'

# 401 Unauthorized - No token
curl -X GET http://localhost:3001/api/users

# 401 Unauthorized - Invalid credentials
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@example.com","password":"wrong"}'

# 404 Not Found
curl -X GET http://localhost:3001/api/projects/nonexistent-slug

# 201 Created - Register (if successful)
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}'

# 204 No Content - Delete (Token required)
# First login to get token, then:
curl -X DELETE http://localhost:3001/api/posts/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Browser DevTools

1. Open DevTools in browser with `F12`
2. Go to Network tab
3. Perform an action in the frontend (e.g., delete a post)
4. Click on the request in Network tab
5. Check the status code:
   - In the **Headers** tab you'll see the **Status Code** line
   - In the **Response** tab you'll see the response body

### 4. PowerShell Script (Windows)

```powershell
# 200 OK
Invoke-WebRequest -Uri "http://localhost:3001/api/projects" -Method GET

# 400 Bad Request
Invoke-WebRequest -Uri "http://localhost:3001/api/auth/register" -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"test"}'

# Status code check
$response = Invoke-WebRequest -Uri "http://localhost:3001/api/projects"
Write-Host "Status Code: $($response.StatusCode)"
```

## Test Scenarios

### ✅ Success Tests (200, 201)

1. **GET Requests** → 200 OK
   - `/api/projects`
   - `/api/posts`
   - `/api/settings`

2. **POST Requests** → 201 Created
   - `/api/auth/register` (successful registration)
   - `/api/posts` (admin, successful creation)
   - `/api/projects` (admin, successful creation)

3. **PUT/PATCH Requests** → 200 OK
   - `/api/posts/:id` (admin, successful update)

### ❌ Error Tests

1. **400 Bad Request**
   - Missing required fields
   - Invalid format (email, etc.)

2. **401 Unauthorized**
   - Protected endpoints without token
   - Login with wrong password

3. **403 Forbidden**
   - Admin-only endpoints with regular user

4. **404 Not Found**
   - Non-existent resources
   - Non-existent routes

5. **204 No Content**
   - DELETE operations (without body)

## Testing with Swagger UI

1. Start the server: `npm run dev`
2. Open in browser: `http://localhost:3001/api-docs`
3. Click on endpoints in Swagger UI
4. Click "Try it out" button
5. Send request
6. See the status code in the response

## Example Test Scenario

```javascript
// Test: POST /api/auth/register - With missing fields
// Expected: 400 Bad Request

const response = await request(app)
  .post('/api/auth/register')
  .send({ username: 'test' }); // email and password missing

expect(response.status).toBe(400);
expect(response.body.success).toBe(false);
expect(response.body.message).toContain('required');
```

## Notes

- It's recommended to use a test database (set `NODE_ENV=test` in `.env`)
- Auth tokens should be created in advance for tests or mocked
- For DELETE operations, you should create a resource first and then delete it
- For rate limiting tests, you need to send multiple requests
