import { test, expect } from './fixtures/base';

type Page = import('@playwright/test').Page;

const SAVED_LINKS = [
  { id: 'github', title: 'GitHub', url: 'https://github.com', order: 0 },
  { id: 'mdn', title: 'MDN Docs', url: 'https://developer.mozilla.org', order: 1 },
];

const toolbar = (page: Page) => page.getByRole('toolbar', { name: 'Toolbar' });
const inbox = (page: Page) => page.getByRole('complementary', { name: 'Inbox' });
const moveList = (page: Page) => inbox(page).getByRole('group', { name: 'Move to' });

const storedInboxTitles = (page: Page) =>
  page.evaluate(async () => {
    const result = await chrome.storage.local.get('homeros_inbox');
    return (result.homeros_inbox ?? []).map((link: { title: string }) => link.title);
  });

test.describe('Inbox', () => {
  test('is hidden when nothing is waiting', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Work' })).toBeVisible();

    await expect(inbox(page)).not.toBeVisible();
  });

  test('shows links saved from the toolbar without a reload', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Work' })).toBeVisible();

    await page.evaluate(() =>
      chrome.storage.local.set({
        homeros_inbox: [{ id: 'saved', title: 'Saved Page', url: 'https://example.com', order: 0 }],
      }),
    );

    await expect(inbox(page).getByText('Saved Page')).toBeVisible();
    await expect(inbox(page).getByText('1 to sort')).toBeVisible();
  });

  test.describe('with saved links', () => {
    test.use({
      storageOverride: { homeros_onboarding_completed: true, homeros_inbox: SAVED_LINKS },
    });

    test('shows links waiting to be sorted', async ({ page }) => {
      await page.goto('/');

      await expect(inbox(page).getByText('2 to sort')).toBeVisible();
      await expect(inbox(page).getByRole('link', { name: 'GitHub' })).toBeVisible();
      await expect(inbox(page).getByRole('link', { name: 'MDN Docs' })).toBeVisible();
    });

    test('moves a link into a slot', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Work' }).click();

      await inbox(page).getByRole('button', { name: 'Move "GitHub" to a slot' }).click();
      await moveList(page).getByRole('button', { name: 'Work' }).click();

      await expect(inbox(page).getByText('1 to sort')).toBeVisible();
      await expect(inbox(page).getByRole('link', { name: 'GitHub' })).not.toBeVisible();
      await expect(page.getByRole('link', { name: 'GitHub' })).toBeVisible();
      await expect(page.getByText('Moved to Work')).toBeVisible();
      await expect.poll(() => storedInboxTitles(page)).toEqual(['MDN Docs']);
    });

    test('does not duplicate a link the slot already has', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Work' }).click();
      await expect
        .poll(() =>
          page.evaluate(
            async () => (await chrome.storage.local.get('homeros_bookmarks')).homeros_bookmarks,
          ),
        )
        .toHaveLength(1);
      await page.evaluate(async () => {
        const { homeros_bookmarks } = await chrome.storage.local.get('homeros_bookmarks');
        homeros_bookmarks[0].links.push({
          id: 'existing',
          title: 'GitHub (existing)',
          url: 'https://github.com/',
          order: 0,
        });
        await chrome.storage.local.set({ homeros_bookmarks });
      });
      await expect(page.getByRole('link', { name: 'GitHub (existing)' })).toBeVisible();

      await inbox(page).getByRole('button', { name: 'Move "GitHub" to a slot' }).click();
      await moveList(page).getByRole('button', { name: 'Work' }).click();

      await expect(page.getByText('Already in Work')).toBeVisible();
      await expect.poll(() => storedInboxTitles(page)).toEqual(['MDN Docs']);
      await expect(page.locator('#main-content').getByRole('link')).toHaveCount(1);
    });

    test('closes the slot list after moving and when collapsing', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Work' }).click();

      await inbox(page).getByRole('button', { name: 'Move "MDN Docs" to a slot' }).click();
      await expect(moveList(page)).toBeVisible();
      await inbox(page)
        .getByRole('button', { name: /^Inbox/ })
        .click();
      await inbox(page)
        .getByRole('button', { name: /^Inbox/ })
        .click();
      await expect(moveList(page)).not.toBeVisible();

      await inbox(page).getByRole('button', { name: 'Move "GitHub" to a slot' }).click();
      await moveList(page).getByRole('button', { name: 'Work' }).click();
      await expect(inbox(page).getByText('1 to sort')).toBeVisible();
      await expect(moveList(page)).not.toBeVisible();
    });

    test('removes links and hides once empty', async ({ page }) => {
      await page.goto('/');

      await inbox(page).getByRole('button', { name: 'Remove "GitHub" from inbox' }).click();
      await expect(inbox(page).getByText('1 to sort')).toBeVisible();

      await inbox(page).getByRole('button', { name: 'Remove "MDN Docs" from inbox' }).click();
      await expect(inbox(page)).not.toBeVisible();
      await expect.poll(() => storedInboxTitles(page)).toEqual([]);
    });

    test('asks for a slot when there are none', async ({ page }) => {
      await page.goto('/');

      await inbox(page).getByRole('button', { name: 'Move "GitHub" to a slot' }).click();

      await expect(moveList(page).getByText('Create a slot first')).toBeVisible();
    });

    test('closes the slot list on Escape and outside click', async ({ page }) => {
      await page.goto('/');
      const moveButton = inbox(page).getByRole('button', { name: 'Move "GitHub" to a slot' });

      await moveButton.click();
      await expect(moveList(page)).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(moveList(page)).not.toBeVisible();

      await moveButton.click();
      await expect(moveList(page)).toBeVisible();
      await page.getByText('Welcome to Homeros').click();
      await expect(moveList(page)).not.toBeVisible();
    });

    test('collapses and stays collapsed after reload', async ({ page }) => {
      await page.goto('/');

      await inbox(page)
        .getByRole('button', { name: /^Inbox/ })
        .click();
      await expect(inbox(page).getByText('2 to sort')).toBeVisible();
      await expect(inbox(page).getByRole('link', { name: 'GitHub' })).not.toBeVisible();

      await page.reload();
      await expect(inbox(page).getByText('2 to sort')).toBeVisible();
      await expect(inbox(page).getByRole('link', { name: 'GitHub' })).not.toBeVisible();

      await inbox(page)
        .getByRole('button', { name: /^Inbox/ })
        .click();
      await expect(inbox(page).getByRole('link', { name: 'GitHub' })).toBeVisible();
    });

    test('is hidden in edit mode', async ({ page }) => {
      await page.goto('/');
      await expect(inbox(page)).toBeVisible();

      await toolbar(page).getByRole('button', { name: 'Edit' }).click();
      await expect(inbox(page)).not.toBeVisible();

      await toolbar(page).getByRole('button', { name: 'Done' }).click();
      await expect(inbox(page)).toBeVisible();
    });
  });
});
