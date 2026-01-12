import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onSearch?: () => void;
  onToggleEditMode?: () => void;
  onToggleTodoPanel?: () => void;
  onEscape?: () => void;
}

export const useKeyboardShortcuts = (handlers: ShortcutHandlers) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        handlers.onSearch?.();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === 'e') {
        event.preventDefault();
        handlers.onToggleEditMode?.();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === 't') {
        event.preventDefault();
        handlers.onToggleTodoPanel?.();
        return;
      }

      if (event.key === 'Escape') {
        handlers.onEscape?.();
        return;
      }
    },
    [handlers]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
