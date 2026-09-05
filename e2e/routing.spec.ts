import { expect, test } from './support/picsum';

test.describe('routing', () => {
  test('redirects an unknown route back to the stream', async ({ page }) => {
    await page.goto('/nowhere');

    await expect(page.getByRole('heading', { name: /Random photostream/ })).toBeVisible();
    expect(new URL(page.url()).pathname).toBe('/');
  });
});
