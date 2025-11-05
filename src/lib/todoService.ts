import { supabase } from './supabase';
import type { Todo, TodoUpdate, QueuedMutation } from '../types/todo';
import { 
  enqueueMutation, 
  hasPendingMutation, 
  getQueuedMutations, 
  dequeueMutation,
  updateRetryCount 
} from './offlineQueue';
import { v4 as uuidv4 } from 'uuid';

/**
 * List todos for the current user with optional filtering and sorting
 */
export async function listTodos(options: {
  search?: string;
  filter?: 'all' | 'active' | 'completed';
  sortBy?: 'created_at' | 'name';
  limit?: number;
  offset?: number;
} = {}): Promise<{ data: Todo[] | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    let query = supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id);

    // Apply search filter
    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    // Apply completed filter
    if (options.filter === 'active') {
      query = query.eq('completed', false);
    } else if (options.filter === 'completed') {
      query = query.eq('completed', true);
    }

    // Apply sorting
    if (options.sortBy === 'name') {
      query = query.order('name', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Create a new todo with offline queue support
 */
export async function createTodo(
  input: { name: string; description?: string },
  isOnline: boolean
): Promise<{ data: Todo | null; error: Error | null; clientRequestId: string }> {
  const clientRequestId = uuidv4();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('User not authenticated'), clientRequestId };
    }

    const todoId = uuidv4();
    const todoInsert = {
      id: todoId,
      user_id: user.id,
      name: input.name,
      description: input.description || null,
      completed: false,
    };

    // If offline, queue the mutation
    if (!isOnline) {
      const isPending = await hasPendingMutation(clientRequestId);
      if (isPending) {
        return { 
          data: null, 
          error: new Error('Duplicate request'), 
          clientRequestId 
        };
      }

      await enqueueMutation({
        id: uuidv4(),
        clientRequestId,
        operation: 'create',
        payload: todoInsert,
        enqueuedAt: Date.now(),
        retryCount: 0,
      });

      // Return optimistic data
      return {
        data: {
          ...todoInsert,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
        clientRequestId,
      };
    }

    // Online - execute immediately
    const { data, error } = await supabase
      .from('todos')
      .insert([todoInsert])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null, clientRequestId };
  } catch (error) {
    return { data: null, error: error as Error, clientRequestId };
  }
}

/**
 * Update a todo with offline queue support
 */
export async function updateTodo(
  id: string,
  updates: { name?: string; description?: string },
  isOnline: boolean
): Promise<{ data: Todo | null; error: Error | null }> {
  const clientRequestId = uuidv4();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const todoUpdate: TodoUpdate = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // If offline, queue the mutation
    if (!isOnline) {
      await enqueueMutation({
        id: uuidv4(),
        clientRequestId,
        operation: 'update',
        payload: { id, updates: todoUpdate },
        enqueuedAt: Date.now(),
        retryCount: 0,
      });

      // Return optimistic data (caller should merge with existing)
      return { data: null, error: null };
    }

    // Online - execute immediately
    const { data, error } = await supabase
      .from('todos')
      .update(todoUpdate)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Toggle todo completed status with offline queue support
 */
export async function toggleTodo(
  id: string,
  completed: boolean,
  isOnline: boolean
): Promise<{ data: Todo | null; error: Error | null }> {
  const clientRequestId = uuidv4();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    // If offline, queue the mutation
    if (!isOnline) {
      await enqueueMutation({
        id: uuidv4(),
        clientRequestId,
        operation: 'toggle',
        payload: { id, completed },
        enqueuedAt: Date.now(),
        retryCount: 0,
      });

      return { data: null, error: null };
    }

    // Online - execute immediately
    const { data, error } = await supabase
      .from('todos')
      .update({ 
        completed, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Delete a todo with offline queue support
 */
export async function deleteTodo(
  id: string,
  isOnline: boolean
): Promise<{ error: Error | null }> {
  const clientRequestId = uuidv4();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    // If offline, queue the mutation
    if (!isOnline) {
      await enqueueMutation({
        id: uuidv4(),
        clientRequestId,
        operation: 'delete',
        payload: { id },
        enqueuedAt: Date.now(),
        retryCount: 0,
      });

      return { error: null };
    }

    // Online - execute immediately
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

/**
 * Process queued mutations when coming back online
 */
export async function processQueue(): Promise<{ 
  processed: number; 
  failed: number; 
  errors: Array<{ mutation: QueuedMutation; error: Error }> 
}> {
  const mutations = await getQueuedMutations();
  let processed = 0;
  let failed = 0;
  const errors: Array<{ mutation: QueuedMutation; error: Error }> = [];

  for (const mutation of mutations) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      switch (mutation.operation) {
        case 'create': {
          const { error } = await supabase
            .from('todos')
            .insert([mutation.payload]);
          if (error) throw error;
          break;
        }
        case 'update': {
          const { id, updates } = mutation.payload;
          const { error } = await supabase
            .from('todos')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id);
          if (error) throw error;
          break;
        }
        case 'toggle': {
          const { id, completed } = mutation.payload;
          const { error } = await supabase
            .from('todos')
            .update({ completed, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', user.id);
          if (error) throw error;
          break;
        }
        case 'delete': {
          const { id } = mutation.payload;
          const { error } = await supabase
            .from('todos')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);
          if (error) throw error;
          break;
        }
      }

      await dequeueMutation(mutation.id);
      processed++;
    } catch (error) {
      // Increment retry count
      const newRetryCount = mutation.retryCount + 1;
      if (newRetryCount >= 3) {
        // Max retries reached, remove from queue
        await dequeueMutation(mutation.id);
        failed++;
        errors.push({ mutation, error: error as Error });
      } else {
        await updateRetryCount(mutation.id, newRetryCount);
        failed++;
      }
    }
  }

  return { processed, failed, errors };
}

/**
 * Subscribe to real-time changes for todos
 */
export function subscribeTodos(
  userId: string,
  callbacks: {
    onInsert?: (todo: Todo) => void;
    onUpdate?: (todo: Todo) => void;
    onDelete?: (todo: Todo) => void;
  }
) {
  const channel = supabase
    .channel('todos-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'todos',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (callbacks.onInsert) {
          callbacks.onInsert(payload.new as Todo);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'todos',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (callbacks.onUpdate) {
          callbacks.onUpdate(payload.new as Todo);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'todos',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (callbacks.onDelete) {
          callbacks.onDelete(payload.old as Todo);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
