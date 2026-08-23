import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ToolbarButtonId = 'search' | 'todos' | 'snippets' | 'edit';

export const TOOLBAR_BUTTONS: { id: ToolbarButtonId; label: string }[] = [
  { id: 'search', label: 'Search' },
  { id: 'todos', label: 'TODOs' },
  { id: 'snippets', label: 'Snippets' },
  { id: 'edit', label: 'Edit' },
];

interface ToolbarState {
  showLabels: boolean;
  visibleButtons: Record<ToolbarButtonId, boolean>;
  setShowLabels: (showLabels: boolean) => void;
  toggleButton: (id: ToolbarButtonId) => void;
}

export const useToolbarStore = create<ToolbarState>()(
  persist(
    (set) => ({
      showLabels: true,
      visibleButtons: { search: true, todos: true, snippets: true, edit: true },
      setShowLabels: (showLabels) => set({ showLabels }),
      toggleButton: (id) =>
        set((state) => ({
          visibleButtons: { ...state.visibleButtons, [id]: !state.visibleButtons[id] },
        })),
    }),
    { name: 'homeros-toolbar' }
  )
);
