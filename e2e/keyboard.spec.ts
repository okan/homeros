import { test, expect } from './fixtures/base';

const todoPanel = (page: import('@playwright/test').Page) =>
  page.locator('.fixed.top-0.right-0.h-full');

const toolbar = (page: import('@playwright/test').Page) =>
  page.locator('.fixed.top-coarse');

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#main-content').click();
  });

  test('Cmd/Ctrl+K opens search overlay', async ({ page }) => {
    await page.keyboard.press('Meta+k');

    await expect(page.getByPlaceholder('Search bookmarks...')).toBeVisible();
  });

  test('Cmd/Ctrl+E toggles edit mode', async ({ page }) => {
    await page.keyboard.press('Meta+e');

    await expect(toolbar(page).getByText('Done')).toBeVisible();

    await page.keyboard.press('Meta+e');

    await expect(toolbar(page).getByText('Edit')).toBeVisible();
  });

  test('Cmd/Ctrl+T toggles todo panel', async ({ page }) => {
    await page.keyboard.press('Meta+t');

    await expect(todoPanel(page)).toHaveClass(/translate-x-0/);

    await page.keyboard.press('Meta+t');

    await expect(todoPanel(page)).toHaveClass(/translate-x-full/);
  });

  test('Escape closes search overlay', async ({ page }) => {
    await page.keyboard.press('Meta+k');
    await expect(page.getByPlaceholder('Search bookmarks...')).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(page.getByPlaceholder('Search bookmarks...')).not.toBeVisible();
  });

  test('Escape closes settings modal', async ({ page }) => {
    await page.getByTitle('Settings').click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
