import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Link } from '../types';

interface InboxStore {
  links: Link[];
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  loadFromStorage: (links: Link[]) => void;
}

// Links saved from the toolbar button or context menu, waiting to be moved into a slot.
// They change only through storage (useInboxActions), never by editing this state directly.
export const useInboxStore = create<InboxStore>()(
  persist(
    (set) => ({
      links: [],
      isCollapsed: false,

      toggleCollapsed: () =>
        set((state) => ({
          isCollapsed: !state.isCollapsed,
        })),

      loadFromStorage: (links: Link[]) =>
        set(() => ({
          links,
        })),
    }),
    // Links live in chrome.storage; only the collapsed preference is kept here
    { name: 'homeros-inbox', partialize: (state) => ({ isCollapsed: state.isCollapsed }) },
  ),
);
