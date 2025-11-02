import { useState } from 'react';
import { Trash2, Edit2, Check, X, Calendar } from 'lucide-react';
import { useTodoStore } from '../store/useTodoStore';
import type { Todo } from '../types';

interface TodoItemProps {
  todo: Todo;
}

export const TodoItem = ({ todo }: TodoItemProps) => {
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

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return 'Today';
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';
    if (date < today) return 'Overdue';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = todo.deadline && new Date(todo.deadline) < new Date() && !todo.completed;

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
            <span className="text-accent">Save</span>
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
    <div className="group flex items-start gap-normal p-normal hover:bg-bg-wash rounded-container transition-all duration-200">
      <button
        onClick={() => toggleTodo(todo.id)}
        className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
          todo.completed
            ? 'bg-interactive-primary scale-110'
            : 'bg-bg-wash hover:bg-border-element hover:scale-110'
        }`}
      >
        {todo.completed && <Check className="w-3 h-3 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-value transition-colors ${
            todo.completed ? 'line-through text-text-placeholder' : 'text-text-primary'
          }`}
        >
          {todo.text}
        </p>
        {todo.deadline && (
          <div className="flex items-center gap-fine mt-fine">
            <Calendar className="w-3 h-3 text-icon-placeholder" />
            <span
              className={`text-accent ${
                isOverdue ? 'text-red-500 font-medium' : 'text-text-placeholder'
              }`}
            >
              {formatDeadline(todo.deadline)}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-fine opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditing(true)}
          className="p-fine text-icon-placeholder hover:text-interactive-primary transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => deleteTodo(todo.id)}
          className="p-fine text-icon-placeholder hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
