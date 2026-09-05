import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideGalleryUi } from '@gallery/ui';

import { MOCK_PHOTOS } from '../../shared/fixtures/mock-photos';
import { PhotoStreamPageComponent } from './photo-stream-page.component';

describe('PhotoStreamPageComponent', () => {
  let fixture: ComponentFixture<PhotoStreamPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoStreamPageComponent],
      providers: [provideZonelessChangeDetection(), provideGalleryUi()],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoStreamPageComponent);
    await fixture.whenStable();
  });

  it('labels the section by its heading', () => {
    const section: HTMLElement = fixture.nativeElement.querySelector('section');
    const heading: HTMLElement = fixture.nativeElement.querySelector('h2');
    expect(section.getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('renders one tile per fixture photo', () => {
    expect(fixture.nativeElement.querySelectorAll('app-photo-tile').length).toBe(MOCK_PHOTOS.length);
  });

  it('renders every tile as a toggle button, not a link', () => {
    expect(fixture.nativeElement.querySelectorAll('button[aria-pressed]').length).toBe(MOCK_PHOTOS.length);
  });

  it('shows the loading indicator beneath the grid', () => {
    expect(fixture.nativeElement.querySelector('ui-loading-indicator')).not.toBeNull();
  });

  it('opens a snackbar when a tile is activated', () => {
    const snackBar = TestBed.inject(MatSnackBar);
    const spy = spyOn(snackBar, 'openFromComponent').and.callThrough();
    fixture.nativeElement.querySelector('button[aria-pressed]').click();
    expect(spy).toHaveBeenCalledTimes(1);
    snackBar.dismiss();
  });
});
