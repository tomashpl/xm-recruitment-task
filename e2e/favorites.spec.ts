import { expect, test } from './support/picsum';

test.describe('favorites', () => {
  test('shows an empty state and leads back to the stream', async ({ page }) => {
    await page.goto('/favorites');

    await expect(page.getByRole('heading', { name: /Favorites/ })).toBeVisible();
    await expect(
      page.getByText('No favorites yet. Photos you tap in the photostream show up here.'),
    ).toBeVisible();

    await page.getByRole('link', { name: 'Browse photos' }).click();

    await expect(page.getByRole('heading', { name: /Random photostream/ })).toBeVisible();
  });

  test('marks the active tab', async ({ page }) => {
    await page.goto('/favorites');

    await expect(page.getByRole('link', { name: /Favorites/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('redirects an unknown route back to the stream', async ({ page }) => {
    await page.goto('/nowhere');

    await expect(page.getByRole('heading', { name: /Random photostream/ })).toBeVisible();
    expect(new URL(page.url()).pathname).toBe('/');
  });
});
