import { test as base, expect } from '@playwright/test';
import { createChromeMockScript } from './chrome-mock';

const DEFAULT_STORAGE: Record<string, unknown> = {
  homeros_onboarding_completed: true,
};

export const test = base.extend<{ storageOverride: Record<string, unknown> | null }>({
  storageOverride: [null, { option: true }],

  page: async ({ page, storageOverride }, use) => {
    const storage = storageOverride ?? DEFAULT_STORAGE;
    await page.addInitScript({
      content: createChromeMockScript(storage),
    });
    await use(page);
  },
});

export { expect };
