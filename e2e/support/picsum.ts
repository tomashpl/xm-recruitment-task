import { test as base, type Route } from '@playwright/test';

import { PAGE_SIZE, TOTAL_PAGES, linkHeader, photoPage } from '../fixtures/photos';

const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

export interface PicsumMock {
  setTotalPages(total: number): void;
  failList(status: number): void;
  healList(): void;
  listRequests(): number;
}

export const test = base.extend<{ picsum: PicsumMock }>({
  picsum: [
    async ({ context }, use) => {
      let totalPages = TOTAL_PAGES;
      let failureStatus: number | null = null;
      let served = 0;

      await context.route('**/fonts.googleapis.com/**', route => route.abort());
      await context.route('**/fonts.gstatic.com/**', route => route.abort());

      await context.route('**/picsum.photos/v2/list*', async (route: Route) => {
        served += 1;

        if (failureStatus !== null) {
          await route.fulfill({
            status: failureStatus,
            headers: { 'access-control-allow-origin': '*' },
            body: 'unavailable',
          });
          return;
        }

        const url = new URL(route.request().url());
        const requested = Number(url.searchParams.get('page') ?? '1');
        const limit = Number(url.searchParams.get('limit') ?? PAGE_SIZE);

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: {
            'access-control-allow-origin': '*',
            'access-control-expose-headers': 'link',
            link: linkHeader(requested, totalPages),
          },
          body: JSON.stringify(photoPage(requested, limit)),
        });
      });

      await context.route('**/picsum.photos/id/*/info', async (route: Route) => {
        const id = new URL(route.request().url()).pathname.split('/')[2];
        const photo = photoPage(1, PAGE_SIZE).find(item => item.id === id);

        await route.fulfill({
          status: photo ? 200 : 404,
          contentType: 'application/json',
          headers: { 'access-control-allow-origin': '*' },
          body: JSON.stringify(photo ?? { error: 'not found' }),
        });
      });

      await context.route(/picsum\.photos\/id\/\d+\/\d+\/\d+/, async (route: Route) => {
        await route.fulfill({
          status: 200,
          contentType: 'image/png',
          headers: { 'access-control-allow-origin': '*' },
          body: TRANSPARENT_PNG,
        });
      });

      await use({
        setTotalPages: total => {
          totalPages = total;
        },
        failList: status => {
          failureStatus = status;
        },
        healList: () => {
          failureStatus = null;
        },
        listRequests: () => served,
      });
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
