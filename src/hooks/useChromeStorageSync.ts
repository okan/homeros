import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDebouncedStorageSave } from './useDebouncedStorageSave';
import { mergeById } from '../utils/merge';
import {
  classifyChange,
  getSynced,
  isSynced,
  markSynced,
  stableStringify,
  writeMerged,
} from '../utils/storage';

interface SyncOptions<T> {
  key: string;
  data: T;
  loadFromStorage: (data: T) => void;
  onSaveError?: (error: unknown) => void;
  migrateSyncToLocal?: boolean;
}

// Data is a list of items with ids, so concurrent edits from other pages can be merged
export const useChromeStorageSync = <T extends { id: string }[]>({
  key,
  data,
  loadFromStorage,
  onSaveError,
  migrateSyncToLocal = false,
}: SyncOptions<T>) => {
  const isInitialLoad = useRef(true);
  const receivedChangeRef = useRef(false);
  const serializedData = useMemo(() => stableStringify(data), [data]);
  const dataRef = useRef(data);
  dataRef.current = data;
  const serializedRef = useRef(serializedData);
  serializedRef.current = serializedData;
  // The store's state before anything was loaded: what's "stored" while storage is empty
  const initialSerializedRef = useRef(serializedData);

  const merge = useCallback(
    (base: T, ours: T, theirs: T) => mergeById<T[number]>(base, ours, theirs) as T,
    [],
  );

  const write = useCallback(
    async (payload: Record<string, unknown>) => {
      const saved = payload[key] as T;
      const stored = await writeMerged(key, saved, merge);
      if (stored === saved) return;

      // Another page's changes were merged in; keep any edit made here while saving
      const current = dataRef.current;
      loadFromStorage(current === saved ? stored : merge(saved, current, stored));
    },
    [key, loadFromStorage, merge],
  );

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
        if (receivedChangeRef.current) {
          isInitialLoad.current = false;
          return;
        }

        if (result[key]) {
          markSynced(key, stableStringify(result[key]));
          loadFromStorage(result[key]);
          isInitialLoad.current = false;
          return;
        }

        markSynced(key, initialSerializedRef.current);
        isInitialLoad.current = false;
        // Nothing was stored, so an edit made here before loading finished is the only copy
        if (serializedRef.current !== initialSerializedRef.current) {
          await write({ [key]: dataRef.current });
        }
      } catch (error) {
        console.error(`Failed to load "${key}" from Chrome storage:`, error);
        isInitialLoad.current = false;
      }
    };

    loadData();
  }, [key, loadFromStorage, migrateSyncToLocal, write]);

  // Pick up writes from other new tabs and the toolbar button, so a stale tab can't overwrite them
  useEffect(() => {
    const handleChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: chrome.storage.AreaName,
    ) => {
      const newValue = changes[key]?.newValue;
      if (areaName !== 'local' || newValue === undefined) return;

      const serialized = stableStringify(newValue);
      if (classifyChange(key, serialized) !== 'external') return;

      receivedChangeRef.current = true;
      const base = getSynced(key);
      markSynced(key, serialized);

      // Edits here that aren't saved yet stay, with the other page's changes added on top
      const hasUnsavedEdits =
        !isInitialLoad.current && base !== undefined && serializedRef.current !== base;
      loadFromStorage(
        hasUnsavedEdits ? merge(JSON.parse(base), dataRef.current, newValue) : newValue,
      );
    };

    chrome.storage.onChanged.addListener(handleChange);
    return () => chrome.storage.onChanged.removeListener(handleChange);
  }, [key, loadFromStorage, merge]);

  // Nothing to save while loading, or when storage already holds exactly this data
  const skipSaveRef = useRef(true);
  skipSaveRef.current = isInitialLoad.current || isSynced(key, serializedData);

  const payload = useMemo(() => ({ [key]: data }), [key, data]);

  useDebouncedStorageSave({ payload, skipRef: skipSaveRef, write, onSaveError });
};
