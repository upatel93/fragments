// tests/unit/get.test.js
/* global __dirname*/

// importing content type
const contentType = require('content-type');

const request = require('supertest');

const app = require('../../src/app');

const fs = require('fs');
const path = require('path');

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
  test('Authenticated users should be able to get a fragment data with the supplied ID and proper content ype', async () => {
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
    const expectedContentType = contentType.parse('text/plain').type;
    const receivedContentType = contentType.parse(res.headers['content-type']).type;

    expect(receivedContentType).toBe(expectedContentType);
    expect(res.text).toBe(data);
  });

  test('Authenticated user should receive an error when an invalid ID is provided', async () => {
    // Test case: Authenticated user should receive an error when an invalid ID is provided

    const id = 'invalid id';

    const response = await request(app).get(`/v1/fragments/${id}`).auth('testuser1', 'Testu1@2911');

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('error');
    expect(response.body.error.code).toBe(404);
    expect(response.body.error.message).toBe(`Fragment with ID '${id}' does not exist.`);
  });

  test('unauthenticated requests are denied', () => {
    // Test case: Unauthenticated requests should be denied (return 401 Unauthorized)

    return request(app).get('/v1/fragments/:id').expect(401);
  });
});

describe('GET /v1/fragments/:id.ext  (Text, JSON, HTML, Markdown)', () => {
  describe('Text Fragment Conversion', () => {
    test('Text cannot be converted to other Formats - Returns 415 Unsupported Media Type', async () => {
      // Step 1: Create a fragment by making a POST request
      const data = 'Fragment Data';

      const postResponse = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'text/plain')
        .auth('testuser1', 'Testu1@2911')
        .send(data);

      const id = postResponse.body.fragment.id;

      const unsupportedFormats = ['html', 'md', 'json', 'png', 'jpg', 'gif', 'webp', 'unsupported'];

      await Promise.all(
        unsupportedFormats.map(async (ext) => {
          const response = await request(app)
            .get(`/v1/fragments/${id}.${ext}`)
            .auth('testuser1', 'Testu1@2911')
            .expect(415);

          expect(response.body.status).toBe('error');
          expect(response.body.error.code).toBe(415);
          expect(response.body.error.message).toBeDefined();
        })
      );
    });

    test('Text can be converted to ".txt" ', async () => {
      // Step 1: Create a fragment by making a POST request
      const data = 'Fragment Data';

      const postResponse = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'text/plain')
        .auth('testuser1', 'Testu1@2911')
        .send(data);

      const id = postResponse.body.fragment.id;

      const extensions = ['txt'];

      await Promise.all(
        extensions.map(async (ext) => {
          const response = await request(app)
            .get(`/v1/fragments/${id}.${ext}`)
            .auth('testuser1', 'Testu1@2911')
            .expect(200);

          expect(response.body).toBeDefined();

          const expectedContentType = contentType.parse('text/plain').type;
          const receivedContentType = contentType.parse(response.headers['content-type']).type;

          expect(receivedContentType).toBe(expectedContentType);
        })
      );
    });
  });

  describe('JSON Fragment Conversion', () => {
    test('JSON cannot be converted to other Formats - Returns 415 Unsupported Media Type', async () => {
      // Step 1: Create a fragment by making a POST request
      const jsonString = JSON.stringify(
        {
          name: 'test',
          age: 20,
          marks: 55.2244,
        },
        null,
        2
      );

      const postResponse = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'application/json')
        .auth('testuser1', 'Testu1@2911')
        .send(jsonString);

      const id = postResponse.body.fragment.id;

      const unsupportedFormats = ['html', 'md', 'png', 'jpg', 'gif', 'webp', 'unsupported'];

      await Promise.all(
        unsupportedFormats.map(async (ext) => {
          const response = await request(app)
            .get(`/v1/fragments/${id}.${ext}`)
            .auth('testuser1', 'Testu1@2911')
            .expect(415);

          expect(response.body.status).toBe('error');
          expect(response.body.error.code).toBe(415);
          expect(response.body.error.message).toBeDefined();
        })
      );
    });

    test('JSON can be converted to ".txt" and itself ".json" ', async () => {
      // Step 1: Create a fragment by making a POST request
      const jsonString = JSON.stringify(
        {
          name: 'test',
          age: 20,
          marks: 55.2244,
        },
        null,
        2
      );

      const postResponse = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'application/json')
        .auth('testuser1', 'Testu1@2911')
        .send(jsonString);

      const id = postResponse.body.fragment.id;

      const extensions = ['txt', 'json'];

      await Promise.all(
        extensions.map(async (ext) => {
          const response = await request(app)
            .get(`/v1/fragments/${id}.${ext}`)
            .auth('testuser1', 'Testu1@2911')
            .expect(200);

          expect(response.body).toBeDefined();

          let expectedContentType;
          let receivedContentType = contentType.parse(response.headers['content-type']).type;

          if (ext === 'txt') {
            expectedContentType = contentType.parse('text/plain').type;
          } else {
            expectedContentType = contentType.parse('application/json').type;
          }

          expect(receivedContentType).toBe(expectedContentType);
        })
      );
    });
  });

  describe('HTML Fragment Conversion', () => {
    test('HTML cannot be converted to other Formats - Returns 415 Unsupported Media Type', async () => {
      // Step 1: Create a fragment by making a POST request
      const HTML = '<h1>Hello World</h1><p>This is Paragraph</p>';

      const postResponse = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'text/html')
        .auth('testuser1', 'Testu1@2911')
        .send(HTML);

      const id = postResponse.body.fragment.id;

      const unsupportedFormats = ['md', 'png', 'json', 'jpg', 'gif', 'webp', 'unsupported'];

      await Promise.all(
        unsupportedFormats.map(async (ext) => {
          const response = await request(app)
            .get(`/v1/fragments/${id}.${ext}`)
            .auth('testuser1', 'Testu1@2911')
            .expect(415);

          expect(response.body.status).toBe('error');
          expect(response.body.error.code).toBe(415);
          expect(response.body.error.message).toBeDefined();
        })
      );
    });
    test('HTML can be converted to ".txt" and itself ".html"', async () => {
      // Step 1: Create a fragment by making a POST request
      const HTML = '<h1>Hello World</h1><p>This is Paragraph</p>';

      const postResponse = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'text/html')
        .auth('testuser1', 'Testu1@2911')
        .send(HTML);

      const id = postResponse.body.fragment.id;

      const extensions = ['txt', 'html'];

      await Promise.all(
        extensions.map(async (ext) => {
          const response = await request(app)
            .get(`/v1/fragments/${id}.${ext}`)
            .auth('testuser1', 'Testu1@2911')
            .expect(200);

          expect(response.body).toBeDefined();

          let expectedContentType;
          let receivedContentType = contentType.parse(response.headers['content-type']).type;

          if (ext === 'txt') {
            expectedContentType = contentType.parse('text/plain').type;
          } else {
            expectedContentType = contentType.parse('text/html').type;
          }

          expect(receivedContentType).toBe(expectedContentType);
        })
      );
    });
  });

  describe('Markdown Fragment Conversion', () => {
    test('Markdown cannot be converted to other Formats - Returns 415 Unsupported Media Type', async () => {
      // Step 1: Create a fragment by making a POST request
      const MARKDOWN = '### Hello World \n\n ## New Heading \n **dskdajsk** ';

      const postResponse = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'text/markdown')
        .auth('testuser1', 'Testu1@2911')
        .send(MARKDOWN);

      const id = postResponse.body.fragment.id;

      const unsupportedFormats = ['png', 'json', 'jpg', 'gif', 'webp', 'unsupported'];

      await Promise.all(
        unsupportedFormats.map(async (ext) => {
          const response = await request(app)
            .get(`/v1/fragments/${id}.${ext}`)
            .auth('testuser1', 'Testu1@2911')
            .expect(415);

          expect(response.body.status).toBe('error');
          expect(response.body.error.code).toBe(415);
          expect(response.body.error.message).toBeDefined();
        })
      );
    });

    test('Markdown can be converted to ".txt", ".html", and itself ".md"', async () => {
      // Step 1: Create a fragment by making a POST request
      const MARKDOWN = '### Hello World \n\n ## New Heading \n **dskdajsk** ';

      const postResponse = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'text/markdown')
        .auth('testuser1', 'Testu1@2911')
        .send(MARKDOWN);

      const id = postResponse.body.fragment.id;

      const extensions = ['txt', 'html', 'md'];

      await Promise.all(
        extensions.map(async (ext) => {
          const response = await request(app)
            .get(`/v1/fragments/${id}.${ext}`)
            .auth('testuser1', 'Testu1@2911')
            .expect(200);

          expect(response.body).toBeDefined();

          let expectedContentType;
          let receivedContentType = contentType.parse(response.headers['content-type']).type;

          switch (ext) {
            case 'txt':
              expectedContentType = contentType.parse('text/plain').type;
              break;
            case 'html':
              expectedContentType = contentType.parse('text/html').type;
              break;
            default:
              expectedContentType = contentType.parse('text/markdown').type;
              break;
          }

          expect(receivedContentType).toBe(expectedContentType);
        })
      );
    });
  });
});

