// tests/unit/get.test.js
/* global process */

const request = require('supertest');

const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragment with ok status', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('testuser1', 'Testu1@2911')
      .send('fragment Data');

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('ok');
      expect(res.body.fragment).toBeDefined();
      expect(typeof res.body.fragment).toBe('object');
      expect(res.body.fragment.id).toBeDefined();
      expect(res.body.fragment.ownerId).toBeDefined();
      expect(res.body.fragment.type).toBe('text/plain');
      expect(res.body.fragment.size).toBe(1);
      expect(res.body.fragment.created).toBeDefined();
      expect(res.body.fragment.updated).toBeDefined();
      expect(res.headers.location).toBe(`${process.env.API_URL}/v1/fragment/${res.body.fragment.id}`);
  });
});
