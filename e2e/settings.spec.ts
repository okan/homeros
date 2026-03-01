import { test, expect } from './fixtures/base';

test.describe('Settings', () => {
  test('can open and close settings modal', async ({ page }) => {
    await page.goto('/');

    await page.getByTitle('Settings').click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Appearance')).toBeVisible();
    await expect(page.getByText('Data Management')).toBeVisible();

    await page.getByLabel('Close modal').click();

    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('can toggle dark mode', async ({ page }) => {
    await page.goto('/');

    await page.getByTitle('Settings').click();

    const darkModeButton = page.getByText('Dark Mode').locator('..');
    const wasDark = await page.locator('html.dark').count() > 0;

    await darkModeButton.locator('..').click();

    if (wasDark) {
      await expect(page.locator('html.dark')).toHaveCount(0);
    } else {
      await expect(page.locator('html.dark')).toHaveCount(1);
    }
  });

  test('shows current data summary', async ({ page }) => {
    await page.goto('/');

    await page.getByTitle('Settings').click();

    await expect(page.getByText(/Current data:/)).toBeVisible();
  });

  test('shows export button', async ({ page }) => {
    await page.goto('/');

    await page.getByTitle('Settings').click();

    await expect(page.getByText('Export All Data')).toBeVisible();
  });

  test('shows import option', async ({ page }) => {
    await page.goto('/');

    await page.getByTitle('Settings').click();

    await expect(page.getByText('Import Data')).toBeVisible();
  });

  test('can toggle snippets feature', async ({ page }) => {
    await page.goto('/');

    await page.getByTitle('Settings').click();

    await expect(page.getByText('Text Snippets')).toBeVisible();

    await page.getByText('Text Snippets').locator('..').locator('..').click();

    await page.getByLabel('Close modal').click();

    await expect(page.getByText('Snippets')).toBeVisible();
  });
});