describe('GET /v1/fragments/:id.ext  (Images - PNG, JPG/JPEG, GIF, WEBP)', () => {
  const imageTypes = ['png', 'jpg', 'gif', 'webp'];

  imageTypes.forEach((ext) => {
    describe(`${ext.toUpperCase()} Image Fragment Conversion`, () => {
      test(`${ext.toUpperCase()} cannot be converted to unsupported formats - Returns 415 Unsupported Media Type`, async () => {
        const imagePath = path.join(__dirname, `../images/test.${ext}`);
        const imageBuffer = fs.readFileSync(imagePath);

        if (ext === 'jpg') ext = 'jpeg';
        const postResponse = await request(app)
          .post('/v1/fragments')
          .set('Content-Type', `image/${ext}`)
          .auth('testuser1', 'Testu1@2911')
          .send(imageBuffer);

        const id = postResponse.body.fragment.id;

        ['json', 'txt', 'html', 'md', 'unsupported'].forEach(async (ext) => {
          const response = await request(app)
            .get(`/v1/fragments/${id}.${ext}`)
            .auth('testuser1', 'Testu1@2911')
            .expect(415);

          expect(response.body.status).toBe('error');
          expect(response.body.error.code).toBe(415);
          expect(response.body.error.message).toBeDefined();
        });
      });
      test(`${ext.toUpperCase()} can be converted to supported image types ${imageTypes.join(
        ', '
      )}`, async () => {
        if (ext === 'jpeg') ext = 'jpg';
        const imagePath = path.join(__dirname, `../images/test.${ext}`);
        const imageBuffer = fs.readFileSync(imagePath);

        if (ext === 'jpg') ext = 'jpeg';
        const postResponse = await request(app)
          .post('/v1/fragments')
          .set('Content-Type', `image/${ext}`)
          .auth('testuser1', 'Testu1@2911')
          .send(imageBuffer);

        const id = postResponse.body.fragment.id;

        imageTypes.forEach(async (ext2) => {
          if (ext2 === 'jpg') ext2 = 'jpeg';
          const response = await request(app)
            .get(`/v1/fragments/${id}.${ext2}`)
            .auth('testuser1', 'Testu1@2911')
            .expect(200);

          expect(response.body).toBeDefined();

          let expectedContentType;
          let receivedContentType = contentType.parse(response.headers['content-type']).type;

          switch (ext2) {
            case 'gif':
              expectedContentType = contentType.parse('image/gif').type;
              break;
            case 'png':
              expectedContentType = contentType.parse('image/png').type;
              break;
            case 'jpg':
            case 'jpeg':
              expectedContentType = contentType.parse('image/jpeg').type;
              break;
            default:
              expectedContentType = contentType.parse('image/webp').type;
              break;
          }
          expect(receivedContentType).toBe(expectedContentType);
        });
      });
    });
  });
});

