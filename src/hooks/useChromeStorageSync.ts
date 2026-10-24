import { useEffect, useMemo, useRef } from 'react';
import { useDebouncedStorageSave } from './useDebouncedStorageSave';
import { consumeEcho, isSynced, markSynced, stableStringify, writeSynced } from '../utils/storage';

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
  const receivedChangeRef = useRef(false);

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
        // A change event that arrived while this read was in flight carries a newer value
        if (result[key] && !receivedChangeRef.current) {
          markSynced(key, stableStringify(result[key]));
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

  // Pick up writes from other new tabs and the toolbar button, so a stale tab can't overwrite them
  useEffect(() => {
    const handleChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: chrome.storage.AreaName,
    ) => {
      const newValue = changes[key]?.newValue;
      if (areaName !== 'local' || newValue === undefined) return;

      const serialized = stableStringify(newValue);
      if (consumeEcho(key, serialized)) return;

      receivedChangeRef.current = true;
      markSynced(key, serialized);
      loadFromStorage(newValue);
    };

    chrome.storage.onChanged.addListener(handleChange);
    return () => chrome.storage.onChanged.removeListener(handleChange);
  }, [key, loadFromStorage]);

  const serializedData = useMemo(() => stableStringify(data), [data]);
  // Nothing to save while loading, or when storage already holds exactly this data
  const skipSaveRef = useRef(true);
  skipSaveRef.current = isInitialLoad.current || isSynced(key, serializedData);

  const payload = useMemo(() => ({ [key]: data }), [key, data]);

  useDebouncedStorageSave({ payload, skipRef: skipSaveRef, write: writeSynced, onSaveError });
};
