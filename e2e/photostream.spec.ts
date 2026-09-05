import { expect, test } from './support/picsum';

test.describe('photostream', () => {
  test('renders the first page of photos', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /Random photostream/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Add photo by .+ to favorites/ })).toHaveCount(
      30,
    );
  });

  test('opens a snackbar when a tile is tapped', async ({ page }) => {
    await page.goto('/');

    await page
      .getByRole('button', { name: 'Add photo by Ada Lovelace to favorites' })
      .first()
      .click();

    await expect(page.getByText('Added photo by Ada Lovelace to favorites')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Undo' })).toBeVisible();
  });
});