describe('GET /v1/fragments/:id/info', () => {
  test('Authenticated users should be able to get a fragment Metadata', async () => {
    // Test case: Authenticated users should be able to get fragment metadata with the supplied ID

    // Step 1: Create a fragment by making a POST request
    const data = 'Fragment Data';
    const postResponse = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('testuser1', 'Testu1@2911')
      .send(data);
    const id = postResponse.body.fragment.id;
    const ownerId = postResponse.body.fragment.ownerId;
    const size = postResponse.body.fragment.size;
    const created = postResponse.body.fragment.created;
    const updated = postResponse.body.fragment.updated;

    // Step 2: Get the fragment Metadata by ID
    const response = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth('testuser1', 'Testu1@2911')
      .expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.fragment.id).toBe(id);
    expect(response.body.fragment.ownerId).toBe(ownerId);
    expect(response.body.fragment.created).toBe(created);
    expect(response.body.fragment.updated).toBe(updated);
    expect(response.body.fragment.type).toBe('text/plain');
    expect(response.body.fragment.size).toBe(size);
  });

  test('Authenticated users should be able to get a fragment Metadata Even with Extension', async () => {
    // Test case: Authenticated users should be able to get fragment metadata with the supplied ID

    // Step 1: Create a fragment by making a POST request
    const data = 'Fragment Data';
    const postResponse = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('testuser1', 'Testu1@2911')
      .send(data);
    const id = postResponse.body.fragment.id;
    const ownerId = postResponse.body.fragment.ownerId;
    const size = postResponse.body.fragment.size;
    const created = postResponse.body.fragment.created;
    const updated = postResponse.body.fragment.updated;

    // Step 2: Get the fragment Metadata by ID
    const response = await request(app)
      .get(`/v1/fragments/${id}.extension/info`)
      .auth('testuser1', 'Testu1@2911')
      .expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.fragment.id).toBe(id);
    expect(response.body.fragment.ownerId).toBe(ownerId);
    expect(response.body.fragment.created).toBe(created);
    expect(response.body.fragment.updated).toBe(updated);
    expect(response.body.fragment.type).toBe('text/plain');
    expect(response.body.fragment.size).toBe(size);
  });

  test('Authenticated user should receive an error when an invalid ID is provided', async () => {
    // Test case: Authenticated user should receive an error when an invalid ID is provided

    const id = 'invalid-id';

    const response = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth('testuser1', 'Testu1@2911')
      .expect(404);

    expect(response.body.status).toBe('error');
    expect(response.body.error.code).toBe(404);
    expect(response.body.error.message).toBe(`Fragment with ID '${id}' does not exist.`);
  });

  test('Unauthenticated requests are denied', async () => {
    // Test case: Unauthenticated requests should be denied (return 401 Unauthorized)

    const response = await request(app).get('/v1/fragments/:id/info').expect(401);

    expect(response.body.status).toBe('error');
    expect(response.body.error.code).toBe(401);
    expect(response.body.error.message).toBe('Unauthorized');
  });
});

