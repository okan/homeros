import { normalizeUrl } from './url';
import type { Slot, Link } from '../types';

const hasUrl = (links: Link[], url: string) => {
  const target = normalizeUrl(url);
  return links.some((link) => normalizeUrl(link.url) === target);
};

// Returns null when the URL is already in a slot or waiting in the inbox
export const addLinkToInbox = (
  inbox: Link[],
  slots: Slot[],
  url: string,
  title: string,
): Link[] | null => {
  if (hasUrl([...inbox, ...slots.flatMap((slot) => slot.links)], url)) return null;

  return [...inbox, { id: crypto.randomUUID(), title, url, order: inbox.length }];
};

// Appends the link to the slot unless that slot already has the URL
export const moveLinkToSlot = (
  slots: Slot[],
  slotId: string,
  link: Link,
): { slots: Slot[]; added: boolean } => {
  const slot = slots.find((s) => s.id === slotId);
  if (!slot || hasUrl(slot.links, link.url)) return { slots, added: false };

  const newLink: Link = {
    id: crypto.randomUUID(),
    title: link.title,
    url: link.url,
    order: slot.links.length,
  };
  return {
    slots: slots.map((s) => (s.id === slotId ? { ...s, links: [...s.links, newLink] } : s)),
    added: true,
  };
};
