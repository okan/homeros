import { addLinkToInbox } from './utils/inbox';
import { getDomainFromUrl, isValidUrl } from './utils/url';
import { BOOKMARKS_STORAGE_KEY, INBOX_STORAGE_KEY, STORAGE_LOCK } from './utils/storage';
import type { Slot, Link } from './types';

const SAVE_MENU_ID = 'save-page';
const BADGE_DURATION_MS = 1500;
const BADGE_SUCCESS_COLOR = '#16a34a';
const BADGE_ERROR_COLOR = '#dc2626';

// Every place inside a page where a right-click should still offer to save the page
const MENU_CONTEXTS: chrome.contextMenus.ContextType[] = [
  'page',
  'frame',
  'selection',
  'link',
  'editable',
  'image',
  'video',
  'audio',
];

const badgeTimers = new Map<number | undefined, ReturnType<typeof setTimeout>>();

// The tab may be closed before the badge is set or cleared; that's fine
const ignoreClosedTab = () => {};

// Shown on the saved tab only; a newer badge on the same tab restarts the timer
const showBadge = (tabId: number | undefined, text: string, color: string) => {
  clearTimeout(badgeTimers.get(tabId));
  chrome.action.setBadgeBackgroundColor({ tabId, color }).catch(ignoreClosedTab);
  chrome.action.setBadgeText({ tabId, text }).catch(ignoreClosedTab);
  badgeTimers.set(
    tabId,
    setTimeout(() => {
      badgeTimers.delete(tabId);
      chrome.action.setBadgeText({ tabId, text: '' }).catch(ignoreClosedTab);
    }, BADGE_DURATION_MS),
  );
};

const saveTab = async (tab: chrome.tabs.Tab) => {
  const url = tab.url;
  if (!url || !isValidUrl(url)) {
    showBadge(tab.id, '✕', BADGE_ERROR_COLOR);
    return;
  }

  // New tab pages also rewrite the inbox, so the read-modify-write runs under the shared lock
  await navigator.locks.request(STORAGE_LOCK, async () => {
    const result = await chrome.storage.local.get([BOOKMARKS_STORAGE_KEY, INBOX_STORAGE_KEY]);
    const slots: Slot[] = result[BOOKMARKS_STORAGE_KEY] ?? [];
    const inbox: Link[] = result[INBOX_STORAGE_KEY] ?? [];
    const title = tab.title || getDomainFromUrl(url) || url;
    const updatedInbox = addLinkToInbox(inbox, slots, url, title);

    if (updatedInbox) {
      await chrome.storage.local.set({ [INBOX_STORAGE_KEY]: updatedInbox });
    }
  });
  showBadge(tab.id, '✓', BADGE_SUCCESS_COLOR);
};

const handleSave = (tab: chrome.tabs.Tab) => {
  saveTab(tab).catch((error) => {
    console.error('Failed to save page to Homeros:', error);
    showBadge(tab.id, '!', BADGE_ERROR_COLOR);
  });
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: SAVE_MENU_ID,
      title: 'Save page to Homeros',
      contexts: MENU_CONTEXTS,
      documentUrlPatterns: ['http://*/*', 'https://*/*'],
    });
  });
});

chrome.action.onClicked.addListener(handleSave);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === SAVE_MENU_ID && tab) {
    handleSave(tab);
  }
});
