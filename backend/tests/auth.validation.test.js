const request = require('supertest');
const app = require('../src/app');

describe('Auth validation', () => {
  test('POST /api/auth/register rejects an invalid email', async () => {
    const response = await request(app).post('/api/auth/register').send({
      firstName: 'Alice',
      lastName: 'Martin',
      email: 'pas-un-email',
      password: 'motdepasse',
      mainCity: 'Lyon'
    });

    expect(response.statusCode).toBe(422);
    expect(response.body.message).toBeTruthy();
    expect(response.body.fields.email).toBeTruthy();
  });

  test('POST /api/auth/google requires a token', async () => {
    const response = await request(app).post('/api/auth/google').send({});
    expect(response.statusCode).toBe(422);
  });

  test('POST /api/auth/google refuses a token that is not for this server', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        aud: 'client-test',
        email: 'ada@gmail.com',
        email_verified: 'true',
        sub: '123'
      })
    });

    const response = await request(app).post('/api/auth/google').send({ idToken: 'jeton' });
    fetchMock.mockRestore();

    const configured = String(process.env.GOOGLE_CLIENT_IDS || '').trim().length > 0;
    expect(response.statusCode).toBe(configured ? 401 : 503);
  });

  test('POST /api/auth/register refuses to create an account while Brevo is not configured', async () => {
    if (process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL) {
      return;
    }
    const response = await request(app).post('/api/auth/register').send({
      firstName: 'Alice',
      lastName: 'Martin',
      email: 'alice@test.com',
      password: 'motdepasse',
      mainCity: 'Lyon',
      acceptTerms: true
    });

    expect(response.statusCode).toBe(503);
  });

  test('POST /api/auth/verify-email requires a 6 digit code', async () => {
    const response = await request(app).post('/api/auth/verify-email').send({
      email: 'alice@test.com',
      code: '12'
    });

    expect(response.statusCode).toBe(422);
  });

  test('POST /api/auth/forgot-password requires an email', async () => {
    const response = await request(app).post('/api/auth/forgot-password').send({});
    expect(response.statusCode).toBe(422);
  });

  test('POST /api/auth/reset-password requires a new password of 8 characters', async () => {
    const response = await request(app).post('/api/auth/reset-password').send({
      email: 'alice@test.com',
      code: '123456',
      password: 'court'
    });
    expect(response.statusCode).toBe(422);
  });

  test('POST /api/auth/login requires a password', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'alice@test.com'
    });

    expect(response.statusCode).toBe(422);
  });
});

describe('Protected routes', () => {
  test('POST /api/items without token returns 401', async () => {
    const response = await request(app).post('/api/items').send({
      title: 'Lampe',
      description: 'Une lampe en bon etat',
      categoryId: 1,
      conditionState: 'good',
      city: 'Lyon'
    });

    expect(response.statusCode).toBe(401);
  });

  test('GET /api/messages/trade-offer/1 without token returns 401', async () => {
    const response = await request(app).get('/api/messages/trade-offer/1');
    expect(response.statusCode).toBe(401);
  });

  test('GET /api/users/me with a fake token returns 401', async () => {
    const response = await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer ceci-nest-pas-un-jwt');

    expect(response.statusCode).toBe(401);
  });

  test('POST /api/items/1/acquire without token returns 401', async () => {
    const response = await request(app).post('/api/items/1/acquire');
    expect(response.statusCode).toBe(401);
  });
});
