import { useCallback } from 'react';
import { useInboxStore } from '../store/useInboxStore';
import { useToastStore } from '../store/useToastStore';
import { useChromeStorageSync } from './useChromeStorageSync';
import { INBOX_STORAGE_KEY } from '../utils/storage';
import type { Link } from '../types';

export const useInboxStorage = () => {
  const links = useInboxStore((state) => state.links);
  const loadFromStorage = useInboxStore((state) => state.loadFromStorage);

  const handleSaveError = useCallback(() => {
    useToastStore
      .getState()
      .showToast('Failed to save inbox. Storage limit may be exceeded.', 4000, 'error');
  }, []);

  useChromeStorageSync<Link[]>({
    key: INBOX_STORAGE_KEY,
    data: links,
    loadFromStorage,
    onSaveError: handleSaveError,
  });
};
