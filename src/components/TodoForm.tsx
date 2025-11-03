import { useState } from 'react';
import { validateTodoForm } from '../utils/validation';
import type { TodoFormData } from '../types/todo';

interface TodoFormProps {
  onSubmit: (data: TodoFormData) => Promise<void>;
  initialData?: TodoFormData;
  submitLabel?: string;
}

/**
 * Todo form component with validation
 */
export function TodoForm({ onSubmit, initialData, submitLabel = 'Add Todo' }: TodoFormProps) {
  const [formData, setFormData] = useState<TodoFormData>(
    initialData || { name: '', description: '' }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateTodoForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      if (!initialData) {
        // Reset form only for new todos
        setFormData({ name: '', description: '' });
      }
      setErrors({});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    field: keyof TodoFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="todo-name" className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500" aria-label="required">*</span>
        </label>
        <input
          id="todo-name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`input ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
          placeholder="Enter todo name"
          maxLength={100}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="todo-description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="todo-description"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          className={`input ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
          placeholder="Enter todo description"
          rows={3}
          maxLength={1000}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'description-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.description && (
          <p id="description-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.description}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
