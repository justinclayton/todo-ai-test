import type { TodoFormData, ValidationResult } from '../types/todo';

/**
 * Validates Todo form data
 * @param data - Form data to validate
 * @returns Validation result with errors if any
 */
export function validateTodoForm(data: TodoFormData): ValidationResult {
  const errors: Record<string, string> = {};

  // Validate name
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Name is required';
  } else if (data.name.length > 100) {
    errors.name = 'Name must be 100 characters or less';
  } else if (data.name.trim().length < 1) {
    errors.name = 'Name cannot be only whitespace';
  }

  // Validate description
  if (data.description && data.description.length > 1000) {
    errors.description = 'Description must be 1,000 characters or less';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Debounce function to delay execution
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Generate a unique client request ID
 * @returns Unique ID string
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
