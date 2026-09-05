import { expect, test } from './support/picsum';

test.describe('scroll restoration', () => {
  test('restores the accumulated pages and the scroll offset', async ({ page, picsum }) => {
    picsum.setTotalPages(2);
    await page.goto('/');
    await page.locator('app-stream-sentinel').scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: /to favorites/ })).toHaveCount(60);

    await page.evaluate(() => window.scrollTo(0, 1500));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
    const before = await page.evaluate(() => window.scrollY);

    await page.getByRole('link', { name: /Favorites/ }).click();
    await expect(page.getByRole('heading', { name: /Favorites/ })).toBeVisible();

    await page.getByRole('link', { name: 'Browse photos' }).click();

    await expect(page.getByRole('button', { name: /to favorites/ })).toHaveCount(60);
    await expect
      .poll(() => page.evaluate(() => window.scrollY), { timeout: 10_000 })
      .toBeGreaterThan(before - 200);

    const restored = await page.evaluate(() => window.scrollY);
    expect(restored).toBeGreaterThan(before - 200);
    expect(restored).toBeLessThan(before + 200);
  });
});
