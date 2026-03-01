import { Settings, Check, ListTodo, Search, Paintbrush, Scissors } from 'lucide-react';
import { useBookmarkStore } from '../store/useBookmarkStore';
import { useTodoStore } from '../store/useTodoStore';
import { useSnippetStore } from '../store/useSnippetStore';
import { TodoBadge } from './TodoBadge';

interface ToolbarProps {
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onOpenSnippetManager: () => void;
}

export const Toolbar = ({ onOpenSearch, onOpenSettings, onOpenSnippetManager }: ToolbarProps) => {
  const isEditMode = useBookmarkStore((state) => state.isEditMode);
  const toggleEditMode = useBookmarkStore((state) => state.toggleEditMode);
  const toggleTodoPanel = useTodoStore((state) => state.toggleTodoPanel);
  const snippetsEnabled = useSnippetStore((state) => state.settings.enabled);

  return (
    <div className="fixed top-coarse right-coarse z-50 flex items-center gap-fine">
      {!isEditMode && (
        <>
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-fine px-[10px] py-2 rounded-control transition-all bg-transparent text-text-secondary hover:bg-bg-content hover:text-text-primary"
            title="Search (⌘K)"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTodoPanel}
            className="flex items-center gap-fine px-[10px] py-2 rounded-control transition-all bg-transparent text-text-secondary hover:bg-bg-content hover:text-text-primary"
          >
            <ListTodo className="w-5 h-5" />
            <span className="text-value font-medium">TODOs</span>
            <TodoBadge />
          </button>

          {snippetsEnabled && (
            <button
              onClick={onOpenSnippetManager}
              className="flex items-center gap-fine px-[10px] py-2 rounded-control transition-all bg-transparent text-text-secondary hover:bg-bg-content hover:text-text-primary"
              title="Snippets"
            >
              <Scissors className="w-5 h-5" />
              <span className="text-value font-medium">Snippets</span>
            </button>
          )}
        </>
      )}

      <button
        onClick={toggleEditMode}
        className={`flex items-center gap-fine px-[10px] py-2 rounded-control transition-all ${isEditMode
          ? 'bg-interactive-primary text-white hover:bg-interactive-primary-hover shadow-card-sm'
          : 'bg-transparent text-text-secondary hover:bg-bg-content hover:text-text-primary'
          }`}
      >
        {isEditMode ? (
          <>
            <Check className="w-5 h-5" />
            <span className="text-value font-medium">Done</span>
          </>
        ) : (
          <>
            <Paintbrush className="w-5 h-5" />
            <span className="text-value font-medium">Customize</span>
          </>
        )}
      </button>

      {!isEditMode && (
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-fine px-[10px] py-2 rounded-control transition-all bg-transparent text-text-secondary hover:bg-bg-content hover:text-text-primary"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
