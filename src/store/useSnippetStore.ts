import { create } from 'zustand';
import type { Snippet, SnippetSettings } from '../types';

interface SnippetStore {
  snippets: Snippet[];
  settings: SnippetSettings;
  addSnippet: (key: string, value: string) => void;
  updateSnippet: (id: string, key: string, value: string) => void;
  deleteSnippet: (id: string) => void;
  clearSnippets: () => void;
  setSnippetsEnabled: (enabled: boolean) => void;
  loadSnippetsFromStorage: (snippets: Snippet[], settings: SnippetSettings) => void;
}

export const useSnippetStore = create<SnippetStore>((set) => ({
  snippets: [],
  settings: { enabled: false },

  addSnippet: (key, value) =>
    set((state) => ({
      snippets: [
        ...state.snippets,
        {
          id: crypto.randomUUID(),
          key,
          value,
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  updateSnippet: (id, key, value) =>
    set((state) => ({
      snippets: state.snippets.map((s) =>
        s.id === id ? { ...s, key, value } : s
      ),
    })),

  deleteSnippet: (id) =>
    set((state) => ({
      snippets: state.snippets.filter((s) => s.id !== id),
    })),

  clearSnippets: () => set({ snippets: [] }),

  setSnippetsEnabled: (enabled) =>
    set((state) => ({
      settings: { ...state.settings, enabled },
    })),

  loadSnippetsFromStorage: (snippets, settings) =>
    set({ snippets, settings }),
}));
