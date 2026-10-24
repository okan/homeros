import { test, expect, chromium } from '@playwright/test';
import type { BrowserContext, Page, Worker } from '@playwright/test';
import { execSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
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

type TabInfo = { id: number; url: string; title: string; incognito?: boolean };

const actionTitle = (tabId: number) =>
  worker.evaluate((id) => chrome.action.getTitle({ tabId: id }), tabId);

const storedSlotNames = () =>
  worker.evaluate(async () => {
    const { homeros_bookmarks } = await chrome.storage.local.get('homeros_bookmarks');
    return (homeros_bookmarks ?? []).map((slot: { name: string }) => slot.name).sort();
  });

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

// Pages left open would keep reacting to (and writing) storage during the next test
test.afterEach(async () => {
  await Promise.all(context.pages().map((page) => page.close()));
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

test('drops sign-in tokens and credentials from saved pages', async () => {
  const tabId = await openTab('https://example.com/reset');

  await clickToolbarButton({
    id: tabId,
    url: 'https://user:secret@example.com/reset?lang=tr&token=abc#access_token=x&state=y',
    title: 'Reset',
  });

  await expect.poll(inboxUrls).toEqual(['https://example.com/reset?lang=tr#state=y']);
});

test('strips invisible characters from page titles', async () => {
  const tabId = await openTab('https://example.com/title');

  await clickToolbarButton({
    id: tabId,
    url: 'https://example.com/title',
    title: '‮Garanti​ BBVA - Giriş',
  });

  await expect
    .poll(readInbox)
    .toEqual([expect.objectContaining({ title: 'Garanti BBVA - Giriş' })]);
});

test('does not save pages from Incognito windows', async () => {
  const tabId = await openTab('https://example.com/private');

  await clickToolbarButton({
    id: tabId,
    url: 'https://example.com/private',
    title: 'Private',
    incognito: true,
  });

  await expect.poll(() => badgeText(tabId)).toBe('✕');
  expect(await actionTitle(tabId)).toBe("Pages from Incognito windows aren't saved");
  expect(await readInbox()).toEqual([]);
});

test('does not save pages with very long addresses', async () => {
  const tabId = await openTab('https://example.com/long');

  await clickToolbarButton({
    id: tabId,
    url: `https://example.com/long#${'a'.repeat(1_900_000)}`,
    title: 'Long',
  });

  await expect.poll(() => badgeText(tabId)).toBe('✕');
  expect(await actionTitle(tabId)).toBe("This page's address is too long to save");
  expect(await readInbox()).toEqual([]);
});

test('stops saving once the inbox is full', async () => {
  await worker.evaluate(() =>
    chrome.storage.local.set({
      homeros_inbox: Array.from({ length: 200 }, (_, i) => ({
        id: `l${i}`,
        title: `Link ${i}`,
        url: `https://example.com/${i}`,
        order: i,
      })),
    }),
  );
  const tabId = await openTab('https://example.com/one-more');

  await clickToolbarButton({ id: tabId, url: 'https://example.com/one-more', title: 'More' });

  await expect.poll(() => badgeText(tabId)).toBe('✕');
  expect(await actionTitle(tabId)).toContain('inbox is full');
  expect(await readInbox()).toHaveLength(200);
});

test('edits made at the same moment in two new tab pages are both kept', async () => {
  await worker.evaluate(() =>
    chrome.storage.local.set({
      homeros_bookmarks: [{ id: 'base', name: 'Base', icon: 'Folder', order: 0, links: [] }],
    }),
  );
  const pages = [await openNewTabPage(), await openNewTabPage()];
  const names = ['Work', 'Reading'];

  // Get both "Add Slot" forms ready once the saved slots have loaded, then submit them together
  for (const [index, page] of pages.entries()) {
    await expect(page.getByRole('heading', { name: 'Base' })).toBeVisible();
    await page
      .getByRole('toolbar', { name: 'Toolbar' })
      .getByRole('button', { name: 'Edit' })
      .click();
    await page.getByRole('button', { name: 'Add Slot' }).click();
    await page.getByPlaceholder('Slot name').fill(names[index]);
  }
  await Promise.all(
    // Clicked from inside the pages, so both land within a few milliseconds
    pages.map((page) =>
      page.evaluate(() =>
        [...document.querySelectorAll<HTMLButtonElement>('#main-content form button')]
          .find((button) => button.textContent?.trim() === 'Add')
          ?.click(),
      ),
    ),
  );

  await expect.poll(storedSlotNames).toEqual(['Base', 'Reading', 'Work']);
  for (const page of pages) {
    for (const name of ['Base', 'Work', 'Reading']) {
      await expect(page.getByRole('heading', { name })).toBeVisible();
    }
  }
});

test('an edit made before the page finished loading is saved', async () => {
  type HeldWindow = Window & { __releaseRead?: () => void };
  const page = await context.newPage();
  // Hold the first bookmarks read until the test releases it, so the click lands mid-load
  await page.addInitScript(() => {
    const get = chrome.storage.local.get.bind(chrome.storage.local);
    let held = false;
    chrome.storage.local.get = ((keys: string) => {
      if (held || keys !== 'homeros_bookmarks') return get(keys);
      held = true;
      return new Promise((resolve) => {
        (window as HeldWindow).__releaseRead = () => resolve(get(keys));
      });
    }) as typeof chrome.storage.local.get;
  });
  await page.goto(`chrome-extension://${extensionId}/index.html`);
  await expect
    .poll(() => page.evaluate(() => typeof (window as HeldWindow).__releaseRead))
    .toBe('function');

  await page.getByRole('button', { name: 'Work' }).click();
  await page.evaluate(() => (window as HeldWindow).__releaseRead?.());

  await expect.poll(storedSlotNames).toEqual(['Work']);
});

// Guards the promise to existing users: new permissions with an install warning would disable
// the extension on update until they approve it, and wider access raises the risk of every bug
test('manifest only asks for permissions without new install warnings', () => {
  const manifest = JSON.parse(readFileSync(join(distDir, 'manifest.json'), 'utf8'));

  expect(manifest.permissions).toEqual(['storage', 'favicon', 'activeTab', 'contextMenus']);
  for (const key of [
    'host_permissions',
    'optional_permissions',
    'optional_host_permissions',
    'content_scripts',
    'web_accessible_resources',
    'externally_connectable',
    'content_security_policy',
  ]) {
    expect(manifest[key], key).toBeUndefined();
  }
});
