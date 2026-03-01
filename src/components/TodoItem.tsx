import { useState } from 'react';
import { Trash2, Edit2, Check, X, Calendar } from 'lucide-react';
import { useTodoStore } from '../store/useTodoStore';
import { getDiffDays, formatDeadline } from '../utils/deadline';
import type { Todo } from '../types';

interface TodoItemProps {
  todo: Todo;
  showUrgencyGutter?: boolean;
}

export const TodoItem = ({ todo, showUrgencyGutter }: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editDeadline, setEditDeadline] = useState(todo.deadline || '');
  const { toggleTodo, updateTodo, deleteTodo } = useTodoStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editText.trim()) {
      updateTodo(todo.id, editText.trim(), editDeadline || undefined);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setEditDeadline(todo.deadline || '');
    setIsEditing(false);
  };

  const diffDays = todo.deadline ? getDiffDays(todo.deadline) : undefined;
  const isOverdue = todo.deadline && diffDays !== undefined && diffDays < 0 && !todo.completed;
  const isUrgentRed = !todo.completed && diffDays !== undefined && diffDays >= 0 && diffDays <= 1;
  const isUrgentYellow = !todo.completed && diffDays !== undefined && diffDays >= 2 && diffDays < 3;
  const deadlineClass = isOverdue
    ? 'text-red-500 font-medium'
    : isUrgentRed
    ? 'text-red-500 font-medium'
    : isUrgentYellow
    ? 'text-yellow-600 font-medium'
    : 'text-text-placeholder';

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="p-normal rounded-container">
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="w-full px-coarse py-normal text-value bg-bg-content border border-border-element rounded-control focus:outline-none focus:border-border-element/30 mb-fine transition-colors"
          autoFocus
        />
        <div className="flex items-center gap-fine mb-fine">
          <Calendar className="w-4 h-4 text-icon-placeholder" />
          <input
            type="date"
            value={editDeadline}
            onChange={(e) => setEditDeadline(e.target.value)}
            className="flex-1 px-coarse py-normal text-accent bg-bg-content border border-border-element rounded-control focus:outline-none focus:border-border-element/30 transition-colors"
          />
        </div>
        <div className="flex gap-fine">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-fine px-coarse py-normal bg-interactive-primary hover:bg-interactive-primary-hover active:bg-interactive-primary-active text-white rounded-control transition-colors"
          >
            <Check className="w-3 h-3" />
            <span className="text-value font-medium">Save</span>
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center justify-center px-coarse py-normal bg-bg-wash hover:bg-border-element text-text-primary rounded-control transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className={`group flex items-center gap-coarse p-normal hover:bg-bg-wash rounded-container transition-all duration-200`}>
      {showUrgencyGutter && (
        <div className="shrink-0 w-2 h-2 flex items-center justify-center">
          {(isUrgentRed || isUrgentYellow) && (
            <span
              className={`w-2 h-2 rounded-full ${
                isUrgentRed ? 'bg-red-500' : 'bg-yellow-500'
              }`}
            />
          )}
        </div>
      )}
      <button
        onClick={() => toggleTodo(todo.id)}
        className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 btn-press focus:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary focus-visible:ring-offset-2 ${
          todo.completed
            ? 'bg-interactive-primary shadow-sm'
            : 'bg-bg-wash hover:bg-border-element hover:scale-110'
        }`}
        aria-label={todo.completed ? `Mark "${todo.text}" as incomplete` : `Mark "${todo.text}" as complete`}
        aria-pressed={todo.completed}
        role="checkbox"
        aria-checked={todo.completed}
      >
        {todo.completed && <Check className="w-3 h-3 text-white animate-check" aria-hidden="true" />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-value leading-none transition-colors ${
            todo.completed ? 'line-through text-text-placeholder' : 'text-text-primary'
          }`}
        >
          {todo.text}
        </p>
        {todo.deadline && (
          <div className="flex items-center gap-fine mt-fine">
            <Calendar className="w-3 h-3 text-icon-placeholder" />
            <span className={`text-accent ${deadlineClass}`}>
              {formatDeadline(todo.deadline)}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-fine opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditing(true)}
          className="p-fine text-icon-placeholder hover:text-interactive-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary rounded-control"
          aria-label={`Edit "${todo.text}"`}
        >
          <Edit2 className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          onClick={() => deleteTodo(todo.id)}
          className="p-fine text-icon-placeholder hover:text-red-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-danger rounded-control"
          aria-label={`Delete "${todo.text}"`}
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
