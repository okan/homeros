import { test, expect } from './fixtures/base';

test.describe('Settings', () => {
  test('can open and close settings modal', async ({ page }) => {
    await page.goto('/');

    await page.getByTitle('Settings').click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Theme' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Data' })).toBeVisible();

    await page.getByLabel('Close modal').click();

    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('can select a preset theme', async ({ page }) => {
    await page.goto('/');

    await page.getByTitle('Settings').click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'stone');

    await page.getByRole('radio', { name: 'Midnight' }).click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'midnight');
    await expect(page.getByRole('radio', { name: 'Midnight' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  test('theme persists across reload', async ({ page }) => {
    await page.goto('/');

    await page.getByTitle('Settings').click();
    await page.getByRole('radio', { name: 'Ocean' }).click();

    await page.reload();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'ocean');
  });

  test('migrates legacy dark mode preference to midnight theme', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'homeros-theme',
        JSON.stringify({ state: { isDarkMode: true }, version: 0 }),
      );
    });

    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'midnight');
  });

  test('can switch toolbar to icon-only mode', async ({ page }) => {
    await page.goto('/');

    const toolbar = page.locator('.fixed.top-coarse');
    await expect(toolbar.getByText('TODOs')).toBeVisible();

    await page.getByTitle('Settings').click();
    await page.getByRole('tab', { name: 'Toolbar' }).click();
    await page.getByRole('button', { name: 'Icon only' }).click();
    await page.getByLabel('Close modal').click();

    await expect(toolbar.getByText('TODOs')).not.toBeVisible();
    await expect(toolbar.getByTitle('TODOs (⌘T)')).toBeVisible();
  });

  test('can hide a toolbar button', async ({ page }) => {
    await page.goto('/');

    const toolbar = page.locator('.fixed.top-coarse');
    await expect(toolbar.getByTitle('Search (⌘K)')).toBeVisible();

    await page.getByTitle('Settings').click();
    await page.getByRole('tab', { name: 'Toolbar' }).click();
    await page.getByRole('checkbox', { name: 'Search' }).uncheck();
    await page.getByLabel('Close modal').click();

    await expect(toolbar.getByTitle('Search (⌘K)')).not.toBeVisible();
    await expect(toolbar.getByTitle('Settings')).toBeVisible();
  });

  test('shows current data summary', async ({ page }) => {
    await page.goto('/');

    await page.getByTitle('Settings').click();
    await page.getByRole('tab', { name: 'Data' }).click();

    await expect(page.getByText(/Current data:/)).toBeVisible();
  });

  test('shows export button', async ({ page }) => {
    await page.goto('/');

    await page.getByTitle('Settings').click();
    await page.getByRole('tab', { name: 'Data' }).click();

    await expect(page.getByText('Export All Data')).toBeVisible();
  });

  test('shows import option', async ({ page }) => {
    await page.goto('/');

    await page.getByTitle('Settings').click();
    await page.getByRole('tab', { name: 'Data' }).click();

    await expect(page.getByText('Import Data')).toBeVisible();
  });

  test('can toggle snippets feature', async ({ page }) => {
    await page.goto('/');

    await page.getByTitle('Settings').click();
    await page.getByRole('tab', { name: 'Features' }).click();

    await expect(page.getByText('Text Snippets')).toBeVisible();

    await page.getByText('Text Snippets').locator('..').locator('..').click();

    await page.getByLabel('Close modal').click();

    await expect(page.getByText('Snippets')).toBeVisible();
  });
});
