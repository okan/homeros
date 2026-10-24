import { test, expect } from './fixtures/base';

type Page = import('@playwright/test').Page;

// Hooks exposed by the chrome.storage mock
type MockWindow = Window & {
  __storageWrites: Record<string, number>;
  __storageGets: string[];
  __storageEventDelay: number;
  __storageGetDelay: Record<string, number>;
};

const toolbar = (page: Page) => page.getByRole('toolbar', { name: 'Toolbar' });

// Simulates another new tab saving bookmarks while this one stays open
const saveFromOutside = (page: Page) =>
  page.evaluate(() =>
    chrome.storage.local.set({
      homeros_bookmarks: [
        {
          id: 'other',
          name: 'Reading',
          icon: 'Bookmark',
          order: 0,
          links: [{ id: 'saved', title: 'Saved Page', url: 'https://example.com', order: 0 }],
        },
      ],
    }),
  );

const storedSlotNames = (page: Page) =>
  page.evaluate(async () => {
    const result = await chrome.storage.local.get('homeros_bookmarks');
    return (result.homeros_bookmarks ?? []).map((slot: { name: string }) => slot.name);
  });

const bookmarkWrites = (page: Page) =>
  page.evaluate(() => (window as unknown as MockWindow).__storageWrites.homeros_bookmarks ?? 0);

const addSlot = async (page: Page, name: string) => {
  await toolbar(page).getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Add Slot' }).click();
  await page.getByPlaceholder('Slot name').fill(name);
  await page.locator('#main-content form').getByRole('button', { name: 'Add' }).click();
};

test.describe('Storage sync', () => {
  test('shows bookmarks saved outside the page without a reload', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Work' })).toBeVisible();

    await saveFromOutside(page);

    await expect(page.getByRole('heading', { name: 'Reading' })).toBeVisible();
    await expect(page.getByText('Saved Page')).toBeVisible();
  });

  test('keeps bookmarks saved outside the page when editing afterwards', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Work' })).toBeVisible();

    await saveFromOutside(page);
    await expect(page.getByRole('heading', { name: 'Reading' })).toBeVisible();

    await addSlot(page, 'My Slot');

    await expect.poll(() => storedSlotNames(page)).toEqual(['Reading', 'My Slot']);
  });

  test('writes each change once', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Work' }).click();
    await expect.poll(() => storedSlotNames(page)).toEqual(['Work']);

    // Give a write-back triggered by the change event time to happen
    await page.waitForTimeout(800);
    expect(await bookmarkWrites(page)).toBe(1);
  });

  test('keeps an edit made before the previous save comes back', async ({ page }) => {
    await page.goto('/');
    // Slow enough that adding the second slot (and saving it) finishes before the first
    // save's change event arrives
    await page.evaluate(() => {
      (window as unknown as MockWindow).__storageEventDelay = 2500;
    });

    await page.getByRole('button', { name: 'Work' }).click();
    await expect.poll(() => bookmarkWrites(page)).toBe(1);

    await addSlot(page, 'My Slot');
    // Past the first save's event and anything it would set off
    await page.waitForTimeout(2500);

    await expect(page.getByRole('heading', { name: 'My Slot' })).toBeVisible();
    expect(await storedSlotNames(page)).toEqual(['Work', 'My Slot']);
    // Reverting to the older save and back again would show up as extra writes
    expect(await bookmarkWrites(page)).toBe(2);
  });

  test.describe('with an inbox already saved', () => {
    test.use({
      storageOverride: {
        homeros_onboarding_completed: true,
        homeros_inbox: [{ id: 'old', title: 'Old Page', url: 'https://example.com/old', order: 0 }],
      },
    });

    test('keeps a change that arrives while the page is still loading', async ({ page }) => {
      await page.addInitScript(() => {
        (window as unknown as MockWindow).__storageGetDelay = { homeros_inbox: 1000 };
      });
      await page.goto('/');
      await expect
        .poll(() =>
          page.evaluate(() =>
            (window as unknown as MockWindow).__storageGets.includes('homeros_inbox'),
          ),
        )
        .toBe(true);

      // Lands after the initial read started but before it returns its older snapshot
      await page.evaluate(() =>
        chrome.storage.local.set({
          homeros_inbox: [
            { id: 'old', title: 'Old Page', url: 'https://example.com/old', order: 0 },
            { id: 'saved', title: 'Saved Page', url: 'https://example.com/new', order: 1 },
          ],
        }),
      );
      await page.waitForTimeout(1500);

      const inbox = page.getByRole('complementary', { name: 'Inbox' });
      await expect(inbox.getByText('2 to sort')).toBeVisible();
      await expect(inbox.getByText('Saved Page')).toBeVisible();
    });
  });
});
