import { useCallback } from 'react';
import { useBookmarkStore } from '../store/useBookmarkStore';
import { useToastStore } from '../store/useToastStore';
import { useChromeStorageSync } from './useChromeStorageSync';
import { BOOKMARKS_STORAGE_KEY } from '../utils/storage';
import type { Slot } from '../types';

export const useChromeStorage = () => {
  const slots = useBookmarkStore((state) => state.slots);
  const loadFromStorage = useBookmarkStore((state) => state.loadFromStorage);

  const handleSaveError = useCallback(() => {
    useToastStore
      .getState()
      .showToast('Failed to save bookmarks. Storage limit may be exceeded.', 4000, 'error');
  }, []);

  useChromeStorageSync<Slot[]>({
    key: BOOKMARKS_STORAGE_KEY,
    data: slots,
    loadFromStorage,
    onSaveError: handleSaveError,
    migrateSyncToLocal: true,
  });
};
