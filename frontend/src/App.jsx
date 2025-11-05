import { useState, useEffect } from 'react';
import { fetchTodos, createTodo, updateTodo, deleteTodo, validateTodo } from './api';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextToken, setNextToken] = useState(null);

  useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTodos();
      setTodos(data.items || []);
      setNextToken(data.nextToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(data) {
    const validationErrors = validateTodo(data);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(', '));
    }

    const newTodo = await createTodo(data);
    setTodos([newTodo, ...todos]);
    return newTodo;
  }

  async function handleUpdate(id, data) {
    const validationErrors = validateTodo({ title: 'valid', ...data });
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(', '));
    }

    const updatedTodo = await updateTodo(id, data);
    setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo));
    return updatedTodo;
  }

  async function handleToggle(id, completed) {
    const updatedTodo = await updateTodo(id, { completed });
    setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo));
  }

  async function handleDelete(id) {
    await deleteTodo(id);
    setTodos(todos.filter(todo => todo.id !== id));
  }

  async function handleLoadMore() {
    if (!nextToken) return;

    try {
      setLoading(true);
      const data = await fetchTodos(nextToken);
      setTodos([...todos, ...(data.items || [])]);
      setNextToken(data.nextToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header>
        <h1>Todo App</h1>
      </header>

      <main>
        <TodoForm onSubmit={handleCreate} />

        {error && (
          <div className="error" role="alert">
            <strong>Error:</strong> {error}
            <button onClick={loadTodos} aria-label="Retry loading todos">
              Retry
            </button>
          </div>
        )}

        {loading && todos.length === 0 ? (
          <div className="loading" aria-live="polite">
            Loading todos...
          </div>
        ) : todos.length === 0 ? (
          <div className="empty" role="status">
            No todos yet. Create one above!
          </div>
        ) : (
          <>
            <TodoList
              todos={todos}
              onToggle={handleToggle}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
            {nextToken && (
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="load-more"
                aria-label="Load more todos"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
