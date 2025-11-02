import { useEffect, useRef } from 'react';
import { useTodoStore } from '../store/useTodoStore';

const STORAGE_KEY = 'homeros_todos';

export const useTodoStorage = () => {
  const { todos, loadTodosFromStorage } = useTodoStore();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await chrome.storage.sync.get(STORAGE_KEY);
        if (result[STORAGE_KEY]) {
          loadTodosFromStorage(result[STORAGE_KEY]);
        }
        isInitialLoad.current = false;
      } catch (error) {
        console.error('Failed to load todos from Chrome storage:', error);
        isInitialLoad.current = false;
      }
    };

    loadData();
  }, [loadTodosFromStorage]);

  useEffect(() => {
    if (isInitialLoad.current) {
      return;
    }

    const saveData = async () => {
      try {
        await chrome.storage.sync.set({ [STORAGE_KEY]: todos });
      } catch (error) {
        console.error('Failed to save todos to Chrome storage:', error);
      }
    };

    saveData();
  }, [todos]);

  return null;
};
