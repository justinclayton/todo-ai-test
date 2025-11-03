import { useState, useEffect, useCallback } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import type { Todo, TodoFilter, TodoSort } from '../types/todo';

const client = generateClient<Schema>();

/**
 * Hook to manage Todo CRUD operations with real-time subscriptions
 */
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<TodoSort>('createdAt');

  // Fetch todos
  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, errors } = await client.models.Todo.list();
      
      if (errors) {
        throw new Error(errors[0]?.message || 'Failed to fetch todos');
      }
      
      setTodos((data || []) as Todo[]);
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
      name,
      description: description || null,
      completed: false,
      owner: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistic update
    setTodos((prev) => [optimisticTodo, ...prev]);

    try {
      const { data, errors } = await client.models.Todo.create({
        name,
        description,
        completed: false,
      });

      if (errors) {
        throw new Error(errors[0]?.message || 'Failed to create todo');
      }

      // Replace optimistic with real data
      setTodos((prev) =>
        prev.map((todo) => (todo.id === optimisticId ? (data as Todo) : todo))
      );
      
      return data;
    } catch (err) {
      // Rollback on error
      setTodos((prev) => prev.filter((todo) => todo.id !== optimisticId));
      setError(err instanceof Error ? err.message : 'Failed to create todo');
      throw err;
    }
  }, []);

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
          ? { ...todo, ...updates, updatedAt: new Date().toISOString() }
          : todo
      )
    );

    try {
      const { data, errors } = await client.models.Todo.update({
        id,
        ...updates,
      });

      if (errors) {
        throw new Error(errors[0]?.message || 'Failed to update todo');
      }

      // Update with server response
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? (data as Todo) : todo))
      );
      
      return data;
    } catch (err) {
      // Rollback on error
      setTodos(originalTodos);
      setError(err instanceof Error ? err.message : 'Failed to update todo');
      throw err;
    }
  }, [todos]);

  // Delete todo with optimistic update
  const deleteTodo = useCallback(async (id: string) => {
    const originalTodos = [...todos];
    
    // Optimistic update
    setTodos((prev) => prev.filter((todo) => todo.id !== id));

    try {
      const { errors } = await client.models.Todo.delete({ id });

      if (errors) {
        throw new Error(errors[0]?.message || 'Failed to delete todo');
      }
    } catch (err) {
      // Rollback on error
      setTodos(originalTodos);
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
      throw err;
    }
  }, [todos]);

  // Toggle completed status
  const toggleTodo = useCallback(
    async (id: string, completed: boolean) => {
      return updateTodo(id, { completed });
    },
    [updateTodo]
  );

  // Filter and sort todos
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
      // Default: sort by createdAt (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Subscribe to real-time updates
  useEffect(() => {
    fetchTodos();

    const createSub = client.models.Todo.onCreate().subscribe({
      next: (data) => {
        setTodos((prev) => {
          // Avoid duplicates
          if (prev.some((todo) => todo.id === data.id)) {
            return prev;
          }
          return [data as Todo, ...prev];
        });
      },
      error: (error) => console.error('Subscription error:', error),
    });

    const updateSub = client.models.Todo.onUpdate().subscribe({
      next: (data) => {
        setTodos((prev) =>
          prev.map((todo) => (todo.id === data.id ? (data as Todo) : todo))
        );
      },
      error: (error) => console.error('Subscription error:', error),
    });

    const deleteSub = client.models.Todo.onDelete().subscribe({
      next: (data) => {
        setTodos((prev) => prev.filter((todo) => todo.id !== data.id));
      },
      error: (error) => console.error('Subscription error:', error),
    });

    return () => {
      createSub.unsubscribe();
      updateSub.unsubscribe();
      deleteSub.unsubscribe();
    };
  }, [fetchTodos]);

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

