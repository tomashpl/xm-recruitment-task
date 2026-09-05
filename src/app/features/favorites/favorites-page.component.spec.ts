import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideGalleryUi } from '@gallery/ui';

import { FavoritesPageComponent } from './favorites-page.component';

describe('FavoritesPageComponent', () => {
  let fixture: ComponentFixture<FavoritesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoritesPageComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideGalleryUi()],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritesPageComponent);
    await fixture.whenStable();
  });

  it('labels the section by its heading', () => {
    const section: HTMLElement = fixture.nativeElement.querySelector('section');
    const heading: HTMLElement = fixture.nativeElement.querySelector('h2');
    expect(section.getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('shows the empty state while nothing can be favorited yet', () => {
    expect(fixture.nativeElement.querySelector('ui-empty-state')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-photo-grid')).toBeNull();
  });

  it('sends the visitor back to the photostream', () => {
    const cta: HTMLAnchorElement = fixture.nativeElement.querySelector('ui-empty-state a');
    expect(cta.getAttribute('href')).toBe('/');
    expect(cta.textContent).toContain('Browse photos');
  });
});
