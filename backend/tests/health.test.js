const request = require('supertest');
const app = require('../src/app');

describe('Health route', () => {
  test('GET /health should return ok', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });
});
