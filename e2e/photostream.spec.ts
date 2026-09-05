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

  test('appends the next page when the sentinel comes into view', async ({ page, picsum }) => {
    picsum.setTotalPages(2);
    await page.goto('/');
    await expect(page.getByRole('button', { name: /to favorites/ })).toHaveCount(30);

    await page.locator('app-stream-sentinel').scrollIntoViewIfNeeded();

    await expect(page.getByRole('button', { name: /to favorites/ })).toHaveCount(60);
  });

  test('announces the end of the collection once no page is left', async ({ page, picsum }) => {
    picsum.setTotalPages(1);
    await page.goto('/');

    await expect(page.getByText('You’ve reached the end of the collection.')).toBeVisible();
    await expect(page.locator('app-stream-sentinel')).toHaveCount(0);
  });
});
