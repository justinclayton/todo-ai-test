import { useState } from 'react';
import { AuthWrapper } from './components/AuthWrapper';
import { NetworkStatus } from './components/NetworkStatus';
import { TodoForm } from './components/TodoForm';
import { TodoFilters } from './components/TodoFilters';
import { TodoList } from './components/TodoList';
import { useTodos } from './hooks/useTodos';
import type { TodoFormData } from './types/todo';

function App() {
  const {
    todos,
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
  } = useTodos();

  const [showAddForm, setShowAddForm] = useState(false);

  const handleCreateTodo = async (data: TodoFormData) => {
    await createTodo(data.name, data.description);
    setShowAddForm(false);
  };

  const handleUpdateTodo = async (
    id: string,
    updates: { name?: string; description?: string }
  ) => {
    await updateTodo(id, updates);
  };

  const handleToggleTodo = async (id: string, completed: boolean) => {
    await toggleTodo(id, completed);
  };

  const handleDeleteTodo = async (id: string) => {
    await deleteTodo(id);
  };

  return (
    <AuthWrapper>
      <NetworkStatus />
      
      <div className="max-w-4xl mx-auto">
        {/* Error display */}
        {error && (
          <div
            className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md"
            role="alert"
          >
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Add Todo Section */}
        <div className="card mb-6">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary w-full"
            >
              + Add New Todo
            </button>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-4">Add New Todo</h2>
              <TodoForm onSubmit={handleCreateTodo} submitLabel="Add Todo" />
              <button
                onClick={() => setShowAddForm(false)}
                className="btn btn-secondary w-full mt-3"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <TodoFilters
            filter={filter}
            setFilter={setFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            stats={stats}
          />
        </div>

        {/* Todo List */}
        <TodoList
          todos={todos}
          loading={loading}
          onToggle={handleToggleTodo}
          onUpdate={handleUpdateTodo}
          onDelete={handleDeleteTodo}
        />
      </div>
    </AuthWrapper>
  );
}

export default App;

