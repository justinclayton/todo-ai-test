import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoItem from '../src/components/TodoItem';

const mockTodo = {
  id: '123',
  title: 'Test Todo',
  description: 'Test description',
  completed: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
};

describe('TodoItem', () => {
  it('renders todo item with title and description', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('shows completed state', () => {
    const completedTodo = { ...mockTodo, completed: true };
    const { container } = render(
      <TodoItem
        todo={completedTodo}
        onToggle={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    
    expect(container.querySelector('.todo-item')).toHaveClass('completed');
  });

  it('calls onToggle when checkbox is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={onToggle}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(onToggle).toHaveBeenCalledWith('123', true);
  });

  it('enters edit mode when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    
    await user.click(screen.getByRole('button', { name: /edit/i }));
    
    expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('calls onUpdate with new values when saved', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn().mockResolvedValue({});
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onUpdate={onUpdate}
        onDelete={vi.fn()}
      />
    );
    
    await user.click(screen.getByRole('button', { name: /edit/i }));
    
    const titleInput = screen.getByDisplayValue('Test Todo');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Todo');
    
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith('123', {
        title: 'Updated Todo',
        description: 'Test description'
      });
    });
  });

  it('cancels edit mode without saving', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onUpdate={onUpdate}
        onDelete={vi.fn()}
      />
    );
    
    await user.click(screen.getByRole('button', { name: /edit/i }));
    
    const titleInput = screen.getByDisplayValue('Test Todo');
    await user.clear(titleInput);
    await user.type(titleInput, 'Changed');
    
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('calls onDelete when delete button is clicked and confirmed', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockResolvedValue({});
    
    // Mock window.confirm
    vi.stubGlobal('confirm', vi.fn(() => true));
    
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={onDelete}
      />
    );
    
    await user.click(screen.getByRole('button', { name: /delete/i }));
    
    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith('123');
    });
    
    vi.unstubAllGlobals();
  });

  it('does not call onDelete when delete is cancelled', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    
    // Mock window.confirm to return false
    vi.stubGlobal('confirm', vi.fn(() => false));
    
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={onDelete}
      />
    );
    
    await user.click(screen.getByRole('button', { name: /delete/i }));
    
    expect(onDelete).not.toHaveBeenCalled();
    
    vi.unstubAllGlobals();
  });
});
