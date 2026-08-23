import { Settings, Check, ListTodo, Search, Pencil, Scissors } from 'lucide-react';
import { useBookmarkStore } from '../store/useBookmarkStore';
import { useTodoStore } from '../store/useTodoStore';
import { useSnippetStore } from '../store/useSnippetStore';
import { useToolbarStore } from '../store/useToolbarStore';
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
  const showLabels = useToolbarStore((state) => state.showLabels);
  const visibleButtons = useToolbarStore((state) => state.visibleButtons);

  const buttonClass =
    'flex items-center gap-fine px-[10px] py-2 rounded-control transition-all bg-transparent text-text-secondary hover:bg-bg-content hover:text-interactive-primary';

  return (
    <div className="fixed top-coarse right-coarse z-50 flex items-center gap-fine">
      {!isEditMode && (
        <>
          {visibleButtons.search && (
            <button
              onClick={onOpenSearch}
              className={buttonClass}
              title="Search (⌘K)"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
              {showLabels && <span className="text-value font-medium">Search</span>}
            </button>
          )}

          {visibleButtons.todos && (
            <button
              onClick={toggleTodoPanel}
              className={buttonClass}
              title="TODOs (⌘T)"
              aria-label="TODOs"
            >
              <ListTodo className="w-5 h-5" />
              {showLabels && <span className="text-value font-medium">TODOs</span>}
              <TodoBadge />
            </button>
          )}

          {snippetsEnabled && visibleButtons.snippets && (
            <button
              onClick={onOpenSnippetManager}
              className={buttonClass}
              title="Snippets"
              aria-label="Snippets"
            >
              <Scissors className="w-5 h-5" />
              {showLabels && <span className="text-value font-medium">Snippets</span>}
            </button>
          )}
        </>
      )}

      {/* The Done state must stay reachable even when the Edit button is hidden */}
      {(visibleButtons.edit || isEditMode) && (
        <button
          onClick={toggleEditMode}
          title={isEditMode ? 'Done (⌘E)' : 'Edit (⌘E)'}
          aria-label={isEditMode ? 'Done' : 'Edit'}
          className={`flex items-center gap-fine px-[10px] py-2 rounded-control transition-all ${
            isEditMode
              ? 'bg-interactive-primary text-white hover:bg-interactive-primary-hover shadow-card-sm'
              : 'bg-transparent text-text-secondary hover:bg-bg-content hover:text-interactive-primary'
          }`}
        >
          {isEditMode ? (
            <>
              <Check className="w-5 h-5" />
              {showLabels && <span className="text-value font-medium">Done</span>}
            </>
          ) : (
            <>
              <Pencil className="w-5 h-5" />
              {showLabels && <span className="text-value font-medium">Edit</span>}
            </>
          )}
        </button>
      )}

      {!isEditMode && (
        <button onClick={onOpenSettings} className={buttonClass} title="Settings">
          <Settings className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
