import { useCallback } from 'react';
import { useBookmarkStore } from '../store/useBookmarkStore';
import { useInboxStore } from '../store/useInboxStore';
import { useToastStore } from '../store/useToastStore';
import { moveLinkToSlot } from '../utils/inbox';
import {
  BOOKMARKS_STORAGE_KEY,
  INBOX_STORAGE_KEY,
  STORAGE_LOCK,
  writeSynced,
} from '../utils/storage';
import type { Link } from '../types';

// The toolbar button can add to the inbox at any moment, so these changes go straight to
// storage under the shared lock instead of through the debounced save
const readInbox = async (): Promise<Link[]> => {
  const result = await chrome.storage.local.get(INBOX_STORAGE_KEY);
  return result[INBOX_STORAGE_KEY] ?? [];
};

export const useInboxActions = () => {
  const showToast = useToastStore((state) => state.showToast);

  const moveLink = useCallback(
    async (linkId: string, slotId: string) => {
      try {
        const outcome = await navigator.locks.request(STORAGE_LOCK, async () => {
          const inbox = await readInbox();
          const link = inbox.find((l) => l.id === linkId);
          // In-memory slots are the newest, including edits still waiting to be saved
          const slots = useBookmarkStore.getState().slots;
          const slot = slots.find((s) => s.id === slotId);
          if (!link || !slot) return null;

          const moved = moveLinkToSlot(slots, slotId, link);
          const updatedInbox = inbox.filter((l) => l.id !== linkId);
          // Both keys in one write, so the link can't end up in neither place or in both
          await writeSynced({
            [BOOKMARKS_STORAGE_KEY]: moved.slots,
            [INBOX_STORAGE_KEY]: updatedInbox,
          });
          useBookmarkStore.getState().loadFromStorage(moved.slots);
          useInboxStore.getState().loadFromStorage(updatedInbox);
          return { added: moved.added, slotName: slot.name };
        });

        if (outcome) {
          showToast(
            outcome.added ? `Moved to ${outcome.slotName}` : `Already in ${outcome.slotName}`,
          );
        }
      } catch (error) {
        console.error('Failed to move inbox link:', error);
        showToast('Failed to move link. Storage limit may be exceeded.', 4000, 'error');
      }
    },
    [showToast],
  );

  const removeLink = useCallback(
    async (linkId: string) => {
      try {
        await navigator.locks.request(STORAGE_LOCK, async () => {
          const updatedInbox = (await readInbox()).filter((l) => l.id !== linkId);
          await writeSynced({ [INBOX_STORAGE_KEY]: updatedInbox });
          useInboxStore.getState().loadFromStorage(updatedInbox);
        });
      } catch (error) {
        console.error('Failed to remove inbox link:', error);
        showToast('Failed to remove link.', 4000, 'error');
      }
    },
    [showToast],
  );

  return { moveLink, removeLink };
};
