import { describe, it, expect } from 'vitest';
import { validateTodoForm } from '../utils/validation';

describe('validateTodoForm', () => {
  it('should validate a valid todo', () => {
    const result = validateTodoForm({
      name: 'Test Todo',
      description: 'Test description',
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('should require name', () => {
    const result = validateTodoForm({
      name: '',
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe('Name is required');
  });

  it('should reject name with only whitespace', () => {
    const result = validateTodoForm({
      name: '   ',
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe('Name is required');
  });

  it('should reject name longer than 100 characters', () => {
    const result = validateTodoForm({
      name: 'a'.repeat(101),
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe('Name must be 100 characters or less');
  });

  it('should accept valid name without description', () => {
    const result = validateTodoForm({
      name: 'Test Todo',
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('should reject description longer than 1000 characters', () => {
    const result = validateTodoForm({
      name: 'Test Todo',
      description: 'a'.repeat(1001),
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.description).toBe('Description must be 1,000 characters or less');
  });

  it('should accept description with exactly 1000 characters', () => {
    const result = validateTodoForm({
      name: 'Test Todo',
      description: 'a'.repeat(1000),
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });
});
