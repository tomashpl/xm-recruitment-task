import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideGalleryUi } from '@gallery/ui';

import { PAGE_SIZE, photoListUrl } from '../../shared/photos/picsum';
import { picsumDtoList } from '../../shared/photos/picsum.test-data';
import { PhotoStreamPageComponent } from './photo-stream-page.component';

describe('PhotoStreamPageComponent', () => {
  let fixture: ComponentFixture<PhotoStreamPageComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
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
    expect(fixture.nativeElement.querySelectorAll('button[aria-pressed]').length).toBe(4);
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
    fixture.nativeElement.querySelector('button[aria-pressed]').click();
    expect(spy).toHaveBeenCalledTimes(1);
    snackBar.dismiss();
  });
});
