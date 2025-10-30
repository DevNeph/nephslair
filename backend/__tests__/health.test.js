const request = require('supertest');
const app = require('../app');

describe('Health', () => {
  it('GET / should return status success', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
  });
});