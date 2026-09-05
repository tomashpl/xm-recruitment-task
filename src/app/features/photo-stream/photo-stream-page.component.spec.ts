import { ViewportScroller } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, provideRouter } from '@angular/router';
import { SnackbarData, provideGalleryUi } from '@gallery/ui';

import { FAVORITES_STORAGE_KEY } from '../../shared/favorites/favorites';
import { FavoritesStore } from '../../shared/favorites/favorites.store';
import {
  PHOTO_STREAM_RETRY_DELAYS,
  PhotoStreamStore,
} from '../../shared/photos/photo-stream.store';
import { PAGE_SIZE, photoListUrl } from '../../shared/photos/picsum';
import { picsumDtoList, picsumPageHeaders } from '../../shared/photos/picsum.test-data';
import { GRID_LAYOUT_STORAGE_KEY, GridLayoutStore } from '../../shared/preferences/grid-layout';
import {
  INTERSECTION_OBSERVER_FACTORY,
  IntersectionObserverFactory,
} from '../photos/intersection-observer';
import { PhotoStreamPageComponent } from './photo-stream-page.component';

@Component({ selector: 'app-favorites-stub', template: '' })
class FavoritesStubComponent {}

describe('PhotoStreamPageComponent', () => {
  let fixture: ComponentFixture<PhotoStreamPageComponent>;
  let httpMock: HttpTestingController;
  let fire: (isIntersecting: boolean) => void;

  const observerFactory: IntersectionObserverFactory = callback => {
    fire = isIntersecting => {
      callback([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver);
    };

    return {
      observe: () => undefined,
      unobserve: () => undefined,
      disconnect: () => undefined,
      takeRecords: () => [],
      root: null,
      rootMargin: '',
      thresholds: [],
    } as unknown as IntersectionObserver;
  };

  beforeEach(async () => {
    fire = () => {
      throw new Error('no sentinel observed');
    };
    localStorage.removeItem(GRID_LAYOUT_STORAGE_KEY);
    localStorage.removeItem(FAVORITES_STORAGE_KEY);

    await TestBed.configureTestingModule({
      animationsEnabled: true,
      imports: [PhotoStreamPageComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideGalleryUi(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'favorites', component: FavoritesStubComponent }]),
        { provide: PHOTO_STREAM_RETRY_DELAYS, useValue: [] },
        { provide: INTERSECTION_OBSERVER_FACTORY, useValue: observerFactory },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(PhotoStreamPageComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem(GRID_LAYOUT_STORAGE_KEY);
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
  });

  async function respondWith(count: number): Promise<void> {
    httpMock.expectOne(photoListUrl(1, PAGE_SIZE)).flush(picsumDtoList(count));
    await fixture.whenStable();
  }

  async function failWith(status: number): Promise<void> {
    httpMock
      .expectOne(photoListUrl(1, PAGE_SIZE))
      .flush(null, { status, statusText: 'Server Error' });
    await fixture.whenStable();
  }

  async function afterPaint(): Promise<void> {
    await new Promise<void>(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
  }

  async function settle(): Promise<void> {
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    TestBed.tick();
  }

  async function deliver(page: number, count: number, nextPage: number | null): Promise<void> {
    httpMock
      .expectOne(photoListUrl(page, PAGE_SIZE))
      .flush(picsumDtoList(count, (page - 1) * PAGE_SIZE), {
        headers: picsumPageHeaders(nextPage),
      });
    await settle();
  }

  const tiles = (): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('app-photo-tile'));

  const items = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('li'));

  const enteringItems = (): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('li.app-enter-fade'));

  it('requests the first page of photos on creation', () => {
    const request = httpMock.expectOne(photoListUrl(1, PAGE_SIZE));
    expect(request.request.method).toBe('GET');
    request.flush(picsumDtoList(0));
  });

  it('labels the section by its heading', async () => {
    await respondWith(3);
    const section: HTMLElement = fixture.nativeElement.querySelector('section');
    const heading: HTMLElement = fixture.nativeElement.querySelector('h2');
    expect(section.getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('renders one tile per photo returned by the api', async () => {
    await respondWith(4);
    expect(fixture.nativeElement.querySelectorAll('app-photo-tile').length).toBe(4);
  });

  it('renders every tile as a toggle button, not a link', async () => {
    await respondWith(4);
    expect(
      fixture.nativeElement.querySelectorAll('app-photo-tile button[aria-pressed]').length,
    ).toBe(4);
  });

  it('fades in the photos of the first page', async () => {
    await respondWith(3);

    expect(enteringItems().length).toBe(3);
  });

  it('does not fade in photos that were already in the store when the page opened', async () => {
    await deliver(1, 3, null);
    fixture.destroy();

    fixture = TestBed.createComponent(PhotoStreamPageComponent);
    fixture.detectChanges();

    expect(tiles().length).toBe(3);
    expect(enteringItems().length).toBe(0);
  });

  it('fades in the photos of a newly appended page', async () => {
    await deliver(1, 3, 2);
    await afterPaint();

    fire(true);
    await settle();
    await deliver(2, 3, null);

    const appended = items().slice(3);
    expect(appended.length).toBe(3);
    expect(appended.every(item => item.classList.contains('app-enter-fade'))).toBeTrue();
  });

  it('shows the loading indicator while the request is in flight', () => {
    expect(fixture.nativeElement.querySelector('ui-loading-indicator')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-photo-grid')).toBeNull();
    httpMock.expectOne(photoListUrl(1, PAGE_SIZE)).flush(picsumDtoList(0));
  });

  it('hides the loading indicator once the photos arrive', async () => {
    await respondWith(2);
    expect(fixture.nativeElement.querySelector('ui-loading-indicator')).toBeNull();
  });

  it('shows a retry affordance instead of the grid when the request fails', async () => {
    await failWith(500);
    expect(fixture.nativeElement.querySelector('app-photo-grid')).toBeNull();
    const emptyState: HTMLElement = fixture.nativeElement.querySelector('ui-empty-state');
    expect(emptyState).not.toBeNull();
    expect(emptyState.textContent).toContain('Could not load photos');
  });

  it('issues a second request when the retry is pressed', async () => {
    await failWith(500);
    fixture.nativeElement.querySelector('ui-empty-state button').click();
    fixture.detectChanges();
    httpMock.expectOne(photoListUrl(1, PAGE_SIZE)).flush(picsumDtoList(1));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('app-photo-tile').length).toBe(1);
  });

  const announced = (spy: jasmine.Spy): SnackbarData =>
    spy.calls.mostRecent().args[1]?.data as SnackbarData;

  it('saves the photo it announces when a tile is activated', async () => {
    await respondWith(2);
    const snackBar = TestBed.inject(MatSnackBar);
    const spy = spyOn(snackBar, 'openFromComponent').and.callThrough();
    fixture.nativeElement.querySelector('app-photo-tile button[aria-pressed]').click();
    await fixture.whenStable();

    expect(TestBed.inject(FavoritesStore).count()).toBe(1);
    expect(announced(spy).message).toBe('Added photo by Author 0 to favorites');
    snackBar.dismiss();
  });

  it('offers no undo it cannot honour', async () => {
    await respondWith(1);
    const snackBar = TestBed.inject(MatSnackBar);
    const spy = spyOn(snackBar, 'openFromComponent').and.callThrough();
    fixture.nativeElement.querySelector('app-photo-tile button[aria-pressed]').click();
    await fixture.whenStable();

    expect(announced(spy).actionLabel).toBeUndefined();
    snackBar.dismiss();
  });

  it('removes a photo it already holds and says so', async () => {
    await respondWith(1);
    const snackBar = TestBed.inject(MatSnackBar);
    const tile = (): HTMLButtonElement =>
      fixture.nativeElement.querySelector('app-photo-tile button[aria-pressed]');
    tile().click();
    await fixture.whenStable();
    const spy = spyOn(snackBar, 'openFromComponent').and.callThrough();
    tile().click();
    await fixture.whenStable();

    expect(TestBed.inject(FavoritesStore).count()).toBe(0);
    expect(announced(spy).message).toBe('Removed photo by Author 0 from favorites');
    snackBar.dismiss();
  });

  it('shows the tile as pressed once the photo is a favorite', async () => {
    await respondWith(1);
    const tile = (): HTMLButtonElement =>
      fixture.nativeElement.querySelector('app-photo-tile button[aria-pressed]');
    expect(tile().getAttribute('aria-pressed')).toBe('false');
    tile().click();
    await fixture.whenStable();
    expect(tile().getAttribute('aria-pressed')).toBe('true');
    TestBed.inject(MatSnackBar).dismiss();
  });

  it('offers the layout toggle beside the heading', async () => {
    await respondWith(3);
    const header: HTMLElement = fixture.nativeElement.querySelector('.app-page__header');
    expect(header.querySelector('app-grid-layout-toggle')).not.toBeNull();
  });

  it('starts in the square layout', async () => {
    await respondWith(3);
    const grid: HTMLElement = fixture.nativeElement.querySelector('app-photo-grid');
    expect(grid.classList).not.toContain('app-photo-grid--masonry');
  });

  it('switches the grid to masonry when the control is pressed', async () => {
    await respondWith(3);
    const masonryButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      'app-grid-layout-toggle button[aria-label="Original proportions"]',
    );

    masonryButton.click();
    await fixture.whenStable();

    const grid: HTMLElement = fixture.nativeElement.querySelector('app-photo-grid');
    expect(grid.classList).toContain('app-photo-grid--masonry');
    expect(masonryButton.getAttribute('aria-pressed')).toBe('true');
  });

  it('remembers the chosen layout', async () => {
    await respondWith(3);
    fixture.nativeElement
      .querySelector('app-grid-layout-toggle button[aria-label="Original proportions"]')
      .click();
    await fixture.whenStable();

    expect(localStorage.getItem(GRID_LAYOUT_STORAGE_KEY)).toBe('masonry');
  });

  it('gives every tile its own ratio in the masonry layout', async () => {
    await respondWith(3);
    fixture.nativeElement
      .querySelector('app-grid-layout-toggle button[aria-label="Original proportions"]')
      .click();
    await fixture.whenStable();

    const controls: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('app-photo-tile button'),
    );
    expect(controls.length).toBe(3);
    for (const control of controls) {
      expect(control.style.aspectRatio).toBe('600 / 400');
    }
  });

  it('shows the sentinel while pages remain', async () => {
    await deliver(1, 3, 2);
    const sentinel: HTMLElement = fixture.nativeElement.querySelector('app-stream-sentinel');
    expect(sentinel).not.toBeNull();
    expect(sentinel.closest('ul')).toBeNull();
  });

  it('replaces the sentinel with an end note on the last page', async () => {
    await deliver(1, 3, null);

    expect(fixture.nativeElement.querySelector('app-stream-sentinel')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('end of the collection');
  });

  it('requests the next page when the sentinel comes into view', async () => {
    await deliver(1, 3, 2);
    await afterPaint();

    fire(true);
    await settle();

    await deliver(2, 3, null);
    expect(tiles().length).toBe(6);
  });

  it('keeps appending pages while the sentinel stays visible', async () => {
    await deliver(1, 3, 2);
    await afterPaint();

    fire(true);
    await settle();

    await deliver(2, 3, 3);
    await deliver(3, 3, null);

    expect(tiles().length).toBe(9);
    expect(fixture.nativeElement.querySelector('app-stream-sentinel')).toBeNull();
  });

  it('keeps the tiles on screen when a later page fails', async () => {
    await deliver(1, 3, 2);
    await afterPaint();

    fire(true);
    await settle();

    httpMock
      .expectOne(photoListUrl(2, PAGE_SIZE))
      .flush(null, { status: 500, statusText: 'Server Error' });
    await settle();

    expect(tiles().length).toBe(3);
    expect(fixture.nativeElement.querySelector('ui-empty-state')).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Could not load more photos',
    );
  });

  it('remembers the scroll position when navigation starts, not when the component is destroyed', async () => {
    await deliver(1, 3, null);
    const scroller = TestBed.inject(ViewportScroller);
    let reads = 0;
    spyOn(scroller, 'getScrollPosition').and.callFake((): [number, number] =>
      reads++ === 0 ? [0, 640] : [0, 0],
    );

    await TestBed.inject(Router).navigateByUrl('/favorites');

    expect(TestBed.inject(PhotoStreamStore).scrollOffset()).toBe(640);
  });

  it('scrolls back to the remembered offset once the grid is on screen', async () => {
    const scroller = TestBed.inject(ViewportScroller);
    const scrollTo = spyOn(scroller, 'scrollToPosition');
    TestBed.inject(PhotoStreamStore).rememberScroll(640);

    await deliver(1, 3, null);

    expect(scrollTo).toHaveBeenCalledWith([0, 640]);
  });

  it('does not scroll when there is nothing remembered', async () => {
    const scrollTo = spyOn(TestBed.inject(ViewportScroller), 'scrollToPosition');

    await deliver(1, 3, null);

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('retries the restore on the next render when the scroll position does not stick', async () => {
    const scroller = TestBed.inject(ViewportScroller);
    let reads = 0;
    spyOn(scroller, 'getScrollPosition').and.callFake((): [number, number] =>
      reads++ === 0 ? [0, 0] : [0, 640],
    );
    const scrollTo = spyOn(scroller, 'scrollToPosition');
    TestBed.inject(PhotoStreamStore).rememberScroll(640);

    await deliver(1, 3, null);
    await settle();

    expect(scrollTo.calls.count()).toBeGreaterThan(1);
    expect(scrollTo).toHaveBeenCalledWith([0, 640]);

    const attemptsOnceStuck = scrollTo.calls.count();
    await settle();
    await settle();

    expect(scrollTo.calls.count()).toBe(attemptsOnceStuck);
  });

  it('does not resume the restore once a second attempt has already settled it', async () => {
    const scroller = TestBed.inject(ViewportScroller);
    const gridLayout = TestBed.inject(GridLayoutStore);
    let reads = 0;
    spyOn(scroller, 'getScrollPosition').and.callFake((): [number, number] => {
      reads++;
      if (reads === 2) {
        gridLayout.set('masonry');
      }
      return [0, 0];
    });
    const scrollTo = spyOn(scroller, 'scrollToPosition');
    TestBed.inject(PhotoStreamStore).rememberScroll(640);

    await deliver(1, 3, null);
    await settle();
    await settle();
    await settle();

    expect(scrollTo.calls.count()).toBe(10);
  });

  it('stops retrying the restore once the attempt budget is exhausted', async () => {
    const scroller = TestBed.inject(ViewportScroller);
    spyOn(scroller, 'getScrollPosition').and.returnValue([0, 0]);
    const scrollTo = spyOn(scroller, 'scrollToPosition');
    TestBed.inject(PhotoStreamStore).rememberScroll(640);

    await deliver(1, 3, null);
    for (let i = 0; i < 8; i++) {
      await settle();
    }

    const exhausted = scrollTo.calls.count();
    await settle();
    await settle();

    expect(scrollTo.calls.count()).toBe(exhausted);
  });
});
