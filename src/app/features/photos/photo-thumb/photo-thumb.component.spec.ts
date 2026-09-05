import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { samplePhoto } from '../../../shared/photos/picsum.test-data';
import { PhotoThumbComponent } from './photo-thumb.component';

describe('PhotoThumbComponent', () => {
  let fixture: ComponentFixture<PhotoThumbComponent>;
  const photo = samplePhoto();
  const image = (): HTMLImageElement => fixture.nativeElement.querySelector('img');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoThumbComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoThumbComponent);
    fixture.componentRef.setInput('photo', photo);
    await fixture.whenStable();
  });

  it('points the image at the photo url', () => {
    expect(image().getAttribute('src')).toBe(photo.url);
  });

  it('carries the alternative text from the photo', () => {
    expect(image().getAttribute('alt')).toBe(photo.alt);
  });

  it('loads lazily so long grids stay cheap', () => {
    expect(image().getAttribute('loading')).toBe('lazy');
    expect(image().getAttribute('fetchpriority')).toBeNull();
  });

  it('loads eagerly at high priority when the tile is above the fold', async () => {
    fixture.componentRef.setInput('priority', true);
    await fixture.whenStable();

    expect(image().getAttribute('loading')).toBe('eager');
    expect(image().getAttribute('fetchpriority')).toBe('high');
  });

  it('adds the scrim only when the overlay is requested', async () => {
    expect(fixture.nativeElement.querySelector('.app-photo-thumb__scrim')).toBeNull();
    fixture.componentRef.setInput('overlay', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.app-photo-thumb__scrim')).not.toBeNull();
  });
});
