import { useState } from 'react';
import { X, Plus, Calendar } from 'lucide-react';
import { useTodoStore } from '../store/useTodoStore';
import { TodoItem } from './TodoItem';
import { HabitTracker } from './HabitTracker';

export const TodoPanel = () => {
  const {
    todos,
    isTodoPanelOpen,
    toggleTodoPanel,
    addTodo,
  } = useTodoStore();

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
      return diffDays >= 0 && diffDays < 3;
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

  return (
    <>
      {isTodoPanelOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={toggleTodoPanel}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-bg-page/95 backdrop-blur-md shadow-2xl transform transition-transform duration-300 ease-in-out z-[60] flex flex-col ${isTodoPanelOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="p-page border-b border-border-element flex items-center justify-between">
          <h2 className="text-header1 text-text-primary">Tasks & Habits</h2>
          <button
            onClick={toggleTodoPanel}
            className="p-fine hover:bg-bg-wash rounded-control text-text-secondary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-page scrollbar-hide">
          <form onSubmit={handleSubmit} className="mb-section space-y-fine">
            <div className="flex gap-fine">
              <input
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                placeholder="Add a new task..."
                className="flex-1 px-coarse py-normal text-value bg-bg-content border border-border-element rounded-control focus:outline-none focus:border-border-element/30 transition-colors"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowDeadline(!showDeadline)}
                className={`p-normal rounded-control transition-colors ${showDeadline || newTodoDeadline
                  ? 'bg-interactive-primary text-white'
                  : 'bg-bg-wash text-icon-default hover:bg-border-element'
                  }`}
                title="Add deadline"
              >
                <Calendar className="w-5 h-5" />
              </button>
              <button
                type="submit"
                disabled={!newTodoText.trim()}
                className="px-component py-normal bg-interactive-primary hover:bg-interactive-primary-hover active:bg-interactive-primary-active text-white rounded-control transition-colors flex items-center gap-fine disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span className="text-value font-bold">Add</span>
              </button>
            </div>

            {showDeadline && (
              <div className="mt-fine animate-slide-down">
                <input
                  type="date"
                  value={newTodoDeadline}
                  onChange={(e) => setNewTodoDeadline(e.target.value)}
                  className="w-full px-coarse py-normal text-value bg-bg-content border border-border-element rounded-control focus:outline-none focus:border-border-element/30 transition-colors"
                />
              </div>
            )}
          </form>

          <div className="space-y-normal mb-8">
            {todos.length === 0 ? (
              <div className="text-center py-section text-text-placeholder">
                <p>No tasks yet.</p>
                <p className="text-sm">Enjoy your day!</p>
              </div>
            ) : (
              todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  showUrgencyGutter={hasUrgentTodos}
                />
              ))
            )}
          </div>

          <div className="border-t border-border-element/30 pt-4">
            <HabitTracker />
          </div>
        </div>
      </div>
    </>
  );
};
