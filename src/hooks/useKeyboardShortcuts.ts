import { useEffect, useRef } from 'react';

interface ShortcutHandlers {
  onSearch?: () => void;
  onToggleEditMode?: () => void;
  onToggleTodoPanel?: () => void;
  onEscape?: () => void;
}

export const useKeyboardShortcuts = (handlers: ShortcutHandlers) => {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        handlersRef.current.onSearch?.();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === 'e') {
        event.preventDefault();
        handlersRef.current.onToggleEditMode?.();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === 't') {
        event.preventDefault();
        handlersRef.current.onToggleTodoPanel?.();
        return;
      }

      if (event.key === 'Escape') {
        handlersRef.current.onEscape?.();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
};
