// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('testuser1', 'Testu1@2911');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });
});

describe('GET /v1/fragments/:id', () => {
  test('Authenticated users should be able to get a fragment data with the supplied ID', async () => {
    // Test case: Authenticated users should be able to get a fragment data with the supplied ID

    // Step 1: Create a fragment by making a POST request
    let data = 'Fragment Data';
    const post = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('testuser1', 'Testu1@2911')
      .send(data);
    let id = post.body.fragment.id;

    // Step 2: Get the fragment by ID and compare the data
    const res = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('testuser1', 'Testu1@2911')
      .expect(200);
    expect(await res.text).toBe(data);
  });

  test('Authenticated user should receive an error when an invalid ID is provided', async () => {
    // Test case: Authenticated user should receive an error when an invalid ID is provided

    const id = 'invalid id';

    const response = await request(app).get(`/v1/fragments/${id}`).auth('testuser1', 'Testu1@2911');

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('error');
    expect(response.body.error.code).toBe(404);
    expect(response.body.error.message).toBe(
      `Got an Error: Not Found, while requesting fragment with id: ${id}`
    );
  });

  test('unauthenticated requests are denied', () => {
    // Test case: Unauthenticated requests should be denied (return 401 Unauthorized)

    return request(app).get('/v1/fragments/:id').expect(401);
  });
});

describe('GET /v1/fragments?expand', () => {
  test('Authenticated users should get fragments array associated with the user when no expand query parameter is provided', async () => {
    // Test case: When no expand query parameter is provided, return fragments associated with the user
    const response = await request(app).get('/v1/fragments').auth('testuser2', 'Testu2@2911');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(Array.isArray(response.body.fragments)).toBe(true);
  });

  test('Authenticated users should get fragments associated with the user when expand query parameter provided 0', async () => {
    // Test case: When no expand query parameter is provided, return fragments associated with the user
    const response = await request(app)
      .get('/v1/fragments?expand=0')
      .auth('testuser2', 'Testu2@2911');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(Array.isArray(response.body.fragments)).toBe(true);
  });

  test('Authenticated users should get all fragments when expand query parameter is provided', async () => {
    // Test case: When expand query parameter is provided, return all fragments

    const response = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('testuser2', 'Testu2@2911');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(Array.isArray(response.body.fragments)).toBe(true);
    expect(response.body.fragments).toHaveLength(0);
  });

  test('The length of fragments Array should be increased after every post request', async () => {
    // Test case: The length of the fragments array should increase after every post request

    // Step 1: Check initial state (no fragments)
    const response = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('testuser2', 'Testu2@2911');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(Array.isArray(response.body.fragments)).toBe(true);
    expect(response.body.fragments).toHaveLength(0);

    // Step 2: Perform POST request 1 and check the increased size
    await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('testuser2', 'Testu2@2911')
      .send('Fragment Data 1');

    const response2 = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('testuser2', 'Testu2@2911');
    expect(response2.status).toBe(200);
    expect(response2.body.status).toBe('ok');
    expect(Array.isArray(response2.body.fragments)).toBe(true);
    expect(typeof response2.body.fragments[0]).toBe('object');
    expect(response2.body.fragments).toHaveLength(1);

    // Step 3: Perform POST request 2 and check the increased size
    await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('testuser2', 'Testu2@2911')
      .send('Fragment Data 2');

    const response3 = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('testuser2', 'Testu2@2911');
    expect(response3.status).toBe(200);
    expect(response3.body.status).toBe('ok');
    expect(Array.isArray(response3.body.fragments)).toBe(true);
    expect(typeof response3.body.fragments[0]).toBe('object');
    expect(response3.body.fragments).toHaveLength(2);
  });

  test('Authenticated users should return fragments associated with the user when expand query parameter provided other than zero i.e. positive integer', async () => {
    // Test case: When no expand query parameter is provided, return fragments associated with the user

    const response = await request(app)
      .get('/v1/fragments?expand=2')
      .auth('testuser2', 'Testu2@2911');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(Array.isArray(response.body.fragments)).toBe(true);
    expect(typeof response.body.fragments[0]).toBe('object');
  });

  test('Authenticated user should get fragments array with strings without expand query', async () => {
    // Test case: Fragments returned should have id strings

    const response = await request(app).get('/v1/fragments').auth('testuser2', 'Testu2@2911');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(Array.isArray(response.body.fragments)).toBe(true);
    expect(typeof response.body.fragments[0]).toBe('string');
  });
});
