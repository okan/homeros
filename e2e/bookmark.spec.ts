import { test, expect } from './fixtures/base';

const toolbar = (page: import('@playwright/test').Page) => page.locator('.fixed.top-coarse');

test.describe('Bookmarks', () => {
  test('can enter and exit edit mode', async ({ page }) => {
    await page.goto('/');

    await toolbar(page).getByRole('button', { name: 'Customize' }).click();

    await expect(toolbar(page).getByText('Done')).toBeVisible();
    await expect(page.getByText('Add Slot')).toBeVisible();

    await toolbar(page).getByRole('button', { name: 'Done' }).click();

    await expect(toolbar(page).getByText('Customize')).toBeVisible();
  });

  test('can add a new slot', async ({ page }) => {
    await page.goto('/');

    await toolbar(page).getByRole('button', { name: 'Customize' }).click();
    await page.getByRole('button', { name: 'Add Slot' }).click();

    await page.getByPlaceholder('Slot name').fill('My Slot');
    await page.locator('#main-content form').getByRole('button', { name: 'Add' }).click();

    await expect(page.getByRole('heading', { name: 'My Slot' })).toBeVisible();
  });

  test('can add a link to a slot', async ({ page }) => {
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

    await expect(page.getByText('GitHub')).toBeVisible();
  });

  test('can delete a slot', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Work' }).click();

    await expect(page.getByRole('heading', { name: 'Work' })).toBeVisible();

    await toolbar(page).getByRole('button', { name: 'Customize' }).click();

    const slotHeader = page.locator('#main-content .group').filter({ hasText: 'Work' });
    await slotHeader.hover();

    const actionButtons = slotHeader.locator('div.flex.gap-fine button');
    await actionButtons.nth(1).click();

    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByRole('heading', { name: 'Work' })).not.toBeVisible();
  });

  test('cancel adding a slot reverts form', async ({ page }) => {
    await page.goto('/');

    await toolbar(page).getByRole('button', { name: 'Customize' }).click();
    await page.getByRole('button', { name: 'Add Slot' }).click();

    await expect(page.getByPlaceholder('Slot name')).toBeVisible();

    const cancelButton = page.locator('form button').filter({ has: page.locator('.lucide-x') });
    await cancelButton.click();

    await expect(page.getByPlaceholder('Slot name')).not.toBeVisible();
    await expect(page.getByText('Add Slot')).toBeVisible();
  });
});
