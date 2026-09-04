import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MOCK_PHOTOS } from '../../../shared/fixtures/mock-photos';
import { PhotoThumbComponent } from './photo-thumb.component';

describe('PhotoThumbComponent', () => {
  let fixture: ComponentFixture<PhotoThumbComponent>;
  const image = (): HTMLImageElement => fixture.nativeElement.querySelector('img');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoThumbComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoThumbComponent);
    fixture.componentRef.setInput('photo', MOCK_PHOTOS[0]);
    await fixture.whenStable();
  });

  it('points the image at the photo url', () => {
    expect(image().getAttribute('src')).toBe(MOCK_PHOTOS[0].url);
  });

  it('carries the alternative text from the photo', () => {
    expect(image().getAttribute('alt')).toBe(MOCK_PHOTOS[0].alt);
  });

  it('loads lazily so long grids stay cheap', () => {
    expect(image().getAttribute('loading')).toBe('lazy');
  });

  it('adds the scrim only when the overlay is requested', async () => {
    expect(fixture.nativeElement.querySelector('.app-photo-thumb__scrim')).toBeNull();
    fixture.componentRef.setInput('overlay', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.app-photo-thumb__scrim')).not.toBeNull();
  });
});
