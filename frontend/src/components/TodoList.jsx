import TodoItem from './TodoItem';
import './TodoList.css';

function TodoList({ todos, onToggle, onUpdate, onDelete }) {
  return (
    <ul className="todo-list" role="list" aria-label="Todo items">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

export default TodoList;
