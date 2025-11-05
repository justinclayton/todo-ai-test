import { describe, test, expect } from '@jest/globals';
import { validateTodoInput, createLogger, createResponse } from '../src/index.js';

describe('validateTodoInput', () => {
  test('validates required title for new todo', () => {
    const errors = validateTodoInput({});
    expect(errors).toContain('title is required and must be a string');
  });
  
  test('validates title is a string', () => {
    const errors = validateTodoInput({ title: 123 });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.includes('string'))).toBe(true);
  });
  
  test('validates title length maximum', () => {
    const errors = validateTodoInput({ title: 'a'.repeat(141) });
    expect(errors).toContain('title must be 140 characters or less');
  });
  
  test('validates title is not empty', () => {
    const errors = validateTodoInput({ title: '' });
    expect(errors).toContain('title cannot be empty');
  });
  
  test('validates description length maximum', () => {
    const errors = validateTodoInput({ title: 'Valid', description: 'a'.repeat(1001) });
    expect(errors).toContain('description must be 1000 characters or less');
  });
  
  test('validates description is a string if provided', () => {
    const errors = validateTodoInput({ title: 'Valid', description: 123 });
    expect(errors).toContain('description must be a string');
  });
  
  test('validates completed is a boolean if provided', () => {
    const errors = validateTodoInput({ title: 'Valid', completed: 'true' });
    expect(errors).toContain('completed must be a boolean');
  });
  
  test('accepts valid todo data', () => {
    const errors = validateTodoInput({
      title: 'Valid title',
      description: 'Valid description',
      completed: false
    });
    expect(errors).toEqual([]);
  });
  
  test('allows empty description', () => {
    const errors = validateTodoInput({
      title: 'Valid title',
      description: ''
    });
    expect(errors).toEqual([]);
  });
  
  test('allows null description', () => {
    const errors = validateTodoInput({
      title: 'Valid title',
      description: null
    });
    expect(errors).toEqual([]);
  });
  
  test('allows title-only updates', () => {
    const errors = validateTodoInput({ title: 'Updated' }, true);
    expect(errors).toEqual([]);
  });
  
  test('allows partial updates without title', () => {
    const errors = validateTodoInput({ completed: true }, true);
    expect(errors).toEqual([]);
  });
});

describe('createLogger', () => {
  test('creates logger with requestId and route', () => {
    const logger = createLogger({
      requestId: 'test-123',
      routeKey: '/todos'
    });
    
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
  });
  
  test('handles missing requestContext', () => {
    const logger = createLogger(undefined);
    expect(logger.info).toBeDefined();
  });
  
  test('logs info message', () => {
    const originalLog = console.log;
    let loggedData;
    console.log = (data) => { loggedData = JSON.parse(data); };
    
    const logger = createLogger({ requestId: 'test-123' });
    logger.info('Test message', { key: 'value' });
    
    expect(loggedData.level).toBe('info');
    expect(loggedData.message).toBe('Test message');
    expect(loggedData.requestId).toBe('test-123');
    expect(loggedData.key).toBe('value');
    
    console.log = originalLog;
  });
  
  test('logs error message', () => {
    const originalError = console.error;
    let loggedData;
    console.error = (data) => { loggedData = JSON.parse(data); };
    
    const logger = createLogger({ requestId: 'test-123' });
    const error = new Error('Test error');
    logger.error('Error occurred', error, { key: 'value' });
    
    expect(loggedData.level).toBe('error');
    expect(loggedData.message).toBe('Error occurred');
    expect(loggedData.error).toBe('Test error');
    
    console.error = originalError;
  });
});

describe('createResponse', () => {
  test('creates response with correct structure', () => {
    const response = createResponse(200, { data: 'test' });
    
    expect(response.statusCode).toBe(200);
    expect(response.headers['Content-Type']).toBe('application/json');
    expect(response.headers['Access-Control-Allow-Origin']).toBeDefined();
    expect(JSON.parse(response.body)).toEqual({ data: 'test' });
  });
  
  test('includes CORS headers', () => {
    const response = createResponse(200, {});
    
    expect(response.headers['Access-Control-Allow-Origin']).toBeDefined();
    expect(response.headers['Access-Control-Allow-Methods']).toContain('GET');
    expect(response.headers['Access-Control-Allow-Methods']).toContain('POST');
    expect(response.headers['Access-Control-Allow-Headers']).toContain('Content-Type');
  });
  
  test('allows additional headers', () => {
    const response = createResponse(200, {}, { 'X-Custom': 'value' });
    expect(response.headers['X-Custom']).toBe('value');
  });
});
