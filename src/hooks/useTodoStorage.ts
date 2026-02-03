import { useEffect, useRef } from 'react';
import { useTodoStore } from '../store/useTodoStore';
import { useToastStore } from '../store/useToastStore';

const STORAGE_KEY = 'homeros_todos';

export const useTodoStorage = () => {
  const { todos, loadTodosFromStorage } = useTodoStore();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // One-time migration: sync -> local
        const syncResult = await chrome.storage.sync.get(STORAGE_KEY);
        if (syncResult[STORAGE_KEY]) {
          await chrome.storage.local.set({ [STORAGE_KEY]: syncResult[STORAGE_KEY] });
          await chrome.storage.sync.remove(STORAGE_KEY);
        }

        // Load from local storage
        const result = await chrome.storage.local.get(STORAGE_KEY);
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
        await chrome.storage.local.set({ [STORAGE_KEY]: todos });
      } catch (error) {
        console.error('Failed to save todos to Chrome storage:', error);
        useToastStore.getState().showToast(
          'Failed to save tasks. Storage limit may be exceeded.',
          4000,
          'error'
        );
      }
    };

    saveData();
  }, [todos]);

  return null;
};
