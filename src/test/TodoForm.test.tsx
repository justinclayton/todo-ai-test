import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TodoForm } from '../components/TodoForm';

describe('TodoForm', () => {
  it('should render form fields', () => {
    const onSubmit = vi.fn();
    render(<TodoForm onSubmit={onSubmit} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add todo/i })).toBeInTheDocument();
  });

  it('should validate empty name', async () => {
    const onSubmit = vi.fn();
    render(<TodoForm onSubmit={onSubmit} />);

    const submitButton = screen.getByRole('button', { name: /add todo/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should submit valid form', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TodoForm onSubmit={onSubmit} />);

    const nameInput = screen.getByLabelText(/name/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /add todo/i });

    fireEvent.change(nameInput, { target: { value: 'Test Todo' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Test Todo',
        description: 'Test description',
      });
    });
  });

  it('should reset form after submission', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TodoForm onSubmit={onSubmit} />);

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /add todo/i });

    fireEvent.change(nameInput, { target: { value: 'Test Todo' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(nameInput.value).toBe('');
    });
  });

  it('should not reset form when editing', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <TodoForm
        onSubmit={onSubmit}
        initialData={{ name: 'Edit Todo', description: 'Edit description' }}
        submitLabel="Save"
      />
    );

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /save/i });

    expect(nameInput.value).toBe('Edit Todo');
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    // Should not reset when editing
    expect(nameInput.value).toBe('Edit Todo');
  });

  it('should validate name length at boundary', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TodoForm onSubmit={onSubmit} />);

    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByRole('button', { name: /add todo/i });

    // Test exactly 100 characters (should pass)
    fireEvent.change(nameInput, { target: { value: 'a'.repeat(100) } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });
});
