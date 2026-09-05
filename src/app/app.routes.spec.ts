import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';
import { FavoritesPageComponent } from './features/favorites/favorites-page.component';
import { PhotoDetailPageComponent } from './features/photo-detail/photo-detail-page.component';
import { PhotoStreamPageComponent } from './features/photo-stream/photo-stream-page.component';

describe('routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes, withComponentInputBinding()),
      ],
    });
  });

  it('renders the photo stream at the root path', async () => {
    const harness = await RouterTestingHarness.create();
    expect(await harness.navigateByUrl('/', PhotoStreamPageComponent)).toBeInstanceOf(
      PhotoStreamPageComponent,
    );
  });

  it('renders the favorites page at /favorites', async () => {
    const harness = await RouterTestingHarness.create();
    expect(await harness.navigateByUrl('/favorites', FavoritesPageComponent)).toBeInstanceOf(
      FavoritesPageComponent,
    );
  });

  it('renders the detail page at /photos/:id', async () => {
    const harness = await RouterTestingHarness.create();
    expect(await harness.navigateByUrl('/photos/abc', PhotoDetailPageComponent)).toBeInstanceOf(
      PhotoDetailPageComponent,
    );
  });

  it('redirects an unknown path to the photo stream', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/nowhere');
    expect(TestBed.inject(Router).url).toBe('/');
  });
});
