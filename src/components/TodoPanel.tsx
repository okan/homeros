import { useState } from 'react';
import { X, Plus, Calendar } from 'lucide-react';
import { useTodoStore } from '../store/useTodoStore';
import { TodoItem } from './TodoItem';

export const TodoPanel = () => {
  const { todos, isTodoPanelOpen, toggleTodoPanel, addTodo } = useTodoStore();
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoDeadline, setNewTodoDeadline] = useState('');
  const [showDeadline, setShowDeadline] = useState(false);

  const hasUrgentTodos = (() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return todos.some((t) => {
      if (!t.deadline || t.completed) return false;
      const d = new Date(t.deadline);
      d.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((d.getTime() - now.getTime()) / 86400000);
      if (diffDays < 0) return false;
      if (diffDays <= 1) return true;
      if (diffDays < 3) return true;
      return false;
    });
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      addTodo(newTodoText.trim(), newTodoDeadline || undefined);
      setNewTodoText('');
      setNewTodoDeadline('');
      setShowDeadline(false);
    }
  };

  if (!isTodoPanelOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={toggleTodoPanel}
      />

      <div className="fixed top-0 left-0 right-0 bg-bg-content/95 backdrop-blur-md border-b border-border-element/30 z-50 transform transition-transform duration-300 ease-out animate-slide-down">
        <div className="max-w-3xl mx-auto p-component">
          <div className="flex items-center justify-between mb-coarse">
            <h2 className="text-header2 text-text-primary font-bold">TODOs</h2>
            <button
              onClick={toggleTodoPanel}
              className="p-fine text-icon-placeholder hover:text-text-primary transition-colors rounded-control hover:bg-bg-wash"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mb-component">
            <div className="flex gap-fine">
              <input
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                placeholder="Add a new todo"
                className="flex-1 px-coarse py-normal text-value bg-bg-content border border-border-element rounded-control focus:outline-none focus:border-border-element/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowDeadline(!showDeadline)}
                className={`p-normal rounded-control transition-colors ${
                  showDeadline || newTodoDeadline
                    ? 'bg-interactive-primary text-white'
                    : 'bg-bg-wash text-icon-default hover:bg-border-element'
                }`}
              >
                <Calendar className="w-5 h-5" />
              </button>
              <button
                type="submit"
                className="px-component py-normal bg-interactive-primary hover:bg-interactive-primary-hover active:bg-interactive-primary-active text-white rounded-control transition-colors flex items-center gap-fine"
              >
                <Plus className="w-4 h-4" />
                <span className="text-value font-bold">Add</span>
              </button>
            </div>

            {showDeadline && (
              <div className="mt-fine">
                <input
                  type="date"
                  value={newTodoDeadline}
                  onChange={(e) => setNewTodoDeadline(e.target.value)}
                  className="px-coarse py-normal text-value bg-bg-content border border-border-element rounded-control focus:outline-none focus:border-border-element/30 transition-colors"
                />
              </div>
            )}
          </form>

          <div className="space-y-fine max-h-[400px] overflow-y-auto">
            {todos.length === 0 ? (
              <div className="text-center py-section text-text-placeholder">
                <p className="text-value">No todos yet. Add one to get started!</p>
              </div>
            ) : (
              todos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} showUrgencyGutter={hasUrgentTodos} />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

