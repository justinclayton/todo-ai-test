import { TodoItem } from './TodoItem';
import type { Todo } from '../types/todo';

interface TodoListProps {
  todos: Todo[];
  loading: boolean;
  onToggle: (id: string, completed: boolean) => void;
  onUpdate: (id: string, updates: { name?: string; description?: string }) => void;
  onDelete: (id: string) => void;
}

/**
 * Todo list component with loading and empty states
 */
export function TodoList({ todos, loading, onToggle, onUpdate, onDelete }: TodoListProps) {
  if (loading) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading todos">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="flex gap-3">
              <div className="w-5 h-5 bg-gray-300 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4" />
                <div className="h-3 bg-gray-300 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="card text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No todos</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new todo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" role="list" aria-label="Todo list">
      {todos.map((todo) => (
        <div key={todo.id} role="listitem">
          <TodoItem
            todo={todo}
            onToggle={onToggle}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
}
