import { expect, test } from './support/picsum';

test.describe('errors', () => {
  test('settles on the fatal empty state after the automatic retries', async ({ page, picsum }) => {
    picsum.failList(500);

    await page.goto('/');

    await expect(
      page.getByText('Could not load photos. Check your connection and try again.'),
    ).toBeVisible({ timeout: 15_000 });
    await expect.poll(() => picsum.listRequests(), { timeout: 15_000 }).toBeGreaterThanOrEqual(4);
  });

  test('recovers when the retry is pressed against a healthy api', async ({ page, picsum }) => {
    picsum.failList(500);
    await page.goto('/');
    await expect(
      page.getByText('Could not load photos. Check your connection and try again.'),
    ).toBeVisible({ timeout: 15_000 });
    await expect.poll(() => picsum.listRequests(), { timeout: 15_000 }).toBeGreaterThanOrEqual(4);

    const settled = picsum.listRequests();
    picsum.healList();
    await page.getByRole('button', { name: 'Try again' }).click();

    await expect(page.getByRole('button', { name: /to favorites/ })).toHaveCount(30);
    expect(picsum.listRequests()).toBeGreaterThan(settled);
  });
  test('keeps the loaded pages when the next page fails', async ({ page, picsum }) => {
    picsum.setTotalPages(2);
    await page.goto('/');
    await expect(page.getByRole('button', { name: /to favorites/ })).toHaveCount(30);

    picsum.failList(500);
    await page.locator('app-stream-sentinel').scrollIntoViewIfNeeded();

    await expect(page.getByText('Could not load more photos.')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /to favorites/ })).toHaveCount(30);
    await expect.poll(() => picsum.listRequests(), { timeout: 15_000 }).toBeGreaterThanOrEqual(5);

    const settled = picsum.listRequests();
    picsum.healList();
    await page.getByRole('button', { name: 'Try again' }).click();

    await expect(page.getByRole('button', { name: /to favorites/ })).toHaveCount(60);
    await expect(page.getByText('Could not load more photos.')).toHaveCount(0);
    expect(picsum.listRequests()).toBeGreaterThan(settled);
  });
});
