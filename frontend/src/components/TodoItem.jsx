import { useState } from 'react';
import './TodoItem.css';

function TodoItem({ todo, onToggle, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  async function handleToggle() {
    try {
      setError(null);
      await onToggle(todo.id, !todo.completed);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSave() {
    try {
      setError(null);
      setUpdating(true);
      await onUpdate(todo.id, { title, description });
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  function handleCancel() {
    setTitle(todo.title);
    setDescription(todo.description);
    setEditing(false);
    setError(null);
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    try {
      setError(null);
      await onDelete(todo.id);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      {error && (
        <div className="item-error" role="alert">
          {error}
        </div>
      )}

      {editing ? (
        <div className="edit-form">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={140}
            disabled={updating}
            aria-label="Edit todo title"
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
            rows={3}
            disabled={updating}
            aria-label="Edit todo description"
          />
          <div className="edit-actions">
            <button
              onClick={handleSave}
              disabled={updating || !title.trim()}
              aria-label="Save changes"
            >
              {updating ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={updating}
              aria-label="Cancel editing"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="todo-content">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={handleToggle}
                aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
              />
              <span className="todo-title">{todo.title}</span>
            </label>
            {todo.description && (
              <p className="todo-description">{todo.description}</p>
            )}
            <div className="todo-meta">
              <small>Created: {new Date(todo.createdAt).toLocaleString()}</small>
              {todo.updatedAt !== todo.createdAt && (
                <small>Updated: {new Date(todo.updatedAt).toLocaleString()}</small>
              )}
            </div>
          </div>
          <div className="todo-actions">
            <button
              onClick={() => setEditing(true)}
              aria-label={`Edit "${todo.title}"`}
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="delete-button"
              aria-label={`Delete "${todo.title}"`}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  );
}

export default TodoItem;
