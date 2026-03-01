import { useCallback } from 'react';
import { useTodoStore } from '../store/useTodoStore';
import { useToastStore } from '../store/useToastStore';
import { useChromeStorageSync } from './useChromeStorageSync';
import type { Todo } from '../types';

export const useTodoStorage = () => {
  const todos = useTodoStore((state) => state.todos);
  const loadTodosFromStorage = useTodoStore((state) => state.loadTodosFromStorage);

  const handleSaveError = useCallback(() => {
    useToastStore.getState().showToast(
      'Failed to save tasks. Storage limit may be exceeded.',
      4000,
      'error'
    );
  }, []);

  useChromeStorageSync<Todo[]>({
    key: 'homeros_todos',
    data: todos,
    loadFromStorage: loadTodosFromStorage,
    onSaveError: handleSaveError,
    migrateSyncToLocal: true,
  });
};
