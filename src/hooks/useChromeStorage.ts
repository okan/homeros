import { useEffect, useRef } from 'react';
import { useBookmarkStore } from '../store/useBookmarkStore';

const STORAGE_KEY = 'homeros_bookmarks';

export const useChromeStorage = () => {
  const { slots, loadFromStorage } = useBookmarkStore();
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
        await chrome.storage.local.set({ [STORAGE_KEY]: slots });
      } catch (error) {
        console.error('Failed to save to Chrome storage:', error);
      }
    };

    saveData();
  }, [slots]);

  return null;
};
