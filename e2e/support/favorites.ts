import type { Page } from '@playwright/test';

import { StoredPhoto, storedPhoto } from '../fixtures/photos';

export const FAVORITES_STORAGE_KEY = 'gallery.favorites';

export async function seedFavorites(page: Page, ...ids: string[]): Promise<void> {
  await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [
    FAVORITES_STORAGE_KEY,
    JSON.stringify(ids.map(storedPhoto)),
  ] as const);
}

export function readFavorites(page: Page): Promise<StoredPhoto[] | null> {
  return page.evaluate(key => {
    const raw = localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as StoredPhoto[]);
  }, FAVORITES_STORAGE_KEY);
}
