import { useEffect, useRef } from 'react';
import { useSnippetStore } from '../store/useSnippetStore';

const SNIPPETS_KEY = 'homeros_snippets';
const SETTINGS_KEY = 'homeros_snippet_settings';

export const useSnippetStorage = () => {
    const { snippets, settings, loadSnippetsFromStorage } = useSnippetStore();
    const isInitialLoad = useRef(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await chrome.storage.local.get([SNIPPETS_KEY, SETTINGS_KEY]);

                const loadedSnippets = result[SNIPPETS_KEY] || [];
                const loadedSettings = result[SETTINGS_KEY] || { enabled: false };

                loadSnippetsFromStorage(loadedSnippets, loadedSettings);
                isInitialLoad.current = false;
            } catch (error) {
                console.error('Failed to load snippets from local storage:', error);
                isInitialLoad.current = false;
            }
        };

        loadData();
    }, [loadSnippetsFromStorage]);

    useEffect(() => {
        if (isInitialLoad.current) {
            return;
        }

        const saveData = async () => {
            try {
                await chrome.storage.local.set({
                    [SNIPPETS_KEY]: snippets,
                    [SETTINGS_KEY]: settings
                });
            } catch (error) {
                console.error('Failed to save snippets to local storage:', error);
            }
        };

        saveData();
    }, [snippets, settings]);

    return null;
};
