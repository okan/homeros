import { test, expect, chromium } from '@playwright/test';
import type { BrowserContext, Page, Worker } from '@playwright/test';
import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Loads the built extension into a real Chromium, so the background worker, Web Locks and
// chrome.storage behave exactly as they do for users

const rootDir = fileURLToPath(new URL('..', import.meta.url));

// One browser and one build for the whole file
test.describe.configure({ mode: 'serial' });

let distDir: string;
let context: BrowserContext;
let worker: Worker;
let extensionId: string;

type TabInfo = { id: number; url: string; title: string };

const readInbox = () =>
  worker.evaluate(
    async () => (await chrome.storage.local.get('homeros_inbox')).homeros_inbox ?? [],
  ) as Promise<{ id: string; title: string; url: string }[]>;

const inboxUrls = async () => (await readInbox()).map((l) => l.url);

const badgeText = (tabId: number) =>
  worker.evaluate((id) => chrome.action.getBadgeText({ tabId: id }), tabId);

// Opens a real tab (served by a route, no network needed) and returns its Chrome tab id
const openTab = async (url: string): Promise<number> => {
  const page = await context.newPage();
  await page.goto(url);
  return worker.evaluate(async () => {
    const tabs = await chrome.tabs.query({});
    return Math.max(...tabs.map((tab) => tab.id ?? -1));
  });
};

const clickToolbarButton = (tab: TabInfo) =>
  worker.evaluate((t) => {
    (chrome.action.onClicked as unknown as { dispatch: (tab: object) => void }).dispatch({
      index: 0,
      windowId: 1,
      ...t,
    });
  }, tab);

const openNewTabPage = async (): Promise<Page> => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/index.html`);
  return page;
};

test.beforeAll(async () => {
  // Build the current source outside dist/, which the dev server started for the other
  // tests writes to
  distDir = mkdtempSync(join(tmpdir(), 'homeros-extension-'));
  execSync(`npx vite build --outDir "${distDir}" --emptyOutDir`, { cwd: rootDir, stdio: 'pipe' });

  context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    args: [`--disable-extensions-except=${distDir}`, `--load-extension=${distDir}`],
  });
  await context.route('https://example.com/**', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<title>Example</title>' }),
  );

  worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
  extensionId = new URL(worker.url()).host;
});

test.beforeEach(async () => {
  await worker.evaluate(async () => {
    await chrome.storage.local.clear();
    await chrome.storage.local.set({ homeros_onboarding_completed: true });
  });
});

test.afterAll(async () => {
  await context?.close();
  if (distDir) rmSync(distDir, { recursive: true, force: true });
});

test('toolbar button saves the page into the inbox', async () => {
  const tabId = await openTab('https://example.com/docs');

  await clickToolbarButton({ id: tabId, url: 'https://example.com/docs', title: '' });

  await expect
    .poll(readInbox)
    .toEqual([expect.objectContaining({ url: 'https://example.com/docs', title: 'example.com' })]);
  await expect.poll(() => badgeText(tabId)).toBe('✓');
  expect(await worker.evaluate(() => chrome.action.getBadgeText({}))).toBe('');
});

test('skips a page already in a slot, even written differently', async () => {
  await worker.evaluate(() =>
    chrome.storage.local.set({
      homeros_bookmarks: [
        {
          id: 'work',
          name: 'Work',
          icon: 'Folder',
          order: 0,
          links: [{ id: 'l1', title: 'Docs', url: 'https://example.com/docs', order: 0 }],
        },
      ],
    }),
  );
  const tabId = await openTab('https://example.com/docs/');

  await clickToolbarButton({ id: tabId, url: 'https://example.com/docs/', title: 'Docs' });

  await expect.poll(() => badgeText(tabId)).toBe('✓');
  expect(await readInbox()).toEqual([]);
});

test('keeps pages whose paths differ only in case', async () => {
  const tabId = await openTab('https://example.com/AbC');

  await clickToolbarButton({ id: tabId, url: 'https://example.com/AbC', title: 'Upper' });
  await clickToolbarButton({ id: tabId, url: 'https://example.com/abc', title: 'Lower' });

  await expect.poll(inboxUrls).toEqual(['https://example.com/AbC', 'https://example.com/abc']);
});

test('rejects pages that are not on the web', async () => {
  const tabId = await openTab('https://example.com/settings');

  await clickToolbarButton({ id: tabId, url: 'chrome://settings/', title: 'Settings' });

  await expect.poll(() => badgeText(tabId)).toBe('✕');
  expect(await readInbox()).toEqual([]);
});

test('rapid saves are all kept', async () => {
  const tabId = await openTab('https://example.com/rapid');

  for (const path of ['a', 'b', 'c', 'd', 'e']) {
    await clickToolbarButton({ id: tabId, url: `https://example.com/${path}`, title: path });
  }

  await expect.poll(async () => (await inboxUrls()).length).toBe(5);
});

test('right-click menu is registered and saves the page', async () => {
  await expect
    .poll(() =>
      worker.evaluate(() =>
        chrome.contextMenus.update('save-page', {}).then(
          () => true,
          () => false,
        ),
      ),
    )
    .toBe(true);
  const tabId = await openTab('https://example.com/menu');

  await worker.evaluate((id) => {
    (
      chrome.contextMenus.onClicked as unknown as { dispatch: (...args: object[]) => void }
    ).dispatch(
      { menuItemId: 'save-page', editable: false, pageUrl: 'https://example.com/menu' },
      { id, index: 0, windowId: 1, url: 'https://example.com/menu', title: 'Menu' },
    );
  }, tabId);

  await expect.poll(inboxUrls).toEqual(['https://example.com/menu']);
});

test('new tab page moves and removes links while the toolbar keeps saving', async () => {
  const tabId = await openTab('https://example.com/start');
  await worker.evaluate(() =>
    chrome.storage.local.set({
      homeros_bookmarks: [{ id: 'work', name: 'Work', icon: 'Folder', order: 0, links: [] }],
      homeros_inbox: [
        { id: 'a', title: 'Page A', url: 'https://example.com/a', order: 0 },
        { id: 'b', title: 'Page B', url: 'https://example.com/b', order: 1 },
      ],
    }),
  );
  const page = await openNewTabPage();
  const inbox = page.getByRole('complementary', { name: 'Inbox' });
  await expect(inbox.getByText('2 to sort')).toBeVisible();

  // Removing from the page and saving from the toolbar at the same moment both stick
  await Promise.all([
    inbox.getByRole('button', { name: 'Remove "Page A" from inbox' }).click(),
    clickToolbarButton({ id: tabId, url: 'https://example.com/c', title: 'Page C' }),
  ]);
  await expect.poll(inboxUrls).toEqual(['https://example.com/b', 'https://example.com/c']);
  await expect(inbox.getByText('2 to sort')).toBeVisible();

  await inbox.getByRole('button', { name: 'Move "Page B" to a slot' }).click();
  await inbox.getByRole('group', { name: 'Move to' }).getByRole('button', { name: 'Work' }).click();

  await expect.poll(inboxUrls).toEqual(['https://example.com/c']);
  const workUrls = await worker.evaluate(async () => {
    const { homeros_bookmarks } = await chrome.storage.local.get('homeros_bookmarks');
    return homeros_bookmarks[0].links.map((l: { url: string }) => l.url);
  });
  expect(workUrls).toEqual(['https://example.com/b']);
  await expect(page.getByRole('link', { name: 'Page B' })).toBeVisible();
});
