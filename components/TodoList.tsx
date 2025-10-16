import React, { useState, useCallback } from 'react';
import type { Todo } from '../types';
import Card from './Card';
import useLocalStorage from '../hooks/useLocalStorage';

const TodoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

interface TodoListProps {
    workspaceId: string;
}

const TodoList: React.FC<TodoListProps> = ({ workspaceId }) => {
  const [todos, setTodos] = useLocalStorage<Todo[]>(`todos-${workspaceId}`, []);
  const [newTodo, setNewTodo] = useState('');

  const handleAddTodo = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim() === '') return;
    setTodos(prevTodos => [
      ...prevTodos,
      { id: Date.now(), text: newTodo, completed: false }
    ]);
    setNewTodo('');
  }, [newTodo, setTodos]);

  const toggleTodo = useCallback((id: number) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, [setTodos]);

  const deleteTodo = useCallback((id: number) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  }, [setTodos]);

  return (
    <Card title="To-Do List" icon={<TodoIcon />}>
      <form onSubmit={handleAddTodo} className="flex space-x-2 mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
          className="flex-grow w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          disabled={!newTodo.trim()}
        >
          Add
        </button>
      </form>
      <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
        {todos.map(todo => (
          <li
            key={todo.id}
            className="flex items-center justify-between p-2 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
                <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                <span className={`${todo.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                    {todo.text}
                </span>
            </div>
            <button
              onClick={() => deleteTodo(todo.id)}
              aria-label={`Delete task: ${todo.text}`}
              className="text-slate-400 hover:text-red-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </li>
        ))}
        {todos.length === 0 && (
          <p className="text-center text-slate-500">No tasks yet. Add one above!</p>
        )}
      </ul>
    </Card>
  );
};

export default TodoList;