describe('GET /v1/fragments?expand', () => {
  // Test case: Authenticated users should get fragments array associated with the user when no expand query parameter is provided
  test('Authenticated users should get fragments array associated with the user when no expand query parameter is provided', async () => {
    const response = await request(app).get('/v1/fragments').auth('testuser2', 'Testu2@2911');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(Array.isArray(response.body.fragments)).toBe(true);
  });

  // Test case: Authenticated users should get fragments associated with the user when expand query parameter provided 0
  test('Authenticated users should get fragments associated with the user when expand query parameter provided 0', async () => {
    const response = await request(app)
      .get('/v1/fragments?expand=0')
      .auth('testuser2', 'Testu2@2911');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(Array.isArray(response.body.fragments)).toBe(true);
  });

  // Test case: Authenticated users should get all fragments when expand query parameter is provided
  test('Authenticated users should get all fragments when expand query parameter is provided', async () => {
    const response = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('testuser2', 'Testu2@2911');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(Array.isArray(response.body.fragments)).toBe(true);
    expect(response.body.fragments).toHaveLength(0);
  });

  // Test case: The length of fragments Array should be increased after every post request
  test('The length of fragments Array should be increased after every post request', async () => {
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

  // Test case: Authenticated users should return fragments associated with the user when expand query parameter provided other than zero i.e. positive integer
  test('Authenticated users should return fragments associated with the user when expand query parameter provided other than zero i.e. positive integer', async () => {
    const response = await request(app)
      .get('/v1/fragments?expand=2')
      .auth('testuser2', 'Testu2@2911');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(Array.isArray(response.body.fragments)).toBe(true);
    expect(typeof response.body.fragments[0]).toBe('object');
  });

  // Test case: Authenticated user should get fragments array with strings without expand query
  test('Authenticated user should get fragments array with strings without expand query', async () => {
    const response = await request(app).get('/v1/fragments').auth('testuser2', 'Testu2@2911');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(Array.isArray(response.body.fragments)).toBe(true);
    expect(typeof response.body.fragments[0]).toBe('string');
  });
});
