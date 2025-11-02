import { useEffect, useRef } from 'react';
import { useBookmarkStore } from '../store/useBookmarkStore';

const STORAGE_KEY = 'homeros_bookmarks';

export const useChromeStorage = () => {
  const { slots, loadFromStorage } = useBookmarkStore();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await chrome.storage.sync.get(STORAGE_KEY);
        if (result[STORAGE_KEY]) {
          loadFromStorage(result[STORAGE_KEY]);
        }
        isInitialLoad.current = false;
      } catch (error) {
        console.error('Failed to load from Chrome storage:', error);
        isInitialLoad.current = false;
      }
    };

    loadData();
  }, [loadFromStorage]);

  useEffect(() => {
    if (isInitialLoad.current) {
      return;
    }

    const saveData = async () => {
      try {
        await chrome.storage.sync.set({ [STORAGE_KEY]: slots });
      } catch (error) {
        console.error('Failed to save to Chrome storage:', error);
      }
    };

    saveData();
  }, [slots]);

  return null;
};
