import { test, expect } from './fixtures/base';

test.describe('App', () => {
  test('renders the main layout', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#main-content')).toBeVisible();
    const toolbar = page.locator('.fixed.top-coarse');
    await expect(toolbar.getByText('Edit')).toBeVisible();
  });

  test('shows empty state when no bookmarks exist', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Welcome to Homeros')).toBeVisible();
    await expect(page.getByText('Quick Start')).toBeVisible();
  });

  test.describe('Onboarding', () => {
    test.use({ storageOverride: {} });

    test('shows onboarding carousel on first visit', async ({ page }) => {
      await page.goto('/');

      await expect(page.locator('h2', { hasText: 'Welcome to Homeros' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Skip' })).toBeVisible();
      await expect(page.getByRole('button', { name: /Next/ })).toBeVisible();
    });

    test('can skip onboarding', async ({ page }) => {
      await page.goto('/');

      await page.getByRole('button', { name: 'Skip' }).click();

      await expect(page.getByText('Quick Start')).toBeVisible();
    });

    test('can complete onboarding by navigating all slides', async ({ page }) => {
      await page.goto('/');

      const nextButton = page.getByRole('button', { name: /Next/ });
      for (let i = 0; i < 5; i++) {
        await nextButton.click();
        await page.waitForTimeout(200);
      }

      await page.getByRole('button', { name: /Get Started/ }).click();

      await expect(page.getByText('Quick Start')).toBeVisible();
    });
  });

  test('quick start buttons create slots', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Work' }).click();

    await expect(page.getByRole('heading', { name: 'Work' })).toBeVisible();
  });
});
