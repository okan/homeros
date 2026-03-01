import { test, expect } from './fixtures/base';

const todoPanel = (page: import('@playwright/test').Page) =>
  page.locator('.fixed.top-0.right-0.h-full');

test.describe('Todo Panel', () => {
  test('can open and close todo panel', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /TODOs/ }).click();
    await expect(todoPanel(page)).toHaveClass(/translate-x-0/);

    await todoPanel(page).locator('button').filter({ has: page.locator('.lucide-x') }).click();
    await expect(todoPanel(page)).toHaveClass(/translate-x-full/);
  });

  test('can add a new todo', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /TODOs/ }).click();
    await expect(todoPanel(page)).toHaveClass(/translate-x-0/);

    await todoPanel(page).getByPlaceholder('Add a new task...').fill('Write E2E tests');
    await todoPanel(page).locator('button[type="submit"]').click();

    await expect(todoPanel(page).getByText('Write E2E tests')).toBeVisible();
  });

  test('can complete a todo', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /TODOs/ }).click();
    await expect(todoPanel(page)).toHaveClass(/translate-x-0/);

    await todoPanel(page).getByPlaceholder('Add a new task...').fill('Completed task');
    await todoPanel(page).locator('button[type="submit"]').click();

    const todoCheckbox = todoPanel(page).locator('button[role="checkbox"]').first();
    await todoCheckbox.click();

    await expect(todoPanel(page).getByText('Completed task')).toHaveClass(/line-through/);
  });

  test('shows empty state when no todos', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /TODOs/ }).click();
    await expect(todoPanel(page)).toHaveClass(/translate-x-0/);

    await expect(todoPanel(page).getByText('No tasks yet.')).toBeVisible();
    await expect(todoPanel(page).getByText('Enjoy your day!')).toBeVisible();
  });

  test('can add todo with deadline', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /TODOs/ }).click();
    await expect(todoPanel(page)).toHaveClass(/translate-x-0/);

    await todoPanel(page).getByPlaceholder('Add a new task...').fill('Task with deadline');
    await todoPanel(page).getByTitle('Add deadline').click();
    await expect(todoPanel(page).locator('input[type="date"]')).toBeVisible();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await todoPanel(page).locator('input[type="date"]').fill(dateStr);

    await todoPanel(page).locator('button[type="submit"]').click();

    await expect(todoPanel(page).getByText('Task with deadline')).toBeVisible();
  });

  test('add button is disabled when input is empty', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /TODOs/ }).click();
    await expect(todoPanel(page)).toHaveClass(/translate-x-0/);

    await expect(todoPanel(page).locator('button[type="submit"]')).toBeDisabled();
  });

  test('can close todo panel by clicking backdrop', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /TODOs/ }).click();
    await expect(todoPanel(page)).toHaveClass(/translate-x-0/);

    await page.locator('.fixed.inset-0.bg-black\\/20').click({ force: true });

    await expect(todoPanel(page)).toHaveClass(/translate-x-full/);
  });
});
