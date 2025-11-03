"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

interface Todo {
  id: string;
  content?: string | null;
  isDone?: boolean | null;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoContent, setNewTodoContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    try {
      const { data: items } = await client.models.Todo.list();
      setTodos(items);
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createTodo() {
    if (!newTodoContent.trim()) return;
    
    try {
      const { data: newTodo } = await client.models.Todo.create({
        content: newTodoContent,
        isDone: false,
      });
      
      if (newTodo) {
        setTodos([...todos, newTodo]);
        setNewTodoContent("");
      }
    } catch (error) {
      console.error("Error creating todo:", error);
    }
  }

  async function toggleTodo(id: string, currentStatus: boolean | null | undefined) {
    try {
      const { data: updatedTodo } = await client.models.Todo.update({
        id,
        isDone: !currentStatus,
      });
      
      if (updatedTodo) {
        setTodos(
          todos.map((todo) =>
            todo.id === id ? { ...todo, isDone: updatedTodo.isDone } : todo
          )
        );
      }
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  }

  async function deleteTodo(id: string) {
    try {
      await client.models.Todo.delete({ id });
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTodoContent}
            onChange={(e) => setNewTodoContent(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && createTodo()}
            placeholder="What needs to be done?"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={createTodo}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Add
          </button>
        </div>

        {todos.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <svg
              className="mx-auto h-12 w-12 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-lg">No todos yet. Add one above to get started!</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={todo.isDone || false}
                  onChange={() => toggleTodo(todo.id, todo.isDone)}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span
                  className={`flex-1 ${
                    todo.isDone
                      ? "line-through text-gray-500 dark:text-gray-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {todo.content}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="px-3 py-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              {todos.filter((t) => !t.isDone).length} item(s) left
            </span>
            <span>
              {todos.filter((t) => t.isDone).length} completed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
