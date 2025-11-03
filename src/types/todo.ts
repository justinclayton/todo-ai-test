/**
 * Todo type definition
 * Note: In production, this would be generated from the Amplify schema
 */
export interface Todo {
  id: string;
  name: string;
  description: string | null;
  completed: boolean | null;
  owner: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Filter options for Todo list
 */
export type TodoFilter = 'all' | 'active' | 'completed';

/**
 * Sort options for Todo list
 */
export type TodoSort = 'createdAt' | 'name';

/**
 * Form validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Todo form data
 */
export interface TodoFormData {
  name: string;
  description?: string;
}
