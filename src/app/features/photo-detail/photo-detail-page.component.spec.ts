import { Location } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideGalleryUi } from '@gallery/ui';

import { FAVORITES_STORAGE_KEY } from '../../shared/favorites/favorites';
import { FavoritesStore } from '../../shared/favorites/favorites.store';
import { GRID_IMAGE_WIDTH, photoInfoUrl } from '../../shared/photos/picsum';
import { picsumDto } from '../../shared/photos/picsum.test-data';
import { PhotoDetailPageComponent } from './photo-detail-page.component';

describe('PhotoDetailPageComponent', () => {
  let harness: RouterTestingHarness;
  let httpMock: HttpTestingController;

  const element = (selector: string): HTMLElement | null =>
    harness.routeNativeElement!.querySelector(selector);

  async function open(id: string): Promise<void> {
    await harness.navigateByUrl(`/photos/${id}`, PhotoDetailPageComponent);
    harness.detectChanges();
  }

  async function resolve(id: string, dto = picsumDto({ id })): Promise<void> {
    httpMock.expectOne(photoInfoUrl(id)).flush(dto);
    await harness.fixture.whenStable();
  }

  async function reject(id: string, status: number): Promise<void> {
    httpMock.expectOne(photoInfoUrl(id)).flush(null, { status, statusText: 'Error' });
    await harness.fixture.whenStable();
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter(
          [{ path: 'photos/:id', component: PhotoDetailPageComponent }],
          withComponentInputBinding(),
        ),
        provideGalleryUi(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    harness = await RouterTestingHarness.create();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
  });

  it('requests the photo named by the route', async () => {
    await open('564');
    const request = httpMock.expectOne(photoInfoUrl('564'));
    expect(request.request.method).toBe('GET');
    request.flush(picsumDto({ id: '564' }));
  });

  it('shows a single photo rather than a grid', async () => {
    await open('564');
    await resolve('564');
    expect(element('app-photo-stage')).not.toBeNull();
    expect(element('app-photo-grid')).toBeNull();
  });

  it('shows the author returned by the api', async () => {
    await open('564');
    await resolve('564', picsumDto({ id: '564', author: 'Ada Lovelace' }));
    expect(element('app-photo-meta')!.textContent).toContain('Ada Lovelace');
  });

  it('shows a loading indicator while the request is in flight', async () => {
    await open('564');
    expect(element('ui-loading-indicator')).not.toBeNull();
    expect(element('app-photo-stage')).toBeNull();
    httpMock.expectOne(photoInfoUrl('564')).flush(picsumDto({ id: '564' }));
  });

  it('reports an unknown photo rather than an error', async () => {
    await open('does-not-exist');
    await reject('does-not-exist', 404);
    expect(element('ui-empty-state')!.textContent).toContain('does not exist');
    expect(element('app-photo-stage')).toBeNull();
  });

  it('offers a retry for any other failure', async () => {
    await open('564');
    await reject('564', 500);
    const emptyState = element('ui-empty-state')!;
    expect(emptyState.textContent).toContain('Could not load this photo');
    expect(emptyState.querySelector('button')).not.toBeNull();
  });

  it('issues a second request when the retry is pressed', async () => {
    await open('564');
    await reject('564', 500);
    const emptyState = element('ui-empty-state')!;
    emptyState.querySelector('button')!.click();
    harness.detectChanges();
    httpMock.expectOne(photoInfoUrl('564')).flush(picsumDto({ id: '564' }));
    await harness.fixture.whenStable();
    expect(element('app-photo-stage')).not.toBeNull();
    expect(element('ui-empty-state')).toBeNull();
  });

  it('requests a different photo for a different route id', async () => {
    await open('1');
    await resolve('1');
    const firstSrc = element('img')!.getAttribute('src');

    await open('2');
    await resolve('2');
    expect(element('img')!.getAttribute('src')).not.toBe(firstSrc);
  });

  it('offers to add a photo that is not a favorite yet', async () => {
    await open('564');
    await resolve('564');
    const button = element('ui-button button')!;
    expect(button.textContent).toContain('Add to favorites');
  });

  it('saves the photo when the button is pressed', async () => {
    await open('564');
    await resolve('564');
    element('ui-button button')!.click();
    await harness.fixture.whenStable();

    const store = TestBed.inject(FavoritesStore);
    expect(store.isFavorite('564')).toBeTrue();
    expect(store.photos()[0].width).toBe(GRID_IMAGE_WIDTH);
    expect(element('ui-button button')!.textContent).toContain('Remove from favorites');
    TestBed.inject(MatSnackBar).dismiss();
  });

  it('removes a photo it already holds', async () => {
    await open('564');
    await resolve('564');
    element('ui-button button')!.click();
    await harness.fixture.whenStable();
    element('ui-button button')!.click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(FavoritesStore).count()).toBe(0);
    expect(element('ui-button button')!.textContent).toContain('Add to favorites');
    TestBed.inject(MatSnackBar).dismiss();
  });

  it('puts the back control ahead of the author', async () => {
    await open('564');
    await resolve('564');
    const header = element('.app-page__header')!;
    const children = Array.from(header.children).map(child => child.tagName.toLowerCase());
    expect(children.indexOf('ui-icon-button')).toBe(0);
    expect(children.indexOf('ui-icon-button')).toBeLessThan(children.indexOf('app-photo-meta'));
  });

  it('keeps the header row as tall as it would be without the back control', async () => {
    await open('564');
    await resolve('564');
    const header = element('.app-page__header')!;
    const back: HTMLElement = header.querySelector('ui-icon-button')!;
    const tallestSibling = Math.max(
      ...Array.from(header.children)
        .filter(child => child !== back)
        .map(child => child.getBoundingClientRect().height),
    );

    expect(back.getBoundingClientRect().height).toBeLessThanOrEqual(tallestSibling);
    expect(header.getBoundingClientRect().height).toBe(tallestSibling);
  });

  it('walks the history back when the back control is pressed', async () => {
    await open('564');
    await resolve('564');
    const spy = spyOn(TestBed.inject(Location), 'back');
    element('button[aria-label="Go back"]')!.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('names the section for assistive technology without showing a visible heading', async () => {
    await open('564');
    await resolve('564');
    const heading = element('h2')!;
    expect(heading.textContent!.trim()).toBe('Single photo');
    expect(heading.classList).toContain('visually-hidden');
  });
});
