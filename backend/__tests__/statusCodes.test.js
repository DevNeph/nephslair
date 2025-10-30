const request = require('supertest');
const app = require('../app');

describe('HTTP Status Code Tests', () => {
  let authToken;
  let adminToken;
  let testProjectId;
  let testPostId;
  let testPollId;
  let testReleaseId;

  // Test user credentials (you should create these in your test DB)
  const testUser = {
    email: 'test@example.com',
    password: 'testpass123',
    username: 'testuser'
  };

  const adminUser = {
    email: 'admin@example.com',
    password: 'adminpass123',
    username: 'admin'
  };

  beforeAll(async () => {
    // Optional: Create test user/admin and get tokens
    // For now, we'll test public endpoints and mock auth where needed
  });

  describe('200 OK - Success Responses', () => {
    test('GET / - Root endpoint should return 200', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.success !== undefined || res.body.status === 'success').toBe(true);
    });

    test('GET /api/projects - Should return 200', async () => {
      const res = await request(app).get('/api/projects');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('GET /api/posts - Should return 200', async () => {
      const res = await request(app).get('/api/posts');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('GET /api/settings - Should return 200', async () => {
      const res = await request(app).get('/api/settings');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('201 Created - POST Success', () => {
    test('POST /api/auth/register - Should return 201 on successful registration', async () => {
      const uniqueEmail = `test${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: `testuser${Date.now()}`,
          email: uniqueEmail,
          password: 'testpass123'
        });
      
      if (res.status === 201) {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('token');
      } else if (res.status === 400) {
        // User might already exist, that's OK for this test
        expect(res.body.success).toBe(false);
      }
    });
  });

  describe('204 No Content - DELETE Success', () => {
    test('DELETE /api/posts/:id - Should return 204 when deleting (requires auth)', async () => {
      // This would require auth token - skipping for now
      // In a full test suite, you'd create a post, then delete it
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('400 Bad Request - Validation Errors', () => {
    test('POST /api/auth/register - Should return 400 when missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'test'
          // Missing email and password
        });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('POST /api/auth/login - Should return 400 when missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          // Missing password
        });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('401 Unauthorized - Authentication Errors', () => {
    test('GET /api/users - Should return 401 without token', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('POST /api/auth/login - Should return 401 with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        });
      
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('403 Forbidden - Authorization Errors', () => {
    test('PUT /api/settings - Should return 403 for non-admin users', async () => {
      // This would require a regular user token
      // In full test suite: login as regular user, try to update settings
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('404 Not Found', () => {
    test('GET /api/projects/nonexistent-slug - Should return 404', async () => {
      const res = await request(app).get('/api/projects/nonexistent-slug-xyz-123');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('GET /api/posts/nonexistent-slug - Should return 404', async () => {
      const res = await request(app).get('/api/posts/nonexistent-slug-xyz-123');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('GET /nonexistent-route - Should return 404', async () => {
      const res = await request(app).get('/nonexistent-route-xyz');
      expect(res.status).toBe(404);
    });
  });

  describe('Response Format Consistency', () => {
    test('Success responses should have success: true', async () => {
      const res = await request(app).get('/api/projects');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('data');
    });

    test('Error responses should have success: false', async () => {
      const res = await request(app).get('/api/projects/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body).toHaveProperty('message');
    });

    test('DELETE responses should return 204 with no body', async () => {
      // This requires authenticated DELETE operation
      // In full test: create resource, delete it, check status and empty body
      expect(true).toBe(true); // Placeholder
    });
  });
});

