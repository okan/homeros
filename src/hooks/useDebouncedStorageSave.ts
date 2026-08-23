import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';

const SAVE_DEBOUNCE_MS = 300;

interface SaveOptions {
  payload: Record<string, unknown>;
  skipRef: MutableRefObject<boolean>;
  onSaveError?: (error: unknown) => void;
}

export const useDebouncedStorageSave = ({ payload, skipRef, onSaveError }: SaveOptions) => {
  const timeoutRef = useRef<number>();
  const pendingRef = useRef<Record<string, unknown> | null>(null);
  const onSaveErrorRef = useRef(onSaveError);
  onSaveErrorRef.current = onSaveError;

  useEffect(() => {
    if (skipRef.current) return;

    pendingRef.current = payload;
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(async () => {
      pendingRef.current = null;
      try {
        await chrome.storage.local.set(payload);
      } catch (error) {
        console.error('Failed to save to Chrome storage:', error);
        onSaveErrorRef.current?.(error);
      }
    }, SAVE_DEBOUNCE_MS);
  }, [payload, skipRef]);

  useEffect(() => {
    const flush = () => {
      if (!pendingRef.current) return;
      window.clearTimeout(timeoutRef.current);
      const data = pendingRef.current;
      pendingRef.current = null;
      chrome.storage.local.set(data).catch((error) => {
        console.error('Failed to save to Chrome storage:', error);
        onSaveErrorRef.current?.(error);
      });
    };

    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, []);
};
