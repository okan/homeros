import { addLinkToInbox, preparePageForInbox } from './utils/inbox';
import { BOOKMARKS_STORAGE_KEY, INBOX_STORAGE_KEY, STORAGE_LOCK } from './utils/storage';
import type { Slot, Link } from './types';

const SAVE_MENU_ID = 'save-page';
const DEFAULT_ACTION_TITLE = 'Save page to Homeros';
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

// Badge plus a hover explanation for each outcome of a save
const OUTCOMES = {
  saved: { text: '✓', color: BADGE_SUCCESS_COLOR, title: 'Saved to your Homeros inbox' },
  duplicate: { text: '✓', color: BADGE_SUCCESS_COLOR, title: 'Already in Homeros' },
  full: {
    text: '✕',
    color: BADGE_ERROR_COLOR,
    title: 'Your Homeros inbox is full. Sort or remove some links first.',
  },
  incognito: {
    text: '✕',
    color: BADGE_ERROR_COLOR,
    title: "Pages from Incognito windows aren't saved",
  },
  'not-web': { text: '✕', color: BADGE_ERROR_COLOR, title: 'Only web pages can be saved' },
  'too-long': {
    text: '✕',
    color: BADGE_ERROR_COLOR,
    title: "This page's address is too long to save",
  },
  failed: { text: '!', color: BADGE_ERROR_COLOR, title: 'Saving to Homeros failed' },
};

type Outcome = keyof typeof OUTCOMES;

const badgeTimers = new Map<number | undefined, ReturnType<typeof setTimeout>>();

// The tab may be closed before the badge is set or cleared; that's fine
const ignoreClosedTab = () => {};

// Shown on the saved tab only; a newer badge on the same tab restarts the timer
const showOutcome = (tabId: number | undefined, outcome: Outcome) => {
  const { text, color, title } = OUTCOMES[outcome];
  clearTimeout(badgeTimers.get(tabId));
  chrome.action.setBadgeBackgroundColor({ tabId, color }).catch(ignoreClosedTab);
  chrome.action.setBadgeText({ tabId, text }).catch(ignoreClosedTab);
  chrome.action.setTitle({ tabId, title }).catch(ignoreClosedTab);
  badgeTimers.set(
    tabId,
    setTimeout(() => {
      badgeTimers.delete(tabId);
      chrome.action.setBadgeText({ tabId, text: '' }).catch(ignoreClosedTab);
      chrome.action.setTitle({ tabId, title: DEFAULT_ACTION_TITLE }).catch(ignoreClosedTab);
    }, BADGE_DURATION_MS),
  );
};

const saveTab = async (tab: chrome.tabs.Tab): Promise<Outcome> => {
  const page = preparePageForInbox(tab);
  if ('rejected' in page) return page.rejected;

  // New tab pages also rewrite the inbox, so the read-modify-write runs under the shared lock
  return navigator.locks.request(STORAGE_LOCK, async () => {
    const result = await chrome.storage.local.get([BOOKMARKS_STORAGE_KEY, INBOX_STORAGE_KEY]);
    const slots: Slot[] = result[BOOKMARKS_STORAGE_KEY] ?? [];
    const inbox: Link[] = result[INBOX_STORAGE_KEY] ?? [];
    const added = addLinkToInbox(inbox, slots, page.url, page.title);
    if ('skipped' in added) return added.skipped;

    await chrome.storage.local.set({ [INBOX_STORAGE_KEY]: added.inbox });
    return 'saved';
  });
};

const handleSave = (tab: chrome.tabs.Tab) => {
  saveTab(tab)
    .then((outcome) => showOutcome(tab.id, outcome))
    .catch((error) => {
      console.error('Failed to save page to Homeros:', error);
      showOutcome(tab.id, 'failed');
    });
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: SAVE_MENU_ID,
      title: DEFAULT_ACTION_TITLE,
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
