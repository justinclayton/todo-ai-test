import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { 
  listTodos, 
  createTodo as createTodoService, 
  updateTodo as updateTodoService, 
  toggleTodo as toggleTodoService, 
  deleteTodo as deleteTodoService,
  subscribeTodos,
  processQueue
} from '../lib/todoService';
import type { Todo, TodoFilter, TodoSort } from '../types/todo';
import { useNetworkStatus } from './useNetworkStatus';

/**
 * Hook to manage Todo CRUD operations with real-time subscriptions and offline support
 */
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<TodoSort>('createdAt');
  const [userId, setUserId] = useState<string | null>(null);
  const { isOnline, isSyncing, setIsSyncing } = useNetworkStatus();

  // Fetch user on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch todos
  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await listTodos();
      
      if (fetchError) {
        throw fetchError;
      }
      
      setTodos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create todo with optimistic update
  const createTodo = useCallback(async (name: string, description?: string) => {
    const optimisticId = `temp-${Date.now()}`;
    const optimisticTodo: Todo = {
      id: optimisticId,
      user_id: userId || '',
      name,
      description: description || null,
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Optimistic update
    setTodos((prev) => [optimisticTodo, ...prev]);

    try {
      const { data, error: createError } = await createTodoService(
        { name, description },
        isOnline
      );

      if (createError) {
        throw createError;
      }

      // Replace optimistic with real data if online
      if (data) {
        setTodos((prev) =>
          prev.map((todo) => (todo.id === optimisticId ? data : todo))
        );
      }
      
      return data;
    } catch (err) {
      // Rollback on error
      setTodos((prev) => prev.filter((todo) => todo.id !== optimisticId));
      setError(err instanceof Error ? err.message : 'Failed to create todo');
      throw err;
    }
  }, [userId, isOnline]);

  // Update todo with optimistic update
  const updateTodo = useCallback(async (
    id: string,
    updates: { name?: string; description?: string; completed?: boolean }
  ) => {
    const originalTodos = [...todos];
    
    // Optimistic update
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, ...updates, updated_at: new Date().toISOString() }
          : todo
      )
    );

    try {
      const { data, error: updateError } = await updateTodoService(
        id,
        updates,
        isOnline
      );

      if (updateError) {
        throw updateError;
      }

      // Update with server response if available
      if (data) {
        setTodos((prev) =>
          prev.map((todo) => (todo.id === id ? data : todo))
        );
      }
      
      return data;
    } catch (err) {
      // Rollback on error
      setTodos(originalTodos);
      setError(err instanceof Error ? err.message : 'Failed to update todo');
      throw err;
    }
  }, [todos, isOnline]);

  // Delete todo with optimistic update
  const deleteTodo = useCallback(async (id: string) => {
    const originalTodos = [...todos];
    
    // Optimistic update
    setTodos((prev) => prev.filter((todo) => todo.id !== id));

    try {
      const { error: deleteError } = await deleteTodoService(id, isOnline);

      if (deleteError) {
        throw deleteError;
      }
    } catch (err) {
      // Rollback on error
      setTodos(originalTodos);
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
      throw err;
    }
  }, [todos, isOnline]);

  // Toggle completed status
  const toggleTodo = useCallback(
    async (id: string, completed: boolean) => {
      const originalTodos = [...todos];
      
      // Optimistic update
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id
            ? { ...todo, completed, updated_at: new Date().toISOString() }
            : todo
        )
      );

      try {
        const { data, error: toggleError } = await toggleTodoService(
          id,
          completed,
          isOnline
        );

        if (toggleError) {
          throw toggleError;
        }

        // Update with server response if available
        if (data) {
          setTodos((prev) =>
            prev.map((todo) => (todo.id === id ? data : todo))
          );
        }
      } catch (err) {
        // Rollback on error
        setTodos(originalTodos);
        setError(err instanceof Error ? err.message : 'Failed to toggle todo');
        throw err;
      }
    },
    [todos, isOnline]
  );

  // Process offline queue when coming back online
  useEffect(() => {
    if (isOnline && !isSyncing) {
      setIsSyncing(true);
      processQueue()
        .then(({ processed, failed, errors }) => {
          if (processed > 0) {
            console.log(`Processed ${processed} queued mutations`);
            // Refresh todos after processing queue
            fetchTodos();
          }
          if (failed > 0) {
            console.warn(`Failed to process ${failed} mutations`, errors);
          }
        })
        .finally(() => {
          setTimeout(() => setIsSyncing(false), 1000);
        });
    }
  }, [isOnline, isSyncing, setIsSyncing, fetchTodos]);

  // Filter and sort todos client-side
  const filteredTodos = todos
    .filter((todo) => {
      // Apply filter
      if (filter === 'active' && todo.completed) return false;
      if (filter === 'completed' && !todo.completed) return false;

      // Apply search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = todo.name.toLowerCase().includes(query);
        const matchesDescription = todo.description?.toLowerCase().includes(query);
        return matchesName || matchesDescription;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      // Default: sort by created_at (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userId) return;

    fetchTodos();

    const unsubscribe = subscribeTodos(userId, {
      onInsert: (todo) => {
        setTodos((prev) => {
          // Avoid duplicates
          if (prev.some((t) => t.id === todo.id)) {
            return prev;
          }
          return [todo, ...prev];
        });
      },
      onUpdate: (todo) => {
        setTodos((prev) =>
          prev.map((t) => {
            if (t.id === todo.id) {
              // Merge using last-write-wins based on updated_at
              if (new Date(todo.updated_at) >= new Date(t.updated_at)) {
                return todo;
              }
            }
            return t;
          })
        );
      },
      onDelete: (todo) => {
        setTodos((prev) => prev.filter((t) => t.id !== todo.id));
      },
    });

    return unsubscribe;
  }, [userId, fetchTodos]);

  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    active: todos.filter((t) => !t.completed).length,
  };

  return {
    todos: filteredTodos,
    loading,
    error,
    stats,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    refetch: fetchTodos,
  };
}

