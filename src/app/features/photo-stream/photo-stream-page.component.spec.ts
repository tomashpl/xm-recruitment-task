import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideGalleryUi } from '@gallery/ui';

import { PAGE_SIZE, photoListUrl } from '../../shared/photos/picsum';
import { picsumDtoList } from '../../shared/photos/picsum.test-data';
import { GRID_LAYOUT_STORAGE_KEY } from '../../shared/preferences/grid-layout';
import { PhotoStreamPageComponent } from './photo-stream-page.component';

describe('PhotoStreamPageComponent', () => {
  let fixture: ComponentFixture<PhotoStreamPageComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.removeItem(GRID_LAYOUT_STORAGE_KEY);

    await TestBed.configureTestingModule({
      imports: [PhotoStreamPageComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideGalleryUi(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(PhotoStreamPageComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem(GRID_LAYOUT_STORAGE_KEY);
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

  it('opens a snackbar when a tile is activated', async () => {
    await respondWith(2);
    const snackBar = TestBed.inject(MatSnackBar);
    const spy = spyOn(snackBar, 'openFromComponent').and.callThrough();
    fixture.nativeElement.querySelector('app-photo-tile button[aria-pressed]').click();
    expect(spy).toHaveBeenCalledTimes(1);
    snackBar.dismiss();
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
});
