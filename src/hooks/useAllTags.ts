import { useMemo } from 'react';
import { useBookmarkStore } from '../store/useBookmarkStore';

export const useAllTags = (): string[] => {
  const slots = useBookmarkStore((state) => state.slots);

  return useMemo(() => {
    const tagSet = new Set<string>();
    slots.forEach((slot) =>
      slot.links.forEach((link) => link.tags?.forEach((tag) => tagSet.add(tag)))
    );
    return Array.from(tagSet).sort();
  }, [slots]);
};
