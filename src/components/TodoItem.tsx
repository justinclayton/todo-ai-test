import { useState } from 'react';
import type { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onUpdate: (id: string, updates: { name?: string; description?: string }) => void;
  onDelete: (id: string) => void;
}

/**
 * Individual Todo item component
 */
export function TodoItem({ todo, onToggle, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(todo.name);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    if (editName.trim()) {
      await onUpdate(todo.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditName(todo.name);
    setEditDescription(todo.description || '');
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(todo.id);
    setShowDeleteConfirm(false);
  };

  if (isEditing) {
    return (
      <div className="card">
        <div className="space-y-3">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="input"
            placeholder="Todo name"
            maxLength={100}
            aria-label="Edit todo name"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="input"
            placeholder="Description (optional)"
            rows={2}
            maxLength={1000}
            aria-label="Edit todo description"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="btn btn-primary flex-1"
              disabled={!editName.trim()}
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={todo.completed || false}
          onChange={(e) => onToggle(todo.id, e.target.checked)}
          className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          aria-label={`Mark "${todo.name}" as ${todo.completed ? 'incomplete' : 'complete'}`}
        />
        <div className="flex-1 min-w-0">
          <h3
            className={`text-lg font-medium ${
              todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
            }`}
          >
            {todo.name}
          </h3>
          {todo.description && (
            <p
              className={`mt-1 text-sm ${
                todo.completed ? 'line-through text-gray-400' : 'text-gray-600'
              }`}
            >
              {todo.description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-4">
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline"
              aria-label={`Edit "${todo.name}"`}
            >
              Edit
            </button>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-sm text-red-600 hover:text-red-800 font-medium focus:outline-none focus:underline"
                aria-label={`Delete "${todo.name}"`}
              >
                Delete
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="text-sm text-red-600 hover:text-red-800 font-bold focus:outline-none focus:underline"
                  aria-label="Confirm delete"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium focus:outline-none focus:underline"
                  aria-label="Cancel delete"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
