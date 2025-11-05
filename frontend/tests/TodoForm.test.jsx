import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoForm from '../src/components/TodoForm';

describe('TodoForm', () => {
  it('renders form with title and description fields', () => {
    render(<TodoForm onSubmit={vi.fn()} />);
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create todo/i })).toBeInTheDocument();
  });

  it('displays character count for title', async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={vi.fn()} />);
    
    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'Test title');
    
    expect(screen.getByText(/10\/140 characters/i)).toBeInTheDocument();
  });

  it('displays character count for description', async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={vi.fn()} />);
    
    const descInput = screen.getByLabelText(/description/i);
    await user.type(descInput, 'Test description');
    
    expect(screen.getByText(/16\/1000 characters/i)).toBeInTheDocument();
  });

  it('calls onSubmit with form data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue({});
    render(<TodoForm onSubmit={onSubmit} />);
    
    await user.type(screen.getByLabelText(/title/i), 'New todo');
    await user.type(screen.getByLabelText(/description/i), 'Description');
    await user.click(screen.getByRole('button', { name: /create todo/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'New todo',
        description: 'Description',
        completed: false
      });
    });
  });

  it('clears form after successful submission', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue({});
    render(<TodoForm onSubmit={onSubmit} />);
    
    const titleInput = screen.getByLabelText(/title/i);
    const descInput = screen.getByLabelText(/description/i);
    
    await user.type(titleInput, 'New todo');
    await user.type(descInput, 'Description');
    await user.click(screen.getByRole('button', { name: /create todo/i }));
    
    await waitFor(() => {
      expect(titleInput).toHaveValue('');
      expect(descInput).toHaveValue('');
    });
  });

  it('displays error when submission fails', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error('Failed to create'));
    render(<TodoForm onSubmit={onSubmit} />);
    
    await user.type(screen.getByLabelText(/title/i), 'New todo');
    await user.click(screen.getByRole('button', { name: /create todo/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to create');
    });
  });

  it('disables submit button when title is empty', () => {
    render(<TodoForm onSubmit={vi.fn()} />);
    
    const submitButton = screen.getByRole('button', { name: /create todo/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when title is filled', async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={vi.fn()} />);
    
    await user.type(screen.getByLabelText(/title/i), 'Test');
    
    const submitButton = screen.getByRole('button', { name: /create todo/i });
    expect(submitButton).not.toBeDisabled();
  });
});
