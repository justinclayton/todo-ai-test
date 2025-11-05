import { useState } from 'react';
import './TodoForm.css';

function TodoForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    
    setError(null);
    setSubmitting(true);

    try {
      await onSubmit({ title, description, completed: false });
      setTitle('');
      setDescription('');
      
      // Focus back on title input after successful creation
      const titleInput = e.target.querySelector('input[name="title"]');
      if (titleInput) {
        titleInput.focus();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="todo-form" aria-label="Create new todo">
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="todo-title">
          Title <span aria-label="required">*</span>
        </label>
        <input
          id="todo-title"
          name="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={140}
          required
          disabled={submitting}
          aria-describedby="title-help"
          autoComplete="off"
        />
        <small id="title-help" className="help-text">
          {title.length}/140 characters
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="todo-description">Description</label>
        <textarea
          id="todo-description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          rows={3}
          disabled={submitting}
          aria-describedby="description-help"
        />
        <small id="description-help" className="help-text">
          {description.length}/1000 characters
        </small>
      </div>

      <button type="submit" disabled={submitting || !title.trim()}>
        {submitting ? 'Creating...' : 'Create Todo'}
      </button>
    </form>
  );
}

export default TodoForm;
