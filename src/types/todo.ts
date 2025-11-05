import type { Database } from './database';

/**
 * Todo type from Supabase database
 */
export type Todo = Database['public']['Tables']['todos']['Row'];

/**
 * Todo insert type
 */
export type TodoInsert = Database['public']['Tables']['todos']['Insert'];

/**
 * Todo update type
 */
export type TodoUpdate = Database['public']['Tables']['todos']['Update'];

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

/**
 * Mutation operation types for offline queue
 */
export type MutationOperation = 'create' | 'update' | 'toggle' | 'delete';

/**
 * Queued mutation for offline support
 */
export interface QueuedMutation {
  id: string;
  clientRequestId: string;
  operation: MutationOperation;
  payload: Record<string, unknown>;
  enqueuedAt: number;
  retryCount: number;
}

