import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';

const SAVE_DEBOUNCE_MS = 300;

type StorageWrite = (payload: Record<string, unknown>) => Promise<void>;

const writeToLocalStorage: StorageWrite = (payload) => chrome.storage.local.set(payload);

interface SaveOptions {
  payload: Record<string, unknown>;
  skipRef: MutableRefObject<boolean>;
  write?: StorageWrite;
  onSaveError?: (error: unknown) => void;
}

export const useDebouncedStorageSave = ({
  payload,
  skipRef,
  write = writeToLocalStorage,
  onSaveError,
}: SaveOptions) => {
  const timeoutRef = useRef<number>();
  const pendingRef = useRef<Record<string, unknown> | null>(null);
  const writeRef = useRef(write);
  writeRef.current = write;
  const onSaveErrorRef = useRef(onSaveError);
  onSaveErrorRef.current = onSaveError;

  useEffect(() => {
    window.clearTimeout(timeoutRef.current);

    // A skipped payload supersedes any older one still waiting, so drop that too
    if (skipRef.current) {
      pendingRef.current = null;
      return;
    }

    pendingRef.current = payload;
    timeoutRef.current = window.setTimeout(async () => {
      pendingRef.current = null;
      try {
        await writeRef.current(payload);
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
      writeRef.current(data).catch((error) => {
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
