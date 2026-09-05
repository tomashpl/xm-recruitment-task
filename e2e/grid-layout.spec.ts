import { expect, test } from './support/picsum';

const STORAGE_KEY = 'gallery.grid-layout';

test.describe('grid layout', () => {
  test('starts on square tiles', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('button', { name: 'Square tiles' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('remembers the masonry choice across a reload', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Original proportions' }).click();

    await expect(page.getByRole('button', { name: 'Original proportions' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).toBe('masonry');

    await page.reload();

    await expect(page.getByRole('button', { name: 'Original proportions' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('honours a layout stored before the first visit', async ({ page }) => {
    await page.addInitScript(key => localStorage.setItem(key, 'masonry'), STORAGE_KEY);

    await page.goto('/');

    await expect(page.getByRole('button', { name: 'Original proportions' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
