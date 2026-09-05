import { storedPhoto } from './fixtures/photos';
import { readFavorites, seedFavorites } from './support/favorites';
import { expect, test } from './support/picsum';

test.describe('photo detail', () => {
  test('renders a photo addressed directly by id', async ({ page }) => {
    await page.goto('/photos/0');

    await expect(page.getByText('Ada Lovelace')).toBeVisible();
    await expect(page.getByRole('img', { name: 'photo by Ada Lovelace' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible();
  });

  test('reports a photo that does not exist', async ({ page }) => {
    await page.goto('/photos/99999');

    await expect(page.getByText('That photo does not exist.')).toBeVisible();
  });

  test('recovers from a failed load when the retry is pressed', async ({ page }) => {
    await page.route('**/picsum.photos/id/1/info', route =>
      route.fulfill({
        status: 500,
        headers: { 'access-control-allow-origin': '*' },
        body: 'unavailable',
      }),
    );

    await page.goto('/photos/1');

    await expect(
      page.getByText('Could not load this photo. Check your connection and try again.'),
    ).toBeVisible();

    await page.unroute('**/picsum.photos/id/1/info');
    await page.getByRole('button', { name: 'Try again' }).click();

    await expect(page.getByText('Grace Hopper')).toBeVisible();
  });

  test('saves the photo to favorites from the detail page', async ({ page }) => {
    await page.goto('/photos/0');

    await page.getByRole('button', { name: 'Add to favorites' }).click();

    await expect(page.getByText('Added photo by Ada Lovelace to favorites')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Remove from favorites' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Favorites/ })).toHaveAccessibleName(/1 saved/);
    expect(await readFavorites(page)).toEqual([storedPhoto('0')]);
  });

  test('removes the photo and keeps the focus on the toggle', async ({ page }) => {
    await seedFavorites(page, '0');
    await page.goto('/photos/0');

    const toggle = page.getByRole('button', { name: 'Remove from favorites' });
    await toggle.focus();
    await page.keyboard.press('Enter');

    await expect(page.getByRole('button', { name: 'Add to favorites' })).toBeFocused();
    await expect(page.getByText('Removed photo by Ada Lovelace from favorites')).toBeVisible();
    expect(await readFavorites(page)).toEqual([]);
  });
});
