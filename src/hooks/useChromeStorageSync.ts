import { useEffect, useMemo, useRef } from 'react';
import { useDebouncedStorageSave } from './useDebouncedStorageSave';

interface SyncOptions<T> {
  key: string;
  data: T;
  loadFromStorage: (data: T) => void;
  onSaveError?: (error: unknown) => void;
  migrateSyncToLocal?: boolean;
}

export const useChromeStorageSync = <T>({
  key,
  data,
  loadFromStorage,
  onSaveError,
  migrateSyncToLocal = false,
}: SyncOptions<T>) => {
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (migrateSyncToLocal) {
          const syncResult = await chrome.storage.sync.get(key);
          if (syncResult[key]) {
            await chrome.storage.local.set({ [key]: syncResult[key] });
            await chrome.storage.sync.remove(key);
          }
        }

        const result = await chrome.storage.local.get(key);
        if (result[key]) {
          loadFromStorage(result[key]);
        }
        isInitialLoad.current = false;
      } catch (error) {
        console.error(`Failed to load "${key}" from Chrome storage:`, error);
        isInitialLoad.current = false;
      }
    };

    loadData();
  }, [key, loadFromStorage, migrateSyncToLocal]);

  const payload = useMemo(() => ({ [key]: data }), [key, data]);

  useDebouncedStorageSave({ payload, skipRef: isInitialLoad, onSaveError });
};
