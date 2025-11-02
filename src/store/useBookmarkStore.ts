import { create } from 'zustand';
import type { BookmarkStore, Slot, Link } from '../types';

export const useBookmarkStore = create<BookmarkStore>((set) => ({
  slots: [],
  isEditMode: false,

  toggleEditMode: () =>
    set((state) => ({
      isEditMode: !state.isEditMode,
    })),

  addSlot: (name: string, icon: string = 'Folder') =>
    set((state) => {
      const newSlot: Slot = {
        id: crypto.randomUUID(),
        name,
        icon,
        links: [],
        order: state.slots.length,
      };
      return { slots: [...state.slots, newSlot] };
    }),

  updateSlot: (id: string, name: string, icon: string) =>
    set((state) => ({
      slots: state.slots.map((slot) => (slot.id === id ? { ...slot, name, icon } : slot)),
    })),

  deleteSlot: (id: string) =>
    set((state) => ({
      slots: state.slots.filter((slot) => slot.id !== id),
    })),

  reorderSlots: (slots: Slot[]) =>
    set(() => ({
      slots: slots.map((slot, index) => ({ ...slot, order: index })),
    })),

  addLink: (slotId: string, title: string, url: string, description?: string) =>
    set((state) => ({
      slots: state.slots.map((slot) => {
        if (slot.id === slotId) {
          const newLink: Link = {
            id: crypto.randomUUID(),
            title,
            url,
            description,
            order: slot.links.length,
          };
          return { ...slot, links: [...slot.links, newLink] };
        }
        return slot;
      }),
    })),

  updateLink: (slotId: string, linkId: string, title: string, url: string, description?: string) =>
    set((state) => ({
      slots: state.slots.map((slot) => {
        if (slot.id === slotId) {
          return {
            ...slot,
            links: slot.links.map((link) =>
              link.id === linkId ? { ...link, title, url, description } : link,
            ),
          };
        }
        return slot;
      }),
    })),

  deleteLink: (slotId: string, linkId: string) =>
    set((state) => ({
      slots: state.slots.map((slot) => {
        if (slot.id === slotId) {
          return {
            ...slot,
            links: slot.links.filter((link) => link.id !== linkId),
          };
        }
        return slot;
      }),
    })),

  reorderLinks: (slotId: string, links: Link[]) =>
    set((state) => ({
      slots: state.slots.map((slot) => {
        if (slot.id === slotId) {
          return {
            ...slot,
            links: links.map((link, index) => ({ ...link, order: index })),
          };
        }
        return slot;
      }),
    })),

  loadFromStorage: (data: Slot[]) =>
    set(() => ({
      slots: data,
    })),
}));
