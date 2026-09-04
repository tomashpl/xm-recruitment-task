import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideGalleryUi } from '@gallery/ui';

import { MOCK_FAVORITES } from '../../shared/fixtures/mock-photos';
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

  it('renders one tile per favorite', () => {
    expect(fixture.nativeElement.querySelectorAll('app-photo-tile').length).toBe(MOCK_FAVORITES.length);
  });

  it('renders every favorite as a link to its detail route', () => {
    const hrefs = Array.from<HTMLAnchorElement>(fixture.nativeElement.querySelectorAll('app-photo-tile a'))
      .map(anchor => anchor.getAttribute('href'));
    expect(hrefs).toEqual(MOCK_FAVORITES.map(photo => `/photos/${photo.id}`));
  });

  it('hides the empty state while favorites exist', () => {
    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeNull();
  });

  it('shows the empty state and hides the grid when there are none', async () => {
    fixture.componentInstance['favorites'].set([]);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-empty-state')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-photo-grid')).toBeNull();
  });
});
