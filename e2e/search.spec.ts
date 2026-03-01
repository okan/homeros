import { test, expect } from './fixtures/base';

const toolbar = (page: import('@playwright/test').Page) => page.locator('.fixed.top-coarse');

test.describe('Search', () => {
  test('can open search overlay via button', async ({ page }) => {
    await page.goto('/');

    await page.getByTitle('Search (⌘K)').click();

    await expect(page.getByPlaceholder('Search bookmarks...')).toBeVisible();
  });

  test('shows hint text when search is empty', async ({ page }) => {
    await page.goto('/');

    await page.getByTitle('Search (⌘K)').click();

    await expect(page.getByText('Start typing to search your bookmarks')).toBeVisible();
  });

  test('shows no results message for non-matching query', async ({ page }) => {
    await page.goto('/');

    await page.getByTitle('Search (⌘K)').click();
    await page.getByPlaceholder('Search bookmarks...').fill('xyznonexistent');

    await expect(page.getByText('No results found')).toBeVisible();
  });

  test('can search and find existing bookmarks', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Work' }).click();
    await toolbar(page).getByRole('button', { name: 'Customize' }).click();
    await page.locator('#main-content').getByRole('button', { name: 'Add Link' }).click();

    const modal = page.getByRole('dialog');
    await modal.getByPlaceholder('https://example.com').fill('https://github.com');
    await modal.getByPlaceholder('https://example.com').blur();
    await modal.getByPlaceholder('Title').fill('GitHub');
    await modal.getByRole('button', { name: 'Add Link' }).click();

    await toolbar(page).getByRole('button', { name: 'Done' }).click();

    await page.getByTitle('Search (⌘K)').click();
    await page.getByPlaceholder('Search bookmarks...').fill('GitHub');

    await expect(page.getByText('GitHub').first()).toBeVisible();
    await expect(page.getByText('in Work')).toBeVisible();
  });

  test('can close search with Escape', async ({ page }) => {
    await page.goto('/');

    await page.getByTitle('Search (⌘K)').click();
    await expect(page.getByPlaceholder('Search bookmarks...')).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(page.getByPlaceholder('Search bookmarks...')).not.toBeVisible();
  });

  test('can close search by clicking backdrop', async ({ page }) => {
    await page.goto('/');

    await page.getByTitle('Search (⌘K)').click();
    await expect(page.getByPlaceholder('Search bookmarks...')).toBeVisible();

    await page.locator('.fixed.inset-0.bg-black\\/40').click({ force: true });

    await expect(page.getByPlaceholder('Search bookmarks...')).not.toBeVisible();
  });
});
