const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4566/restapis/todo-api/dev/_user_request_';

export async function fetchTodos(nextToken = null) {
  const url = new URL(`${API_BASE_URL}/todos`);
  if (nextToken) {
    url.searchParams.append('nextToken', nextToken);
  }
  
  const response = await fetch(url.toString());
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch todos' }));
    throw new Error(error.message || error.error || 'Failed to fetch todos');
  }
  
  return response.json();
}

export async function createTodo(data) {
  const response = await fetch(`${API_BASE_URL}/todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create todo' }));
    throw new Error(error.message || error.error || 'Failed to create todo');
  }
  
  return response.json();
}

export async function updateTodo(id, data) {
  const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update todo' }));
    throw new Error(error.message || error.error || 'Failed to update todo');
  }
  
  return response.json();
}

export async function deleteTodo(id) {
  const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok && response.status !== 204) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete todo' }));
    throw new Error(error.message || error.error || 'Failed to delete todo');
  }
  
  return response.status === 204 ? null : response.json();
}

export function validateTodo(data) {
  const errors = [];
  
  if (!data.title || typeof data.title !== 'string') {
    errors.push('Title is required');
  } else if (data.title.length === 0) {
    errors.push('Title cannot be empty');
  } else if (data.title.length > 140) {
    errors.push('Title must be 140 characters or less');
  }
  
  if (data.description && data.description.length > 1000) {
    errors.push('Description must be 1000 characters or less');
  }
  
  return errors;
}
