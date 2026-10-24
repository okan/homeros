import { cleanUrlForSaving, getDomainFromUrl, normalizeUrl } from './url';
import type { Slot, Link } from '../types';

// Limits that keep a hostile page from filling chrome.storage (10 MB) through saved links
export const MAX_INBOX_LINKS = 200;
export const MAX_SAVED_URL_LENGTH = 8192;
const MAX_TITLE_LENGTH = 300;

// Control and invisible formatting characters (bidi overrides, zero-width spaces, …) that a page
// title could use to disguise itself. Zero-width (non-)joiners stay for emoji and scripts.
const INVISIBLE_CHARACTERS = /(?![‌‍])[\p{Cc}\p{Cf}]/gu;

export const cleanTitle = (title: string): string => {
  const cleaned = title.replace(INVISIBLE_CHARACTERS, '').replace(/\s+/g, ' ').trim();
  return cleaned.length > MAX_TITLE_LENGTH ? `${cleaned.slice(0, MAX_TITLE_LENGTH - 1)}…` : cleaned;
};

export type SaveRejection = 'incognito' | 'not-web' | 'too-long';

interface PageToSave {
  url?: string;
  title?: string;
  incognito?: boolean;
}

// What gets stored for a page the user asked to save, or why it can't be saved
export const preparePageForInbox = (
  page: PageToSave,
): { url: string; title: string } | { rejected: SaveRejection } => {
  // Saving would copy private browsing into the regular profile's storage
  if (page.incognito) return { rejected: 'incognito' };

  const url = page.url ? cleanUrlForSaving(page.url) : null;
  if (!url) return { rejected: 'not-web' };
  if (url.length > MAX_SAVED_URL_LENGTH) return { rejected: 'too-long' };

  return { url, title: cleanTitle(page.title ?? '') || getDomainFromUrl(url) };
};

const hasUrl = (links: Link[], url: string) => {
  const target = normalizeUrl(url);
  return links.some((link) => normalizeUrl(link.url) === target);
};

export const addLinkToInbox = (
  inbox: Link[],
  slots: Slot[],
  url: string,
  title: string,
): { inbox: Link[] } | { skipped: 'duplicate' | 'full' } => {
  if (hasUrl([...inbox, ...slots.flatMap((slot) => slot.links)], url)) {
    return { skipped: 'duplicate' };
  }
  if (inbox.length >= MAX_INBOX_LINKS) return { skipped: 'full' };

  return { inbox: [...inbox, { id: crypto.randomUUID(), title, url, order: inbox.length }] };
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
