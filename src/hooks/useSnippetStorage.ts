import { useEffect, useMemo, useRef } from 'react';
import { useSnippetStore } from '../store/useSnippetStore';
import { useDebouncedStorageSave } from './useDebouncedStorageSave';
import type { Snippet, SnippetSettings } from '../types';

const SNIPPETS_KEY = 'homeros_snippets';
const SETTINGS_KEY = 'homeros_snippet_settings';

export const useSnippetStorage = () => {
  const snippets = useSnippetStore((state) => state.snippets);
  const settings = useSnippetStore((state) => state.settings);
  const loadSnippetsFromStorage = useSnippetStore((state) => state.loadSnippetsFromStorage);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await chrome.storage.local.get([SNIPPETS_KEY, SETTINGS_KEY]);
        const loadedSnippets: Snippet[] = result[SNIPPETS_KEY] || [];
        const loadedSettings: SnippetSettings = result[SETTINGS_KEY] || { enabled: false };
        loadSnippetsFromStorage(loadedSnippets, loadedSettings);
        isInitialLoad.current = false;
      } catch (error) {
        console.error('Failed to load snippets from Chrome storage:', error);
        isInitialLoad.current = false;
      }
    };

    loadData();
  }, [loadSnippetsFromStorage]);

  const payload = useMemo(
    () => ({
      [SNIPPETS_KEY]: snippets,
      [SETTINGS_KEY]: settings,
    }),
    [snippets, settings]
  );

  useDebouncedStorageSave({ payload, skipRef: isInitialLoad });
};
