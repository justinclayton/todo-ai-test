import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { handler } from '../src/index.js';

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  process.env = {
    ...originalEnv,
    TABLE_NAME: 'test-table',
    ALLOWED_ORIGIN: '*',
    STAGE: 'test'
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('handler - JSON parsing', () => {
  test('returns 400 for invalid JSON in POST body', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/todos',
      resource: '/todos',
      body: '{invalid json}',
      requestContext: { requestId: 'test-123' },
      pathParameters: {}
    };

    const response = await handler(event);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Bad request');
    expect(body.message).toContain('Invalid JSON');
  });

  test('returns 400 for invalid JSON in PUT body', async () => {
    const event = {
      httpMethod: 'PUT',
      path: '/todos/123',
      resource: '/todos/{id}',
      body: '{invalid json}',
      requestContext: { requestId: 'test-123' },
      pathParameters: { id: '123' }
    };

    const response = await handler(event);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Bad request');
    expect(body.message).toContain('Invalid JSON');
  });

  test('returns 400 for invalid nextToken in GET query', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/todos',
      resource: '/todos',
      queryStringParameters: { nextToken: '{invalid' },
      requestContext: { requestId: 'test-123' },
      pathParameters: {}
    };

    const response = await handler(event);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Bad request');
    expect(body.message).toContain('Invalid pagination token');
  });

  test('handles OPTIONS request', async () => {
    const event = {
      httpMethod: 'OPTIONS',
      path: '/todos',
      resource: '/todos',
      requestContext: { requestId: 'test-123' },
      pathParameters: {}
    };

    const response = await handler(event);
    
    expect(response.statusCode).toBe(200);
    expect(response.headers['Access-Control-Allow-Origin']).toBeDefined();
  });

  test('returns 404 for unknown route', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/unknown',
      resource: '/unknown',
      requestContext: { requestId: 'test-123' },
      pathParameters: {}
    };

    const response = await handler(event);
    
    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Not found');
  });
});
