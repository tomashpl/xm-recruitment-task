import { storedPhoto } from './fixtures/photos';
import { readFavorites, seedFavorites } from './support/favorites';
import { expect, test } from './support/picsum';

const ADA_TILE = /photo by Ada Lovelace/;
const FAVORITES_TAB = /Favorites/;

test.describe('favorites', () => {
  test('shows an empty state and leads back to the stream', async ({ page }) => {
    await page.goto('/favorites');

    await expect(page.getByRole('heading', { name: FAVORITES_TAB })).toBeVisible();
    await expect(
      page.getByText('No favorites yet. Photos you tap in the photostream show up here.'),
    ).toBeVisible();

    await page.getByRole('link', { name: 'Browse photos' }).click();

    await expect(page.getByRole('heading', { name: /Random photostream/ })).toBeVisible();
  });

  test('marks the active tab', async ({ page }) => {
    await page.goto('/favorites');

    await expect(page.getByRole('link', { name: FAVORITES_TAB })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('saves a tapped photo to the header count and to storage', async ({ page }) => {
    await page.goto('/');
    const tile = page.getByRole('button', { name: ADA_TILE }).first();
    await expect(tile).toHaveAttribute('aria-pressed', 'false');

    await tile.click();

    await expect(tile).toHaveAttribute('aria-pressed', 'true');
    await expect(tile).toHaveAccessibleName('Remove photo by Ada Lovelace from favorites');
    await expect(page.getByRole('link', { name: FAVORITES_TAB })).toHaveAccessibleName(/1 saved/);
    expect(await readFavorites(page)).toEqual([storedPhoto('0')]);
  });

  test('lists a saved photo and opens it from the favorites page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: ADA_TILE }).first().click();

    await page.getByRole('link', { name: FAVORITES_TAB }).click();

    const saved = page.getByRole('link', { name: 'Open photo by Ada Lovelace' });
    await expect(saved).toHaveCount(1);

    await saved.click();

    await expect(page).toHaveURL(/\/photos\/0$/);
    await expect(page.getByRole('button', { name: 'Remove from favorites' })).toBeVisible();
  });

  test('keeps a saved photo across a reload', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: ADA_TILE }).first().click();
    await expect(page.getByRole('link', { name: FAVORITES_TAB })).toHaveAccessibleName(/1 saved/);

    await page.reload();

    await expect(page.getByRole('button', { name: ADA_TILE }).first()).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByRole('link', { name: FAVORITES_TAB })).toHaveAccessibleName(/1 saved/);
  });

  test('shows a photo saved before the first visit', async ({ page }) => {
    await seedFavorites(page, '0', '1');

    await page.goto('/favorites');

    await expect(page.getByRole('link', { name: /^Open photo by / })).toHaveCount(2);
    await expect(page.getByRole('link', { name: FAVORITES_TAB })).toHaveAccessibleName(/2 saved/);
  });

  test('removes a saved photo from the stream', async ({ page }) => {
    await seedFavorites(page, '0');
    await page.goto('/');
    const tile = page.getByRole('button', { name: ADA_TILE }).first();
    await expect(tile).toHaveAttribute('aria-pressed', 'true');

    await tile.click();

    await expect(tile).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByText('Removed photo by Ada Lovelace from favorites')).toBeVisible();
    expect(await readFavorites(page)).toEqual([]);
    await expect(page.getByRole('link', { name: FAVORITES_TAB })).not.toHaveAccessibleName(/saved/);

    await page.getByRole('link', { name: FAVORITES_TAB }).click();

    await expect(
      page.getByText('No favorites yet. Photos you tap in the photostream show up here.'),
    ).toBeVisible();
  });

  test('follows a change made in another tab', async ({ page, context }) => {
    await page.goto('/favorites');
    await expect(
      page.getByText('No favorites yet. Photos you tap in the photostream show up here.'),
    ).toBeVisible();

    const other = await context.newPage();
    await other.goto('/');
    await other.getByRole('button', { name: ADA_TILE }).first().click();
    await expect(other.getByRole('link', { name: FAVORITES_TAB })).toHaveAccessibleName(/1 saved/);

    await expect(page.getByRole('link', { name: 'Open photo by Ada Lovelace' })).toBeVisible();
    await expect(page.getByRole('link', { name: FAVORITES_TAB })).toHaveAccessibleName(/1 saved/);

    await other.close();
  });
});
